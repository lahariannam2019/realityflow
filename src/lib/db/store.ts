import {
  Property,
  Enquiry,
  LeadAnalysis,
  LeadActivity,
  SiteVisit,
  StaffProfile,
  Notification,
} from '../types';
import { INITIAL_PROPERTIES, INITIAL_ENQUIRIES } from '../data/demo-properties';

// Demo analyses used exclusively for optional development seeding
const DEMO_ANALYSES: LeadAnalysis[] = [
  {
    id: 'la-1',
    enquiry_id: 'e1111111-1111-1111-1111-111111111111',
    extracted_budget: '18-20 Crores',
    extracted_location: 'Jubilee Hills',
    extracted_property_type: 'villa',
    extracted_bhk: '5BHK',
    extracted_timeline: 'immediate',
    extracted_requirements: ['ready for possession', 'site visit Saturday morning'],
    visit_intent: true,
    visit_intent_detail: 'requested an in-person site visit this Saturday morning',
    classification: 'HIGH',
    classification_reason: 'Classified HIGH because the customer stated a specific budget (18-20 Crores), specified an immediate relocation timeline, requested an in-person site visit this Saturday, and matched a luxury Jubilee Hills listing.',
    signals: {
      has_specific_budget: true,
      has_specific_location: true,
      has_clear_timeline: true,
      requirements_specificity: 'high',
      urgency_detected: true,
      visit_requested: true,
      completeness: 'high',
    },
    summary: 'High-intent luxury buyer with ₹18-20 Cr budget requesting an urgent Saturday site visit for The Celestial Estate.',
    score: 95,
    analysis_version: 'phase2-v1',
    analysis_status: 'completed',
    analyzed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'la-2',
    enquiry_id: 'e2222222-2222-2222-2222-222222222222',
    extracted_budget: '5 Cr',
    extracted_location: 'Kokapet',
    extracted_property_type: 'apartment',
    extracted_bhk: '4BHK',
    extracted_timeline: 'exploring handover timeline',
    extracted_requirements: ['approved pre-loan HDFC', 'maintenance charges'],
    visit_intent: false,
    visit_intent_detail: null,
    classification: 'MEDIUM',
    classification_reason: 'Classified MEDIUM because the buyer has an approved loan and specific budget (₹5 Cr) for Kokapet, but is currently requesting informational clarification with no immediate visit scheduled.',
    signals: {
      has_specific_budget: true,
      has_specific_location: true,
      has_clear_timeline: false,
      requirements_specificity: 'medium',
      urgency_detected: false,
      visit_requested: false,
      completeness: 'medium',
    },
    summary: 'Pre-approved buyer interested in Kokapet 4BHK; asking for maintenance terms and possession timeline.',
    score: 65,
    analysis_version: 'phase2-v1',
    analysis_status: 'completed',
    analyzed_at: new Date(Date.now() - 1000 * 60 * 170).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'la-3',
    enquiry_id: 'e3333333-3333-3333-3333-333333333333',
    extracted_budget: 'Up to 3.5 Crores',
    extracted_location: 'Financial District / Gachibowli',
    extracted_property_type: 'apartment',
    extracted_bhk: '3 or 4 BHK',
    extracted_timeline: '3 to 6 months',
    extracted_requirements: ['premium luxury apartment', 'possession within 3-6 months'],
    visit_intent: false,
    visit_intent_detail: null,
    classification: 'MEDIUM',
    classification_reason: 'Classified MEDIUM because the customer provided clear budget and location preferences, but the timeline is 3-6 months out and no visit was requested.',
    signals: {
      has_specific_budget: true,
      has_specific_location: true,
      has_clear_timeline: true,
      requirements_specificity: 'medium',
      urgency_detected: false,
      visit_requested: false,
      completeness: 'medium',
    },
    summary: 'Qualified buyer seeking 3-4 BHK in Financial District/Gachibowli up to ₹3.5 Cr within 3-6 months.',
    score: 60,
    analysis_version: 'phase2-v1',
    analysis_status: 'completed',
    analyzed_at: new Date(Date.now() - 1000 * 60 * 410).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
  }
];

export const DEFAULT_STAFF: StaffProfile[] = [
  {
    id: 's1111111-1111-1111-1111-111111111111',
    email: 'agent@urbannest.in',
    full_name: 'Vikramaditya Rao',
    role: 'admin',
    phone: '+91 98490 11001',
    is_active: true,
  },
  {
    id: 's2222222-2222-2222-2222-222222222222',
    email: 'priya.sharma@urbannest.in',
    full_name: 'Priya Sharma',
    role: 'manager',
    phone: '+91 98490 22002',
    is_active: true,
  },
  {
    id: 's3333333-3333-3333-3333-333333333333',
    email: 'rahul.verma@urbannest.in',
    full_name: 'Rahul Verma',
    role: 'agent',
    phone: '+91 98490 33003',
    is_active: true,
  },
];

