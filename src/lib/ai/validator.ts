import { AIAnalysisOutput, LeadSignals, PriorityClassification } from './types';

export interface ValidationResult {
  valid: boolean;
  data?: AIAnalysisOutput;
  errors?: string[];
}

export function validateAIOutput(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['Output must be a non-null JSON object'] };
  }

  const obj = raw as Record<string, any>;

  // 1. Check classification
  const validClassifications: PriorityClassification[] = ['HIGH', 'MEDIUM', 'LOW'];
  if (!obj.classification || !validClassifications.includes(obj.classification)) {
    errors.push(`classification must be one of: ${validClassifications.join(', ')}`);
  }

  // 2. Check classification_reason
  if (typeof obj.classification_reason !== 'string' || obj.classification_reason.trim().length === 0) {
    errors.push('classification_reason must be a non-empty string');
  }

  // 3. Check summary
  if (typeof obj.summary !== 'string' || obj.summary.trim().length === 0) {
    errors.push('summary must be a non-empty string');
  }

  // 4. Check special_requirements (must be array, never null)
  if (!Array.isArray(obj.special_requirements)) {
    errors.push('special_requirements must be an array of strings');
  } else {
    for (let i = 0; i < obj.special_requirements.length; i++) {
      if (typeof obj.special_requirements[i] !== 'string') {
        errors.push(`special_requirements[${i}] must be a string`);
      }
    }
  }

  // 5. Check visit_intent & visit_intent_detail
  if (typeof obj.visit_intent !== 'boolean') {
    errors.push('visit_intent must be a boolean');
  }

  if (obj.visit_intent_detail !== null && typeof obj.visit_intent_detail !== 'string') {
    errors.push('visit_intent_detail must be string or null');
  }

  // 6. Check nullable string fields
  const nullableStringFields = [
    'budget',
    'preferred_location',
    'property_type',
    'bhk_requirement',
    'buying_timeline',
  ];

  for (const field of nullableStringFields) {
    if (obj[field] !== null && typeof obj[field] !== 'string') {
      errors.push(`${field} must be string or null`);
    }
  }

  // 7. Check signals object
  if (!obj.signals || typeof obj.signals !== 'object' || Array.isArray(obj.signals)) {
    errors.push('signals must be an object');
  } else {
    const s = obj.signals;
    const booleanSignals = [
      'has_specific_budget',
      'has_specific_location',
      'has_clear_timeline',
      'urgency_detected',
      'visit_requested',
    ];
    for (const b of booleanSignals) {
      if (typeof s[b] !== 'boolean') {
        errors.push(`signals.${b} must be a boolean`);
      }
    }

    const validLevels = ['high', 'medium', 'low'];
    if (!validLevels.includes(s.requirements_specificity)) {
      errors.push('signals.requirements_specificity must be "high", "medium", or "low"');
    }
    if (!validLevels.includes(s.completeness)) {
      errors.push('signals.completeness must be "high", "medium", or "low"');
    }
  }

  // 8. Check analysis_version
  if (typeof obj.analysis_version !== 'string' || obj.analysis_version.trim().length === 0) {
    errors.push('analysis_version must be a non-empty string');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const signals: LeadSignals = {
    has_specific_budget: Boolean(obj.signals.has_specific_budget),
    has_specific_location: Boolean(obj.signals.has_specific_location),
    has_clear_timeline: Boolean(obj.signals.has_clear_timeline),
    requirements_specificity: obj.signals.requirements_specificity,
    urgency_detected: Boolean(obj.signals.urgency_detected),
    visit_requested: Boolean(obj.signals.visit_requested),
    completeness: obj.signals.completeness,
  };

  const validatedData: AIAnalysisOutput = {
    budget: obj.budget || null,
    preferred_location: obj.preferred_location || null,
    property_type: obj.property_type || null,
    bhk_requirement: obj.bhk_requirement || null,
    buying_timeline: obj.buying_timeline || null,
    special_requirements: (obj.special_requirements as string[]).map((r) => r.trim()).filter(Boolean),
    visit_intent: Boolean(obj.visit_intent),
    visit_intent_detail: obj.visit_intent_detail || null,
    classification: obj.classification as PriorityClassification,
    classification_reason: obj.classification_reason.trim(),
    signals,
    summary: obj.summary.trim(),
    analysis_version: obj.analysis_version || 'phase2-v1',
    ai_provider: obj.ai_provider,
    ai_model: obj.ai_model,
  };

  return { valid: true, data: validatedData };
}
