import { AIAnalysisOutput, LeadSignals, PriorityClassification } from '../types';

export interface PropertyContext {
  title: string;
  property_type: string;
  price: number;
  location: string;
  bedrooms: number | null;
}

export interface AIInputPayload {
  enquiry_message: string;
  stated_budget: string | null;
  stated_location: string | null;
  customer_name: string;
  enquiry_source: string;
  property_context: PropertyContext | null;
  submitted_at: string;
}

export type { AIAnalysisOutput, LeadSignals, PriorityClassification };
