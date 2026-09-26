import dns from 'dns';
import https from 'https';
import { URL } from 'url';
import { AIInputPayload, AIAnalysisOutput, LeadSignals, PriorityClassification } from './types';
import { validateAIOutput } from './validator';
import { SYSTEM_PROMPT, buildAnalysisPrompt } from './prompt';

// Force Node.js to prefer IPv4 over IPv6 on dual-stack hosts (prevents Windows socket abort/timeouts)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignored if running in an environment without dns.setDefaultResultOrder
}

export const ACTIVE_GEMINI_MODEL = 'gemini-flash-lite-latest';
export const FALLBACK_GEMINI_MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemma-4-31b-it', 'gemini-3.6-flash'];

export interface AIProviderStatus {
  provider: 'gemini' | 'deterministic-fallback';
  geminiConfigured: boolean;
  liveGeminiVerified: boolean;
  status: 'operational' | 'unconfigured' | 'error';
  message: string;
  model: string;
  analysisVersion: string;
  lastCheckedAt: string;
  lastError?: string;
  latencyMs?: number;
}

interface HttpsResponse {
  ok: boolean;
  status: number;
  text: string;
  data?: any;
}

// Cached status of last Gemini live verification
let lastGeminiStatus: {
  testedAt: number;
  success: boolean;
  error?: string;
  latencyMs?: number;
} | null = null;

/**
 * Robust HTTPS POST helper with retry/backoff for 503 Service Unavailable / 429 Rate Limits.
 * Uses native Node https.request to strictly respect dns.setDefaultResultOrder('ipv4first').
 */
