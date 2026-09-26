-- ==============================================================================
-- RealityFlow Phase 2 Migration — AI Lead Engine Extension
-- Adds BHK, visit intent, explainable signals (jsonb), and versioning
-- ==============================================================================

alter table if exists public.lead_analysis 
    add column if not exists extracted_bhk text,
    add column if not exists visit_intent boolean not null default false,
    add column if not exists visit_intent_detail text,
    add column if not exists signals jsonb default '{}'::jsonb,
    add column if not exists analysis_version text default 'phase2-v1',
    add column if not exists raw_ai_response jsonb,
    add column if not exists last_error text;

-- Index for visit intent quick filtering
create index if not exists idx_lead_analysis_visit_intent on public.lead_analysis(visit_intent);
