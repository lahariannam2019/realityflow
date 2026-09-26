-- ==============================================================================
-- RealityFlow Phase 3 Migration: Production CRM + Real-Time Foundation
-- Product: RealityFlow Lead Intelligence CRM
-- Deployment: UrbanNest Realty (Multi-Tenant Ready Architecture)
-- ==============================================================================

-- 1. Table: staff_profiles
create table if not exists public.staff_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    organization_id varchar(64) not null default 'org_urbannest_default',
    email text not null unique,
    full_name text not null,
    phone text,
    role text not null default 'agent' check (role in ('admin', 'manager', 'agent')),
    is_active boolean not null default true,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_staff_profiles_org on public.staff_profiles(organization_id);
create index if not exists idx_staff_profiles_role on public.staff_profiles(role);

-- 2. Alter Table: enquiries (Expand to 8-stage CRM pipeline & assignment)
-- Drop existing constraint on status if present
alter table public.enquiries drop constraint if exists enquiries_status_check;

-- Add CRM columns
alter table public.enquiries
    add column if not exists organization_id varchar(64) not null default 'org_urbannest_default',
    add column if not exists assigned_to uuid references public.staff_profiles(id) on delete set null,
    add column if not exists assigned_at timestamptz,
    add column if not exists next_follow_up_at timestamptz,
    add column if not exists last_contacted_at timestamptz,
    add column if not exists deal_value numeric check (deal_value >= 0),
    add column if not exists lost_reason text;

-- Standardize status column with 8-stage CRM workflow
alter table public.enquiries
    add constraint enquiries_status_check check (
        status in (
            'NEW',
            'CONTACTED',
            'QUALIFIED',
            'SITE_VISIT_SCHEDULED',
            'SITE_VISIT_COMPLETED',
            'NEGOTIATION',
            'WON',
            'LOST'
        )
    );

create index if not exists idx_enquiries_assigned_to on public.enquiries(assigned_to);
create index if not exists idx_enquiries_followup on public.enquiries(next_follow_up_at);
create index if not exists idx_enquiries_org on public.enquiries(organization_id);

-- 3. Alter Table: properties (Production Catalog)
alter table public.properties
    add column if not exists organization_id varchar(64) not null default 'org_urbannest_default',
    add column if not exists is_published boolean not null default true,
    add column if not exists availability text not null default 'available' check (availability in ('available', 'reserved', 'sold')),
    add column if not exists amenities text[] default '{}',
    add column if not exists carpet_area_sqft numeric,
    add column if not exists facing text,
    add column if not exists furnishing text check (furnishing in ('unfurnished', 'semi-furnished', 'fully-furnished'));

create index if not exists idx_properties_published on public.properties(is_published, status);
create index if not exists idx_properties_org on public.properties(organization_id);

-- 4. Table: lead_activities (Immutable Timeline & Audit Log)
create table if not exists public.lead_activities (
    id uuid primary key default gen_random_uuid(),
    organization_id varchar(64) not null default 'org_urbannest_default',
    enquiry_id uuid not null references public.enquiries(id) on delete cascade,
    staff_id uuid references public.staff_profiles(id) on delete set null,
    activity_type text not null check (activity_type in (
        'note_added',
        'status_changed',
        'assigned',
        'call_logged',
        'whatsapp_sent',
        'email_sent',
        'visit_scheduled',
        'visit_completed',
        'followup_set',
        'reanalyzed'
    )),
    title text not null,
    description text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_lead_activities_enquiry on public.lead_activities(enquiry_id, created_at desc);
create index if not exists idx_lead_activities_staff on public.lead_activities(staff_id);

-- 5. Table: site_visits (Appointments & Outcomes)
create table if not exists public.site_visits (
    id uuid primary key default gen_random_uuid(),
    organization_id varchar(64) not null default 'org_urbannest_default',
    enquiry_id uuid not null references public.enquiries(id) on delete cascade,
    property_id uuid not null references public.properties(id) on delete cascade,
    assigned_staff_id uuid references public.staff_profiles(id) on delete set null,
    scheduled_at timestamptz not null,
    status text not null default 'SCHEDULED' check (status in (
        'SCHEDULED',
        'CONFIRMED',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW'
    )),
    visitor_notes text,
    feedback text,
    rating int check (rating >= 1 and rating <= 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_site_visits_scheduled on public.site_visits(scheduled_at);
create index if not exists idx_site_visits_status on public.site_visits(status);
create index if not exists idx_site_visits_enquiry on public.site_visits(enquiry_id);

-- 6. Table: notifications (Realtime Staff Alerts)
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    organization_id varchar(64) not null default 'org_urbannest_default',
    staff_id uuid references public.staff_profiles(id) on delete cascade,
    type text not null check (type in (
        'new_high_lead',
        'followup_due',
        'site_visit_reminder',
        'lead_assigned',
        'ai_completed'
    )),
    title text not null,
    message text not null,
    link_url text,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_notifications_staff on public.notifications(staff_id, is_read, created_at desc);

-- 7. Row Level Security Policies for Phase 3
alter table public.staff_profiles enable row level security;
alter table public.lead_activities enable row level security;
alter table public.site_visits enable row level security;
alter table public.notifications enable row level security;

-- Staff Profiles: authenticated staff can view profiles; admin can manage
create policy "Allow authenticated staff to read staff profiles"
    on public.staff_profiles for select
    to authenticated
    using (true);

-- Lead Activities: authenticated staff have full read and insert
create policy "Allow authenticated staff to view lead activities"
    on public.lead_activities for select
    to authenticated
    using (true);

create policy "Allow authenticated staff to insert lead activities"
    on public.lead_activities for insert
    to authenticated
    with check (true);

-- Site Visits: authenticated staff have full CRUD
create policy "Allow authenticated staff to manage site visits"
    on public.site_visits for all
    to authenticated
    using (true)
    with check (true);

-- Notifications: staff can only see and mark read their own notifications
create policy "Allow staff to read own notifications"
    on public.notifications for select
    to authenticated
    using (staff_id = auth.uid() or staff_id is null);

create policy "Allow staff to update own notifications"
    on public.notifications for update
    to authenticated
    using (staff_id = auth.uid() or staff_id is null)
    with check (staff_id = auth.uid() or staff_id is null);

-- Enable Supabase Realtime for live changes
alter publication supabase_realtime add table public.enquiries;
alter publication supabase_realtime add table public.lead_analysis;
alter publication supabase_realtime add table public.site_visits;
alter publication supabase_realtime add table public.notifications;
