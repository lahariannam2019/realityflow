export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'plot' | 'commercial';
export type PropertyStatus = 'active' | 'inactive' | 'sold';
export type PropertyAvailability = 'available' | 'reserved' | 'sold';

export interface Property {
  id: string;
  organization_id?: string;
  title: string;
  description: string;
  property_type: PropertyType;
  price: number;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  images: string[];
  status: PropertyStatus;
  is_published?: boolean;
  availability?: PropertyAvailability;
  amenities?: string[];
  carpet_area_sqft?: number | null;
  facing?: string | null;
  furnishing?: 'unfurnished' | 'semi-furnished' | 'fully-furnished' | null;
  created_at: string;
  updated_at: string;
}

// 8-stage CRM Pipeline Statuses (with backward-compatible support for legacy status values)
export type CRMEnquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'SITE_VISIT_SCHEDULED'
  | 'SITE_VISIT_COMPLETED'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type EnquiryStatus =
  | CRMEnquiryStatus
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'not_interested'
  | 'closed';

export type EnquirySource = 'property_page' | 'contact_form' | 'direct' | 'website';
export type PriorityClassification = 'HIGH' | 'MEDIUM' | 'LOW';

export interface StaffProfile {
  id: string;
  user_id?: string;
  organization_id?: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: 'admin' | 'manager' | 'agent';
  is_active: boolean;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ActivityType =
  | 'note_added'
  | 'status_changed'
  | 'assigned'
  | 'call_logged'
  | 'whatsapp_sent'
  | 'email_sent'
  | 'visit_scheduled'
  | 'visit_completed'
  | 'followup_set'
  | 'reanalyzed';

export interface LeadActivity {
  id: string;
  organization_id?: string;
  enquiry_id: string;
  staff_id?: string | null;
  staff?: StaffProfile | null;
  activity_type: ActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export type SiteVisitStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface SiteVisit {
  id: string;
  organization_id?: string;
  enquiry_id: string;
  property_id: string;
  property?: Property | null;
  assigned_staff_id?: string | null;
  assigned_staff?: StaffProfile | null;
  scheduled_at: string;
  status: SiteVisitStatus;
  visitor_notes?: string | null;
  feedback?: string | null;
  rating?: number | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'new_high_lead'
  | 'followup_due'
  | 'site_visit_reminder'
  | 'lead_assigned'
  | 'ai_completed';

export interface Notification {
  id: string;
  organization_id?: string;
  staff_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface LeadSignals {
  has_specific_budget: boolean;
  has_specific_location: boolean;
  has_clear_timeline: boolean;
  requirements_specificity: 'high' | 'medium' | 'low';
  urgency_detected: boolean;
  visit_requested: boolean;
  completeness: 'high' | 'medium' | 'low';
}

export interface AIAnalysisOutput {
  budget: string | null;
  preferred_location: string | null;
  property_type: string | null;
  bhk_requirement: string | null;
  buying_timeline: string | null;
  special_requirements: string[];
  visit_intent: boolean;
  visit_intent_detail: string | null;
  classification: PriorityClassification;
  classification_reason: string;
  signals: LeadSignals;
  summary: string;
  analysis_version: string;
  ai_provider?: 'gemini' | 'deterministic-fallback';
  ai_model?: string;
}

export interface LeadAnalysis {
  id: string;
  enquiry_id: string;
  extracted_budget: string | null;
  extracted_location: string | null;
  extracted_property_type: string | null;
  extracted_bhk: string | null;
  extracted_timeline: string | null;
  extracted_requirements: string[];
  visit_intent: boolean;
  visit_intent_detail: string | null;
  classification: PriorityClassification | null;
  classification_reason: string | null;
  signals: LeadSignals | null;
  summary: string | null;
  score: number | null;
  analysis_version: string;
  analysis_status: 'pending' | 'completed' | 'failed';
  ai_provider?: 'gemini' | 'deterministic-fallback';
  ai_model?: string;
  raw_ai_response?: any;
  last_error?: string | null;
  analyzed_at: string | null;
  created_at: string;
}

export interface Enquiry {
  id: string;
  organization_id?: string;
  property_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  stated_budget: string | null;
  stated_location: string | null;
  source: EnquirySource;
  status: EnquiryStatus;
  assigned_to?: string | null;
  assigned_staff?: StaffProfile | null;
  assigned_at?: string | null;
  next_follow_up_at?: string | null;
  last_contacted_at?: string | null;
  deal_value?: number | null;
  lost_reason?: string | null;
  created_at: string;
  // Joined relations
  property?: Property | null;
  lead_analysis?: LeadAnalysis | null;
  activities?: LeadActivity[];
  visits?: SiteVisit[];
}

export interface PropertyFilterParams {
  type?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  status?: PropertyStatus;
  availability?: PropertyAvailability;
  isPublished?: boolean;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export interface LeadFilterParams {
  status?: EnquiryStatus | 'all';
  priority?: PriorityClassification | 'all';
  assignedTo?: string | 'all' | 'unassigned' | 'me';
  followUpDue?: 'all' | 'overdue' | 'today' | 'upcoming';
  search?: string;
  propertyId?: string;
}

export interface DashboardKPIs {
  totalLeads: number;
  todayLeads: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  followUpsDueToday: number;
  followUpsOverdue: number;
  todayVisits: number;
  statusBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}
