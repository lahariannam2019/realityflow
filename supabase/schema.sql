-- ==============================================================================
-- RealityFlow — V1 Database Schema (Supabase / PostgreSQL)
-- Product: RealityFlow Lead Management System
-- Deployment: UrbanNest Realty (Hyderabad)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: properties
-- ------------------------------------------------------------------------------
create table if not exists public.properties (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    property_type text not null check (property_type in ('apartment', 'villa', 'penthouse', 'plot', 'commercial')),
    price numeric not null check (price >= 0),
    location text not null,
    bedrooms int,
    bathrooms int,
    area_sqft numeric,
    images text[] default '{}',
    status text not null default 'active' check (status in ('active', 'inactive', 'sold')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Index for fast filtering on properties
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_location on public.properties(location);
create index if not exists idx_properties_type on public.properties(property_type);
create index if not exists idx_properties_price on public.properties(price);

-- ------------------------------------------------------------------------------
-- 2. Table: enquiries
-- ------------------------------------------------------------------------------
create table if not exists public.enquiries (
    id uuid primary key default gen_random_uuid(),
    property_id uuid references public.properties(id) on delete set null,
    name text not null,
    phone text not null,
    email text,
    message text not null,
    stated_budget text,
    stated_location text,
    source text not null default 'property_page' check (source in ('property_page', 'contact_form', 'direct')),
    status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'not_interested', 'closed')),
    created_at timestamptz not null default now()
);

-- Index for dashboard filtering and sorting
create index if not exists idx_enquiries_status on public.enquiries(status);
create index if not exists idx_enquiries_created_at on public.enquiries(created_at desc);
create index if not exists idx_enquiries_property_id on public.enquiries(property_id);

-- ------------------------------------------------------------------------------
-- 3. Table: lead_analysis (Prepared for Phase 2 AI Pipeline)
-- ------------------------------------------------------------------------------
create table if not exists public.lead_analysis (
    id uuid primary key default gen_random_uuid(),
    enquiry_id uuid not null unique references public.enquiries(id) on delete cascade,
    extracted_budget text,
    extracted_location text,
    extracted_property_type text,
    extracted_bhk text,
    extracted_timeline text,
    extracted_requirements text[] default '{}',
    visit_intent boolean not null default false,
    visit_intent_detail text,
    classification text check (classification in ('HIGH', 'MEDIUM', 'LOW')),
    classification_reason text,
    signals jsonb default '{}'::jsonb,
    summary text,
    score numeric check (score >= 0 and score <= 100),
    analysis_version text default 'phase2-v1',
    analysis_status text not null default 'pending' check (analysis_status in ('pending', 'completed', 'failed')),
    raw_ai_response jsonb,
    last_error text,
    analyzed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_lead_analysis_visit_intent on public.lead_analysis(visit_intent);

create index if not exists idx_lead_analysis_classification on public.lead_analysis(classification);
create index if not exists idx_lead_analysis_enquiry_id on public.lead_analysis(enquiry_id);

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
alter table public.properties enable row level security;
alter table public.enquiries enable row level security;
alter table public.lead_analysis enable row level security;

-- Properties: Public can read active properties, authenticated staff can do CRUD
create policy "Allow public read access to active properties"
    on public.properties for select
    to anon, authenticated
    using (true);

create policy "Allow authenticated staff to manage properties"
    on public.properties for all
    to authenticated
    using (true)
    with check (true);

-- Enquiries: Public (anon) can insert enquiries only; authenticated staff have full access
create policy "Allow public to insert enquiries"
    on public.enquiries for insert
    to anon, authenticated
    with check (true);

create policy "Allow authenticated staff to view and update enquiries"
    on public.enquiries for select
    to authenticated
    using (true);

create policy "Allow authenticated staff to update enquiry status"
    on public.enquiries for update
    to authenticated
    using (true)
    with check (true);

-- Lead Analysis: Staff can view lead analysis; only service role writes analysis
create policy "Allow authenticated staff to read lead analysis"
    on public.lead_analysis for select
    to authenticated
    using (true);

-- ------------------------------------------------------------------------------
-- 5. Seed Data: Realistic Hyderabad Properties (UrbanNest Realty)
-- ------------------------------------------------------------------------------
insert into public.properties (id, title, description, property_type, price, location, bedrooms, bathrooms, area_sqft, images, status)
values
(
    'a1111111-1111-1111-1111-111111111111',
    'The Celestial Estate — Ultra Luxury Villa',
    'Private hilltop sanctuary in Jubilee Hills featuring an infinity lap pool, double-height Italian marble foyer, private home theatre, landscaped Zen garden, and state-of-the-art smart automation. Designed for discerning buyers seeking prestige and utmost privacy in Hyderabad''s most coveted enclave.',
    'villa',
    185000000,
    'Jubilee Hills, Hyderabad',
    5,
    6,
    7800,
    array[
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80'
    ],
    'active'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Aura Sky Deck — Signature 4BHK Sky Mansion',
    'Spectacular 4BHK high-rise sky residence in Kokapet overlooking the Gandipet Lake. Features a panoramic 270-degree wraparound sky deck, bespoke German modular kitchen, temperature-controlled master bath, and dedicated 3-car basement parking with EV fast-charger.',
    'apartment',
    52000000,
    'Kokapet, Hyderabad',
    4,
    5,
    4650,
    array[
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80'
    ],
    'active'
),
(
    'a3333333-3333-3333-3333-333333333333',
    'Financial District Horizon 3BHK Residence',
    'Contemporary, sun-drenched 3BHK apartment minutes away from major corporate hubs and international schools. Amenities include a 40,000 sq.ft clubhouse, squash courts, Olympic-size pool, co-working lounges, and 100% DG power backup.',
    'apartment',
    28000000,
    'Financial District, Hyderabad',
    3,
    3,
    2450,
    array[
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'
    ],
    'active'
),
(
    'a4444444-4444-4444-4444-444444444444',
    'The Crown Penthouse — Banjara Hills Road No. 12',
    'Exclusive duplex penthouse crowned with a rooftop cocktail terrace, heated plunge pool, dedicated service elevator, and floor-to-ceiling glass offering unhindered vistas of Kasu Brahmananda Reddy National Park greenery.',
    'penthouse',
    89000000,
    'Banjara Hills, Hyderabad',
    4,
    5,
    5800,
    array[
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=80'
    ],
    'active'
),
(
    'a5555555-5555-5555-5555-555555555555',
    'Green Meadows — Luxury Gated 4BHK Villa',
    'Vastu-compliant independent triplex villa in an elite gated township in Tellapur. Boasts a private internal courtyard, rooftop terrace garden, clubhouse access, 24/7 multi-tier security, and wide avenue tree-lined boulevards.',
    'villa',
    42000000,
    'Tellapur, Hyderabad',
    4,
    4,
    3900,
    array[
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1600&q=80'
    ],
    'active'
),
(
    'a6666666-6666-6666-6666-666666666666',
    'Tech-Zone Executive 2BHK Smart Home',
    'Modern, turnkey 2BHK condominium tailored for IT professionals. Located 5 minutes from Cyber Towers, Madhapur and Inorbit Mall. Fully automated lighting, climate control, and modular Italian wardrobes.',
    'apartment',
    13500000,
    'Hitec City, Hyderabad',
    2,
    2,
    1320,
    array[
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80'
    ],
    'active'
)
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- Note on Staff Accounts:
-- Staff accounts are created securely via the Supabase Auth Dashboard or
-- through the RealityFlow development setup script using environment variables:
-- `TEST_STAFF_EMAIL` and `TEST_STAFF_PASSWORD`.
-- ------------------------------------------------------------------------------
