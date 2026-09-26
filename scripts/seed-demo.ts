import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { INITIAL_PROPERTIES } from '../src/lib/data/demo-properties';

// Load .env.local without external dotenv dependency
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const DEMO_STAFF_MEMBERS = [
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

async function seedDemo() {
  console.log('=====================================================');
  console.log('REALITYFLOW — OPTIONAL DEMO DATA SEED SCRIPT');
  console.log('=====================================================\n');

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found in .env.local. Demo data available via in-memory store.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Connected to Supabase:', supabaseUrl);

  // 1. Seed Staff Profiles
  console.log('\n1. Seeding Staff Profiles...');
  for (const staff of DEMO_STAFF_MEMBERS) {
    const { error } = await supabase.from('staff_profiles').upsert(staff, { onConflict: 'email' });
    if (error) {
      console.warn(`  - Staff ${staff.email} insert note:`, error.message);
    } else {
      console.log(`  ✓ Seeded staff: ${staff.full_name} (${staff.email})`);
    }
  }

  // 2. Seed Demo Properties
  console.log('\n2. Seeding Properties...');
  for (const prop of INITIAL_PROPERTIES) {
    const propertyPayload = {
      ...prop,
      organization_id: 'org_urbannest_default',
      is_published: true,
      availability: 'available',
      amenities: ['24/7 Security', 'Power Backup', 'Covered Parking', 'Clubhouse'],
      carpet_area_sqft: prop.area_sqft ? Math.round(prop.area_sqft * 0.78) : null,
      facing: 'East',
      furnishing: 'semi-furnished',
    };
    const { error } = await supabase.from('properties').upsert(propertyPayload, { onConflict: 'id' });
    if (error) {
      console.warn(`  - Property ${prop.title} insert note:`, error.message);
    } else {
      console.log(`  ✓ Seeded property: ${prop.title} (₹${(prop.price / 10000000).toFixed(1)} Cr)`);
    }
  }

  console.log('\n=====================================================');
  console.log('DEMO SEED COMPLETE!');
  console.log('Production database remains clean by default.');
  console.log('=====================================================\n');
}

seedDemo().catch(console.error);
