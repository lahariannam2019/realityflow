import { Property, Enquiry } from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: 'The Celestial Estate — Ultra Luxury Villa',
    description: 'Private hilltop sanctuary in Jubilee Hills featuring an infinity lap pool, double-height Italian marble foyer, private home theatre, landscaped Zen garden, and state-of-the-art smart automation. Designed for discerning buyers seeking prestige and utmost privacy in Hyderabad’s most coveted enclave.',
    property_type: 'villa',
    price: 185000000, // 18.5 Cr
    location: 'Jubilee Hills, Hyderabad',
    bedrooms: 5,
    bathrooms: 6,
    area_sqft: 7800,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    title: 'Aura Sky Deck — Signature 4BHK Sky Mansion',
    description: 'Spectacular 4BHK high-rise sky residence in Kokapet overlooking the Gandipet Lake. Features a panoramic 270-degree wraparound sky deck, bespoke German modular kitchen, temperature-controlled master bath, and dedicated 3-car basement parking with EV fast-charger.',
    property_type: 'apartment',
    price: 52000000, // 5.2 Cr
    location: 'Kokapet, Hyderabad',
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 4650,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    title: 'Financial District Horizon 3BHK Residence',
    description: 'Contemporary, sun-drenched 3BHK apartment minutes away from major corporate hubs and international schools. Amenities include a 40,000 sq.ft clubhouse, squash courts, Olympic-size pool, co-working lounges, and 100% DG power backup.',
    property_type: 'apartment',
    price: 28000000, // 2.8 Cr
    location: 'Financial District, Hyderabad',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2450,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    title: 'The Crown Penthouse — Banjara Hills Road No. 12',
    description: 'Exclusive duplex penthouse crowned with a rooftop cocktail terrace, heated plunge pool, dedicated service elevator, and floor-to-ceiling glass offering unhindered vistas of Kasu Brahmananda Reddy National Park greenery.',
    property_type: 'penthouse',
    price: 89000000, // 8.9 Cr
    location: 'Banjara Hills, Hyderabad',
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 5800,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    title: 'Green Meadows — Luxury Gated 4BHK Villa',
    description: 'Vastu-compliant independent triplex villa in an elite gated township in Tellapur. Boasts a private internal courtyard, rooftop terrace garden, clubhouse access, 24/7 multi-tier security, and wide avenue tree-lined boulevards.',
    property_type: 'villa',
    price: 42000000, // 4.2 Cr
    location: 'Tellapur, Hyderabad',
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 3900,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    title: 'Tech-Zone Executive 2BHK Smart Home',
    description: 'Modern, turnkey 2BHK condominium tailored for IT professionals. Located 5 minutes from Cyber Towers, Madhapur and Inorbit Mall. Fully automated lighting, climate control, and modular Italian wardrobes.',
    property_type: 'apartment',
    price: 13500000, // 1.35 Cr
    location: 'Hitec City, Hyderabad',
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1320,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Rajesh Varma',
    phone: '+91 98490 12345',
    email: 'rajesh.varma@novatech.com',
    message: 'We are looking to relocate our family to Jubilee Hills immediately. Our budget is around 18-20 Crores. Is the Celestial Estate ready for possession and can we schedule an in-person site visit this Saturday morning?',
    stated_budget: '₹18 - ₹20 Cr',
    stated_location: 'Jubilee Hills',
    source: 'property_page',
    status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    property_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Ananya Reddy',
    phone: '+91 97012 34567',
    email: 'ananya.reddy@gmail.com',
    message: 'Interested in the 4BHK Kokapet sky residence. Need clarification on the maintenance charges per sq.ft and handover timeline. We have approved pre-loan from HDFC.',
    stated_budget: '₹5 Cr',
    stated_location: 'Kokapet',
    source: 'property_page',
    status: 'contacted',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    property_id: null,
    name: 'Vikramaditya Rao',
    phone: '+91 91210 98765',
    email: 'v.rao@capitalgroup.in',
    message: 'Seeking a 3 or 4 BHK premium luxury apartment near Financial District or Gachibowli. Preferred possession within 3 to 6 months. Budget flexible up to 3.5 Crores.',
    stated_budget: 'Up to ₹3.5 Cr',
    stated_location: 'Financial District / Gachibowli',
    source: 'contact_form',
    status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(), // 7 hours ago
  }
];