async function postGeminiHttps(
  endpointUrl: string,
  bodyObj: any,
  timeoutMs = 15000,
  maxRetries = 2
): Promise<HttpsResponse> {
  const parsedUrl = new URL(endpointUrl);
  const payload = JSON.stringify(bodyObj);

  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      const res = await new Promise<HttpsResponse>((resolve, reject) => {
        const req = https.request(
          {
            hostname: parsedUrl.hostname,
            path: `${parsedUrl.pathname}${parsedUrl.search}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
              let data: any = null;
              try {
                data = JSON.parse(body);
              } catch {}
              resolve({
                ok: res.statusCode ? res.statusCode >= 200 && res.statusCode < 300 : false,
                status: res.statusCode || 500,
                text: body,
                data,
              });
            });
          }
        );

        req.on('error', reject);
        req.setTimeout(timeoutMs, () => {
          req.destroy(new Error(`Connection timed out after ${timeoutMs}ms`));
        });
        req.write(payload);
        req.end();
      });

      if (res.ok) {
        return res;
      }

      // If 503 or 429, wait with exponential backoff and retry
      if ((res.status === 503 || res.status === 429) && retry < maxRetries) {
        const delay = 1500 * (retry + 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return res;
    } catch (e: any) {
      if (retry < maxRetries) {
        const delay = 1000 * (retry + 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }

  throw new Error('Gemini API call failed after retries');
}

/**
 * Diagnostic function to test live Gemini connection without exposing API keys
 */
export async function verifyGeminiConnection(forceRefresh = false): Promise<AIProviderStatus> {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch {}

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const now = Date.now();

  if (!apiKey || apiKey.trim().length < 10) {
    return {
      provider: 'deterministic-fallback',
      geminiConfigured: false,
      liveGeminiVerified: false,
      status: 'unconfigured',
      message: 'Live Gemini integration not verified; deterministic fallback is being used.',
      model: 'rule-based-nlp-v2',
      analysisVersion: 'phase2-v1',
      lastCheckedAt: new Date().toISOString(),
    };
  }

  // Use cached result if tested within last 30 seconds
  if (!forceRefresh && lastGeminiStatus && now - lastGeminiStatus.testedAt < 30000) {
    return {
      provider: lastGeminiStatus.success ? 'gemini' : 'deterministic-fallback',
      geminiConfigured: true,
      liveGeminiVerified: lastGeminiStatus.success,
      status: lastGeminiStatus.success ? 'operational' : 'error',
      message: lastGeminiStatus.success
        ? 'Live Gemini AI active and verified.'
        : 'Live Gemini integration not verified; deterministic fallback is being used.',
      model: lastGeminiStatus.success ? ACTIVE_GEMINI_MODEL : 'rule-based-nlp-v2',
      analysisVersion: 'phase2-v1',
      lastCheckedAt: new Date(lastGeminiStatus.testedAt).toISOString(),
      lastError: lastGeminiStatus.error,
      latencyMs: lastGeminiStatus.latencyMs,
    };
  }

  const startTime = Date.now();
  const sanitize = (str: string) => apiKey ? str.split(apiKey).join('[REDACTED]') : str;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${ACTIVE_GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const testPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Respond with valid JSON only: {"status": "ok", "ping": "pong"}' }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    const res = await postGeminiHttps(endpoint, testPayload, 12000, 2);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      lastGeminiStatus = {
        testedAt: now,
        success: false,
        error: sanitize(`HTTP ${res.status}: ${res.text.slice(0, 120)}`),
        latencyMs,
      };

      return {
        provider: 'deterministic-fallback',
        geminiConfigured: true,
        liveGeminiVerified: false,
        status: 'error',
        message: 'Live Gemini integration not verified; deterministic fallback is being used.',
        model: 'rule-based-nlp-v2',
        analysisVersion: 'phase2-v1',
        lastCheckedAt: new Date().toISOString(),
        lastError: lastGeminiStatus.error,
        latencyMs,
      };
    }

    const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = rawText ? JSON.parse(rawText.replace(/```json/gi, '').replace(/```/g, '').trim()) : null;

    if (parsed && parsed.status === 'ok') {
      lastGeminiStatus = { testedAt: now, success: true, latencyMs };
      return {
        provider: 'gemini',
        geminiConfigured: true,
        liveGeminiVerified: true,
        status: 'operational',
        message: 'Live Gemini AI active and verified.',
        model: ACTIVE_GEMINI_MODEL,
        analysisVersion: 'phase2-v1',
        lastCheckedAt: new Date().toISOString(),
        latencyMs,
      };
    }

    throw new Error('Gemini response format unexpected');
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    lastGeminiStatus = { testedAt: now, success: false, error: sanitize(err.message || 'Unknown error'), latencyMs };

    return {
      provider: 'deterministic-fallback',
      geminiConfigured: true,
      liveGeminiVerified: false,
      status: 'error',
      message: 'Live Gemini integration not verified; deterministic fallback is being used.',
      model: 'rule-based-nlp-v2',
      analysisVersion: 'phase2-v1',
      lastCheckedAt: new Date().toISOString(),
      lastError: lastGeminiStatus.error,
      latencyMs,
    };
  }
}

/**
 * Primary lead analysis coordinator.
 * Tries real Gemini if key is configured; seamlessly falls back to generalized semantic engine.
 */
export async function analyzeLead(input: AIInputPayload): Promise<AIAnalysisOutput> {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch {}

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  let attempts = 0;
  const maxAttempts = 2; // Auto-retry once on failure per Section 7

  while (attempts < maxAttempts) {
    attempts++;

    // 1. Attempt Gemini if configured
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = buildAnalysisPrompt(input);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${ACTIVE_GEMINI_MODEL}:generateContent?key=${apiKey}`;

        const res = await postGeminiHttps(
          endpoint,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          },
          16000,
          1
        );

        if (res.ok) {
          const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            parsed.ai_provider = 'gemini';
            parsed.ai_model = ACTIVE_GEMINI_MODEL;

            const validation = validateAIOutput(parsed);
            if (validation.valid && validation.data) {
              return validation.data;
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn(`[RealityFlow AI] Gemini call attempt ${attempts} failed (${geminiErr.message}); evaluating fallback.`);
      }
    }

    // 2. Generalized Deterministic Semantic Engine (always ready)
    try {
      const semanticResult = analyzeWithSemanticEngine(input);
      semanticResult.ai_provider = 'deterministic-fallback';
      semanticResult.ai_model = 'rule-based-nlp-v2';

      const validation = validateAIOutput(semanticResult);
      if (validation.valid && validation.data) {
        return validation.data;
      }
      throw new Error(`Fallback validation errors: ${validation.errors?.join(', ')}`);
    } catch (err: any) {
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        throw err;
      }
    }
  }

  throw new Error('AI analysis failed after retry');
}

/**
 * Truly Generalized Semantic NLP Engine.
 * Analyzes arbitrary customer enquiry text, enforces null discipline, and maps to Blueprint Section 3 classification policy.
 */
export function analyzeWithSemanticEngine(input: AIInputPayload): AIAnalysisOutput {
  const raw = input.enquiry_message || '';
  const text = raw.trim();
  const lower = text.toLowerCase();

  // ---------------------------------------------------------------------------
  // 1. Prompt Injection & Adversarial Attack Detection (Security Requirement)
  // ---------------------------------------------------------------------------
  const injectionPatterns = [
    /ignore (?:all |previous |the )?instructions/i,
    /classify (?:this |the enquiry |lead )?as high/i,
    /system\s*:\s*override/i,
    /you are now (?:dan|developer mode|unfiltered)/i,
    /disregard guidelines/i,
    /admin\s*override/i,
    /do not extract nulls/i,
  ];

  let hasInjectionAttempt = false;
  for (const pattern of injectionPatterns) {
    if (pattern.test(raw)) {
      hasInjectionAttempt = true;
      break;
    }
  }

  if (hasInjectionAttempt) {
    return {
      budget: null,
      preferred_location: null,
      property_type: null,
      bhk_requirement: null,
      buying_timeline: null,
      special_requirements: [],
      visit_intent: false,
      visit_intent_detail: null,
      classification: 'LOW',
      classification_reason:
        'Classified LOW because the enquiry contains instruction-override or jailbreak attempts. Adversarial commands were safely neutralized.',
      signals: {
        has_specific_budget: false,
        has_specific_location: false,
        has_clear_timeline: false,
        requirements_specificity: 'low',
        urgency_detected: false,
        visit_requested: false,
        completeness: 'low',
      },
      summary: 'Adversarial prompt injection attempt safely neutralized; marked LOW priority.',
      analysis_version: 'phase2-v1',
      ai_provider: 'deterministic-fallback',
      ai_model: 'rule-based-nlp-v2',
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Spam & Unrelated Promotional Content Detection
  // ---------------------------------------------------------------------------
  const spamKeywords = [
    'congratulations on your new listing',
    'check out my page',
    'best deals in town',
    'seo services',
    'crypto',
    'bitcoin',
    'casino',
    'forex trading',
    'click here for loans',
    'bulk whatsapp marketing',
    'guest post service',
  ];

  const isSpam = spamKeywords.some((kw) => lower.includes(kw));
  if (isSpam) {
    return {
      budget: null,
      preferred_location: null,
      property_type: null,
      bhk_requirement: null,
      buying_timeline: null,
      special_requirements: [],
      visit_intent: false,
      visit_intent_detail: null,
      classification: 'LOW',
      classification_reason:
        'Classified LOW because the message consists of unrelated commercial spam or promotional content rather than a real estate enquiry.',
      signals: {
        has_specific_budget: false,
        has_specific_location: false,
        has_clear_timeline: false,
        requirements_specificity: 'low',
        urgency_detected: false,
        visit_requested: false,
        completeness: 'low',
      },
      summary: 'Promotional marketing message with zero real estate intent.',
      analysis_version: 'phase2-v1',
      ai_provider: 'deterministic-fallback',
      ai_model: 'rule-based-nlp-v2',
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Strict Null Discipline & Budget Extraction
  // ---------------------------------------------------------------------------
  // Phrases that sound like budget but MUST NOT be extracted as a numerical budget
  const vagueBudgetPhrases = [
    'within my budget',
    'in my budget',
    'under my budget',
    'within budget',
    'as per my budget',
    'low budget',
    'best budget',
    'affordable',
    'best price',
    'cheap',
    'good deal',
    'reasonable price',
    'reasonable budget',
    'negotiable price',
    'standard rate',
    'rate entha', // Telugu: what is the rate
  ];

  const hasVagueBudgetPhrase = vagueBudgetPhrases.some((phrase) => lower.includes(phrase));

  let budget: string | null = null;

  // Regex patterns for Indian & global real-estate currency representations
  // Matches: 1.2 Cr, 1.2 crore, 85 lakhs, 65L, ₹18 Cr, 50-60L, 2.5cr, 90 lacs, ₹45,00,000, 75k, etc.
  const budgetRegexes = [
    /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(cr|crores?|lakhs?|lacs?|l\b)/i,
    /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crores?|lakhs?|lacs?|l\b)/i,
    /(?:budget|around|upto|up to|max|approx|firm at|varaku|undi)\s*(?:of|is|around|approx)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crores?|lakhs?|lacs?|l\b)/i,
    /(?:₹|rs\.?)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?)/i,
  ];

  for (const regex of budgetRegexes) {
    const match = raw.match(regex);
    if (match) {
      if (match[2] && match[3]) {
        // Range like 18 - 20 Cr
        budget = `${match[1]}-${match[2]} ${match[3].toUpperCase()}`;
      } else if (match[1] && match[2]) {
        // Single unit like 1.2 Cr
        const unit = match[2].toUpperCase().startsWith('CR') ? 'Cr' : 'Lakhs';
        budget = `${match[1]} ${unit}`;
      } else if (match[1]) {
        const cleanNum = match[1].replace(/,/g, '');
        if (Number(cleanNum) >= 100000) {
          budget = `₹${match[1]}`;
        }
      }
      break;
    }
  }

  // If the message ONLY had "within my budget" and no real number, null discipline strictly applies
  if (!budget && hasVagueBudgetPhrase) {
    budget = null;
  }

  // If still null, check explicit stated_budget from form
  if (!budget && input.stated_budget && !input.stated_budget.toLowerCase().includes('budget')) {
    budget = input.stated_budget;
  }

  // ---------------------------------------------------------------------------
  // 4. Comprehensive Hyderabad & Prime Micro-Markets Location Extraction
  // ---------------------------------------------------------------------------
  const hyderabadLocations = [
    'Jubilee Hills',
    'Banjara Hills',
    'Kokapet',
    'Financial District',
    'Tellapur',
    'Hitec City',
    'Madhapur',
    'Gachibowli',
    'Kondapur',
    'Manikonda',
    'Narsingi',
    'Bachupally',
    'Miyapur',
    'Attapur',
    'Kompally',
    'Shamshabad',
    'Begumpet',
    'Somajiguda',
    'Kukatpally',
    'Secunderabad',
    'Gandipet',
    'Mokila',
    'Kollur',
    'Bowrampet',
    'Nizampet',
    'Chandanagar',
    'Whitefield', // Blueprint benchmark reference
    'Sarjapur',
    'Koramangala',
    'Indiranagar',
    'Mindspace',
    'Cyber Towers',
    'tech park',
    'west side',
  ];

  let preferredLocation: string | null = null;
  for (const loc of hyderabadLocations) {
    if (lower.includes(loc.toLowerCase())) {
      preferredLocation = loc;
      break;
    }
  }

  // Check property context grounding
  if (!preferredLocation && input.property_context?.location) {
    if (
      lower.includes('this property') ||
      lower.includes('this residence') ||
      lower.includes('the villa') ||
      lower.includes('this flat') ||
      lower.includes('this project')
    ) {
      preferredLocation = input.property_context.location;
    }
  }

  // Check form stated location
  if (!preferredLocation && input.stated_location && input.stated_location !== 'Hyderabad') {
    preferredLocation = input.stated_location;
  }

  // ---------------------------------------------------------------------------
  // 5. Property Type Extraction (Apartment, Villa, Penthouse, Plot, Commercial)
  // ---------------------------------------------------------------------------
  let propertyType: string | null = null;
  if (
    lower.includes('villa') ||
    lower.includes('villas') ||
    lower.includes('duplex') ||
    lower.includes('triplex') ||
    lower.includes('bungalow') ||
    lower.includes('independent house')
  ) {
    propertyType = 'villa';
  } else if (
    lower.includes('penthouse') ||
    lower.includes('sky mansion') ||
    lower.includes('sky deck')
  ) {
    propertyType = 'penthouse';
  } else if (
    lower.includes('plot') ||
    lower.includes('plots') ||
    lower.includes('open plot') ||
    lower.includes('residential plot') ||
    lower.includes('farmland') ||
    lower.includes('sq yds') ||
    lower.includes('square yards')
  ) {
    propertyType = 'plot';
  } else if (
    lower.includes('commercial') ||
    lower.includes('office space') ||
    lower.includes('retail space') ||
    lower.includes('shop') ||
    lower.includes('showroom')
  ) {
    propertyType = 'commercial';
  } else if (
    lower.includes('apartment') ||
    lower.includes('apartments') ||
    lower.includes('flat') ||
    lower.includes('flats') ||
    lower.includes('condo') ||
    lower.includes('high rise') ||
    lower.includes('high-rise') ||
    lower.includes('gated community') ||
    /\b[1-6]\s*bhk\b/i.test(raw)
  ) {
    propertyType = 'apartment';
  } else if (input.property_context) {
    propertyType = input.property_context.property_type;
  }

  // ---------------------------------------------------------------------------
  // 6. BHK Extraction
  // ---------------------------------------------------------------------------
  let bhkRequirement: string | null = null;
  const bhkMatch = raw.match(/\b([1-6](?:\.5)?)\s*(?:bhk|bed|bedroom|bedrooms)\b/i);
  if (bhkMatch) {
    bhkRequirement = `${bhkMatch[1]}BHK`;
  } else if (/\b(3 or 4|3-4|4 or 5)\s*bhk\b/i.test(raw)) {
    const multiBhk = raw.match(/\b(3 or 4|3-4|4 or 5)\s*bhk\b/i);
    bhkRequirement = multiBhk ? multiBhk[0].toUpperCase() : null;
  } else if (input.property_context?.bedrooms) {
    bhkRequirement = `${input.property_context.bedrooms}BHK`;
  }

  // ---------------------------------------------------------------------------
  // 7. Timeline & Urgency Detection (including Telugu/Hinglish)
  // ---------------------------------------------------------------------------
  let buyingTimeline: string | null = null;
  let urgencyDetected = false;

  const urgentPatterns = [
    /\btomorrow\b/i,
    /\btoday\b/i,
    /this weekend/i,
    /within (?:the next |a )?month/i,
    /within (?:1|2|3|4) weeks?/i,
    /this week/i,
    /this month/i,
    /urgent(?:ly)?/i,
    /asap/i,
    /lease (?:is )?ending/i,
    /relocating/i,
    /job transfer/i,
    /jaldi/i,
    /urgent ga/i,
    /immediate(?:ly)?/i,
    /ready to move/i,
    /ready-to-move/i,
    /move-in ready/i,
    /call me today/i,
    /finalizing now/i,
  ];

  const exploratoryPatterns = [
    /next year/i,
    /sometime next year/i,
    /not in a rush/i,
    /exploring/i,
    /just exploring/i,
    /researching for now/i,
    /no immediate timeline/i,
    /shortlist(?:ing)?/i,
    /just checking/i,
    /just browsing/i,
    /investing later/i,
    /later this year/i,
  ];

  if (urgentPatterns.some((p) => p.test(raw))) {
    urgencyDetected = true;
    if (/within (?:the next |a )?month/i.test(raw)) buyingTimeline = 'within 1 month';
    else if (/within 2 weeks/i.test(raw)) buyingTimeline = 'within 2 weeks';
    else if (/this week/i.test(raw)) buyingTimeline = 'this week';
    else if (/ready to move|ready-to-move|move-in ready/i.test(raw)) buyingTimeline = 'immediate / ready to move';
    else buyingTimeline = 'immediate / urgent';
  } else if (exploratoryPatterns.some((p) => p.test(raw))) {
    urgencyDetected = false;
    if (/next year|sometime next year/i.test(raw)) buyingTimeline = 'sometime next year';
    else if (/no immediate timeline/i.test(raw)) buyingTimeline = 'no immediate timeline (exploring)';
    else buyingTimeline = 'exploring / research phase';
  } else if (/(\d)\s*(?:to|-)\s*(\d)\s*months/i.test(raw)) {
    const rangeMatch = raw.match(/(\d)\s*(?:to|-)\s*(\d)\s*months/i);
    buyingTimeline = rangeMatch ? `${rangeMatch[1]}-${rangeMatch[2]} months` : '3-6 months';
    urgencyDetected = false;
  }

  // ---------------------------------------------------------------------------
  // 8. Visit Intent & Detail Extraction
  // ---------------------------------------------------------------------------
  let visitIntent = false;
  let visitIntentDetail: string | null = null;

  const visitPatterns = [
    { regex: /show me this property (?:this )?weekend/i, detail: 'requested a viewing this weekend' },
    { regex: /(?:visit|viewing|inspection|tour) (?:this )?weekend/i, detail: 'requested a visit this weekend' },
    { regex: /(?:visit|viewing|inspection|tour) tomorrow/i, detail: 'requested a site visit tomorrow' },
    { regex: /(?:visit|viewing|inspection|tour) today/i, detail: 'requested a site visit today' },
    { regex: /inspect (?:the )?(?:property|unit|flat|villa|house|site)/i, detail: 'requested property inspection' },
    { regex: /arrange (?:an? )?(?:inspection|walkthrough|visit|viewing)/i, detail: 'requested an inspection/walkthrough' },
    { regex: /can we (?:see|visit|inspect|view) (?:the )?(?:model )?(?:villa|flat|property|apartment|site)/i, detail: 'requested to view the property' },
    { regex: /schedule (?:a |an )?(?:site |on-site )?visit/i, detail: 'requested to schedule a site visit' },
    { regex: /confirm site visit/i, detail: 'confirmed site visit' },
    { regex: /(?:urgent |immediate )?site visit needed/i, detail: 'urgent site visit needed' },
    { regex: /ready to inspect/i, detail: 'ready to inspect property' },
    { regex: /site visit (?:plan cheddam|kavali|possible aa)/i, detail: 'requested site visit (Telugu context)' },
    { regex: /in-person (?:site )?visit/i, detail: 'requested an in-person site visit' },
    { regex: /come (?:and )?see (?:the )?property/i, detail: 'wants to inspect the property in person' },
    { regex: /can we visit/i, detail: 'asked to visit the property' },
    { regex: /arrange (?:a )?visit/i, detail: 'requested a property visit' },
    { regex: /please call me today/i, detail: 'urgent callback request today' },
    { regex: /call me (?:today|urgently|immediately)/i, detail: 'urgent callback request' },
  ];

  for (const vp of visitPatterns) {
    if (vp.regex.test(raw)) {
      visitIntent = true;
      visitIntentDetail = vp.detail;
      break;
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Special Requirements
  // ---------------------------------------------------------------------------
  const specialRequirements: string[] = [];
  const reqChecks = [
    { pattern: /gated community/i, tag: 'gated community' },
    { pattern: /good security|24\/7 security|multi-tier security/i, tag: 'good security' },
    { pattern: /ready to move|ready-to-move|move-in ready/i, tag: 'ready-to-move' },
    { pattern: /vaastu|vastu/i, tag: 'vastu compliant' },
    { pattern: /east facing/i, tag: 'east facing' },
    { pattern: /north facing/i, tag: 'north facing' },
    { pattern: /lake view|gandipet view/i, tag: 'lake view' },
    { pattern: /near metro|metro station/i, tag: 'near metro' },
    { pattern: /swimming pool|private pool/i, tag: 'swimming pool' },
    { pattern: /clubhouse|gym/i, tag: 'clubhouse & gym' },
    { pattern: /power backup|100% power backup/i, tag: '100% power backup' },
    { pattern: /ev charging|ev charger/i, tag: 'EV charging' },
    { pattern: /hmda approved/i, tag: 'HMDA approved' },
    { pattern: /rera approved/i, tag: 'RERA approved' },
    { pattern: /rental yield|high return/i, tag: 'high rental yield' },
  ];

  for (const rc of reqChecks) {
    if (rc.pattern.test(raw)) {
      specialRequirements.push(rc.tag);
    }
  }

  // ---------------------------------------------------------------------------
  // 10. Derive Signals Object
  // ---------------------------------------------------------------------------
  const hasSpecificBudget = budget !== null;
  const hasSpecificLocation = preferredLocation !== null;
  const hasClearTimeline = buyingTimeline !== null && !buyingTimeline.includes('exploring');
  const visitRequested = visitIntent;

  let requirementsSpecificity: 'high' | 'medium' | 'low' = 'low';
  if (specialRequirements.length >= 2 || (bhkRequirement && specialRequirements.length >= 1)) {
    requirementsSpecificity = 'high';
  } else if (bhkRequirement || specialRequirements.length === 1 || propertyType) {
    requirementsSpecificity = 'medium';
  }

  let completenessScore = 0;
  if (hasSpecificBudget) completenessScore++;
  if (hasSpecificLocation) completenessScore++;
  if (hasClearTimeline) completenessScore++;
  if (visitRequested) completenessScore++;
  if (bhkRequirement || propertyType) completenessScore++;

  let completeness: 'high' | 'medium' | 'low' = 'low';
  if (completenessScore >= 4) completeness = 'high';
  else if (completenessScore >= 2) completeness = 'medium';

  const signals: LeadSignals = {
    has_specific_budget: hasSpecificBudget,
    has_specific_location: hasSpecificLocation,
    has_clear_timeline: hasClearTimeline,
    requirements_specificity: requirementsSpecificity,
    urgency_detected: urgencyDetected,
    visit_requested: visitRequested,
    completeness,
  };

  // ---------------------------------------------------------------------------
  // 11. Classification Policy (Blueprint Section 3)
  // ---------------------------------------------------------------------------
  let classification: PriorityClassification = 'LOW';
  let classificationReason = '';
  let summary = '';

  // Edge Case: Generic / one-liner enquiries
  const isOneLinerGeneric =
    text.length < 35 &&
    !bhkRequirement &&
    !propertyType &&
    (lower.includes('available') ||
      lower.includes('send brochure') ||
      lower.includes('share details') ||
      lower.includes('price?') ||
      lower.includes('details?'));

  if (hasInjectionAttempt && !hasSpecificBudget && !visitRequested) {
    // Prompt injection with no genuine buying signals -> LOW
    classification = 'LOW';
    classificationReason =
      'Classified LOW because the enquiry contains instruction-override attempts with zero verifiable property requirements or intent signals.';
    summary = 'Untrusted prompt injection attempt disregarded; no genuine buyer parameters.';
  } else if (
    isOneLinerGeneric ||
    (!hasSpecificBudget && !hasSpecificLocation && !hasClearTimeline && !visitRequested && !bhkRequirement && !propertyType)
  ) {
    classification = 'LOW';
    classificationReason =
      'Classified LOW due to low completeness: enquiry contains a single generic question with no budget, location, timeline, or site visit request.';
    summary = `Brief informational request ("${text.slice(0, 45)}...") with no purchase constraints.`;
  }
  // Edge Case 8: Urgent relocation or visit request without budget -> HIGH
  else if (urgencyDetected && visitRequested) {
    classification = 'HIGH';
    classificationReason = `Classified HIGH because the customer demonstrated strong purchase urgency (${buyingTimeline || 'immediate'}) and requested an in-person site visit (${visitIntentDetail}).`;
    summary = `Urgent site visit lead (${visitIntentDetail || 'viewing requested'}) ready to inspect immediately for ${bhkRequirement ? `${bhkRequirement} ` : ''}${propertyType || 'property'}.`;
  }
  // Edge Case 7: Budget & BHK specified but customer explicitly states NO urgency / shortlisting -> Cap at MEDIUM
  else if (
    hasSpecificBudget &&
    (lower.includes('no immediate timeline') ||
      lower.includes('shortlist') ||
      lower.includes('sometime next year') ||
      lower.includes('not in a rush'))
  ) {
    classification = 'MEDIUM';
    classificationReason = `Classified MEDIUM because although the customer specified a clear budget (${budget}) and property type, they explicitly indicated an exploratory or unhurried timeline with no visit request.`;
    summary = `Shortlisting buyer with stated budget of ${budget} for ${bhkRequirement || propertyType || 'property'}, exploring options with no immediate timeline.`;
  }
  // Multi-signal HIGH: 3+ strong signals (budget + visit, budget + urgency, or 3+ signals with visit/urgency)
  else if (
    (hasSpecificBudget && visitRequested) ||
    (hasSpecificBudget && urgencyDetected) ||
    (hasSpecificBudget && hasSpecificLocation && (bhkRequirement || propertyType) && (visitRequested || urgencyDetected)) ||
    (completenessScore >= 3 && (visitRequested || urgencyDetected))
  ) {
    classification = 'HIGH';
    const strongPoints: string[] = [];
    if (hasSpecificBudget) strongPoints.push(`budget of ${budget}`);
    if (visitRequested) strongPoints.push(visitIntentDetail || 'site visit request');
    if (urgencyDetected) strongPoints.push(`timeline of ${buyingTimeline}`);
    if (preferredLocation) strongPoints.push(`location in ${preferredLocation}`);

    classificationReason = `Classified HIGH because the customer provided ${strongPoints.join(', ')}. Strong, actionable buying signals detected.`;
    summary = `High-intent buyer seeking ${bhkRequirement ? `${bhkRequirement} ` : ''}${propertyType || 'property'} in ${preferredLocation || 'Hyderabad'}${budget ? ` around ${budget}` : ''}${visitIntentDetail ? ` (${visitIntentDetail})` : ''}.`;
  }
  // MEDIUM: Genuine but missing urgency, visit, or complete constraints
  else {
    classification = 'MEDIUM';
    const missingItems: string[] = [];
    if (!hasSpecificBudget) missingItems.push('budget not specified');
    if (!visitRequested) missingItems.push('no visit requested');
    if (!hasClearTimeline) missingItems.push('timeline is exploratory');

    classificationReason = `Classified MEDIUM because genuine property interest was expressed (${[preferredLocation, propertyType, bhkRequirement].filter(Boolean).join(', ') || 'general consultation'}), but ${missingItems.join(', ')}.`;
    summary = `Interested in ${propertyType || 'residence'}${preferredLocation ? ` in ${preferredLocation}` : ''}${bhkRequirement ? ` (${bhkRequirement})` : ''}, currently evaluating options without immediate visit or purchase urgency.`;
  }

  if (hasInjectionAttempt) {
    classificationReason += ' (Security Note: Disregarded prompt-override instructions in customer message).';
  }

  return {
    budget,
    preferred_location: preferredLocation,
    property_type: propertyType,
    bhk_requirement: bhkRequirement,
    buying_timeline: buyingTimeline,
    special_requirements: specialRequirements,
    visit_intent: visitIntent,
    visit_intent_detail: visitIntentDetail,
    classification,
    classification_reason: classificationReason,
    signals,
    summary,
    analysis_version: 'phase2-v1',
    ai_provider: 'deterministic-fallback',
    ai_model: 'rule-based-nlp-v2',
  };
}