// Global singleton in Node to preserve state across API routes during dev
declare global {
  // eslint-disable-next-line no-var
  var __realityflow_properties: Property[] | undefined;
  // eslint-disable-next-line no-var
  var __realityflow_enquiries: Enquiry[] | undefined;
  // eslint-disable-next-line no-var
  var __realityflow_analyses: LeadAnalysis[] | undefined;
  // eslint-disable-next-line no-var
  var __realityflow_activities: LeadActivity[] | undefined;
  // eslint-disable-next-line no-var
  var __realityflow_visits: SiteVisit[] | undefined;
  // eslint-disable-next-line no-var
  var __realityflow_staff: StaffProfile[] | undefined;
  // eslint-disable-next-line no-var
  var __realityflow_notifications: Notification[] | undefined;
}

// Clean production slate: Enquiries, analyses, activities, and visits start EMPTY.
// Fake/demo data is strictly decoupled.
if (!global.__realityflow_properties) {
  global.__realityflow_properties = JSON.parse(JSON.stringify(INITIAL_PROPERTIES));
}

if (!global.__realityflow_enquiries) {
  global.__realityflow_enquiries = [];
}

if (!global.__realityflow_analyses) {
  global.__realityflow_analyses = [];
}

if (!global.__realityflow_activities) {
  global.__realityflow_activities = [];
}

if (!global.__realityflow_visits) {
  global.__realityflow_visits = [];
}

if (!global.__realityflow_staff) {
  global.__realityflow_staff = JSON.parse(JSON.stringify(DEFAULT_STAFF));
}

if (!global.__realityflow_notifications) {
  global.__realityflow_notifications = [];
}

export const getStoreProperties = (): Property[] => {
  return global.__realityflow_properties || [];
};

export const setStoreProperties = (props: Property[]) => {
  global.__realityflow_properties = props;
};

export const getStoreEnquiries = (): Enquiry[] => {
  return global.__realityflow_enquiries || [];
};

export const setStoreEnquiries = (enquiries: Enquiry[]) => {
  global.__realityflow_enquiries = enquiries;
};

export const getStoreAnalyses = (): LeadAnalysis[] => {
  return global.__realityflow_analyses || [];
};

export const setStoreAnalyses = (analyses: LeadAnalysis[]) => {
  global.__realityflow_analyses = analyses;
};

export const getStoreActivities = (): LeadActivity[] => {
  return global.__realityflow_activities || [];
};

export const setStoreActivities = (activities: LeadActivity[]) => {
  global.__realityflow_activities = activities;
};

export const getStoreVisits = (): SiteVisit[] => {
  return global.__realityflow_visits || [];
};

export const setStoreVisits = (visits: SiteVisit[]) => {
  global.__realityflow_visits = visits;
};

export const getStoreStaff = (): StaffProfile[] => {
  return global.__realityflow_staff || [];
};

export const setStoreStaff = (staff: StaffProfile[]) => {
  global.__realityflow_staff = staff;
};

export const getStoreNotifications = (): Notification[] => {
  return global.__realityflow_notifications || [];
};

export const setStoreNotifications = (notifs: Notification[]) => {
  global.__realityflow_notifications = notifs;
};

/**
 * Optional Development/Demo Seeder for in-memory store
 */
export const seedStoreWithDemoData = () => {
  global.__realityflow_properties = JSON.parse(JSON.stringify(INITIAL_PROPERTIES));
  global.__realityflow_enquiries = JSON.parse(JSON.stringify(INITIAL_ENQUIRIES));
  global.__realityflow_staff = JSON.parse(JSON.stringify(DEFAULT_STAFF));
};

/**
 * Reset in-memory store to clean production state (zero leads, visits, notifications)
 */
export const clearAllStoreTestRecords = () => {
  global.__realityflow_enquiries = [];
  global.__realityflow_analyses = [];
  global.__realityflow_activities = [];
  global.__realityflow_visits = [];
  global.__realityflow_notifications = [];
  global.__realityflow_properties = JSON.parse(JSON.stringify(INITIAL_PROPERTIES));
  global.__realityflow_staff = JSON.parse(JSON.stringify(DEFAULT_STAFF));
};
