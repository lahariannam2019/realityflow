import { fetchEnquiryById, saveLeadAnalysis, fetchPropertyById } from '../db/repository';
import { AIInputPayload, PropertyContext } from './types';
import { analyzeLead } from './engine';
import { LeadAnalysis } from '../types';

/**
 * Triggers the AI analysis workflow for a given enquiry ID.
 * Safely persists pending, completed, or failed state without throwing unhandled exceptions.
 */
export async function triggerLeadAnalysis(enquiryId: string): Promise<LeadAnalysis> {
  const enquiry = await fetchEnquiryById(enquiryId);
  if (!enquiry) {
    throw new Error(`Enquiry with ID "${enquiryId}" not found`);
  }

  // 1. Mark analysis as pending
  await saveLeadAnalysis({
    enquiry_id: enquiryId,
    analysis_status: 'pending',
  });

  try {
    // 2. Fetch property context if property_id is present
    let propertyContext: PropertyContext | null = null;
    if (enquiry.property_id) {
      const prop = enquiry.property || (await fetchPropertyById(enquiry.property_id));
      if (prop) {
        propertyContext = {
          title: prop.title,
          property_type: prop.property_type,
          price: prop.price,
          location: prop.location,
          bedrooms: prop.bedrooms,
        };
      }
    }

    // 3. Assemble server-side input payload
    const payload: AIInputPayload = {
      enquiry_message: enquiry.message,
      stated_budget: enquiry.stated_budget,
      stated_location: enquiry.stated_location,
      customer_name: enquiry.name,
      enquiry_source: enquiry.source,
      property_context: propertyContext,
      submitted_at: enquiry.created_at,
    };

    // 4. Run AI Lead Analysis
    const aiOutput = await analyzeLead(payload);

    // 5. Persist completed analysis
    const saved = await saveLeadAnalysis({
      enquiry_id: enquiryId,
      extracted_budget: aiOutput.budget,
      extracted_location: aiOutput.preferred_location,
      extracted_property_type: aiOutput.property_type,
      extracted_bhk: aiOutput.bhk_requirement,
      extracted_timeline: aiOutput.buying_timeline,
      extracted_requirements: aiOutput.special_requirements,
      visit_intent: aiOutput.visit_intent,
      visit_intent_detail: aiOutput.visit_intent_detail,
      classification: aiOutput.classification,
      classification_reason: aiOutput.classification_reason,
      signals: aiOutput.signals,
      summary: aiOutput.summary,
      analysis_version: aiOutput.analysis_version,
      analysis_status: 'completed',
      ai_provider: aiOutput.ai_provider,
      ai_model: aiOutput.ai_model,
      raw_ai_response: aiOutput,
      last_error: null,
      analyzed_at: new Date().toISOString(),
    });

    return saved;
  } catch (err: any) {
    console.error(`[RealityFlow AI] Error analyzing enquiry "${enquiryId}":`, err.message);

    // 6. Graceful failure: record failed status with error message, keeping lead usable
    const failedRecord = await saveLeadAnalysis({
      enquiry_id: enquiryId,
      analysis_status: 'failed',
      last_error: err.message || 'Unknown analysis error',
      analyzed_at: new Date().toISOString(),
    });

    return failedRecord;
  }
}
