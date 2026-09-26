import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Share2,
  Phone,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { fetchPropertyById } from '@/lib/db/repository';
import { formatIndianCurrency } from '@/lib/utils';
import EnquiryForm from '@/components/public/EnquiryForm';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Fresh data for demo

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const property = await fetchPropertyById(id);

  if (!property) {
    notFound();
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'];

  const amenities = [
    'Private Swimming Pool',
    '100% DG Power Backup',
    'Smart Automation & Lighting',
    'Bespoke Italian Kitchen',
    'Multi-Tier 24/7 Security',
    'EV Fast-Charging Bays',
    'Air-Conditioned Clubhouse',
    'Landscaped Zen Garden',
  ];

  return (
    <div className="pb-16 bg-stone-50">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Properties</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {property.property_type}
            </span>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {property.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Title and Price Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-stone-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold tracking-wide">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{property.location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900">
              {property.title}
            </h1>
          </div>

          <div className="lg:text-right">
            <span className="text-xs uppercase tracking-widest text-stone-400 block font-medium">
              Offered Price
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {formatIndianCurrency(property.price)}
            </span>
          </div>
        </div>

        {/* High-Resolution Imagery Gallery */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Large Image */}
          <div className="lg:col-span-2 aspect-[16/10] rounded-3xl overflow-hidden shadow-sm bg-stone-100 border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Sub Images / Thumbnails */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {images.slice(1, 3).map((img, idx) => (
              <div
                key={idx}
                className="aspect-[16/10] rounded-2xl overflow-hidden shadow-sm bg-stone-100 border border-stone-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${property.title} preview ${idx + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
            {images.length <= 1 && (
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center text-stone-400 text-xs p-6 text-center">
                <span>Additional architectural floor plans available on private request</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Layout: Details (Left 7 cols) & Sticky Enquiry Form (Right 5 cols) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Specifications & Descriptions */}
          <div className="lg:col-span-7 space-y-10">
            {/* Quick Specs Cards */}
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm text-center">
              {property.bedrooms !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center text-amber-600">
                    <Bed className="w-5 h-5" />
                  </div>
                  <p className="text-base font-bold text-stone-900">{property.bedrooms} BHK</p>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider">Bedrooms</p>
                </div>
              )}
              {property.bathrooms !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center text-amber-600">
                    <Bath className="w-5 h-5" />
                  </div>
                  <p className="text-base font-bold text-stone-900">{property.bathrooms} Baths</p>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider">Bathrooms</p>
                </div>
              )}
              {property.area_sqft !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center text-amber-600">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <p className="text-base font-bold text-stone-900">
                    {property.area_sqft.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider">Super Built-up (sq.ft)</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>About this Residence</span>
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Signature Amenities */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-stone-900">
                Residence & Community Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-xs sm:text-sm text-stone-700">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood & Connectivity */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-stone-900">
                Location & Accessibility Highlights
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-stone-600">
                <p>
                  • <strong>Outer Ring Road (ORR):</strong> Under 8 minutes direct signal-free corridor access.
                </p>
                <p>
                  • <strong>Rajiv Gandhi International Airport (RGIA):</strong> 25–30 minutes via seamless elevated expressway.
                </p>
                <p>
                  • <strong>International Schools:</strong> Oakridge, Chirec, and Sancta Maria within a 5 km radius.
                </p>
                <p>
                  • <strong>Healthcare & Hospitals:</strong> Continental Hospital, AIG, and Care Hospitals in immediate vicinity.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Enquiry Form */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <EnquiryForm
              propertyId={property.id}
              propertyTitle={property.title}
              defaultLocation={property.location}
              source="property_page"
            />

            {/* Need Immediate Support Card */}
            <div className="p-5 rounded-2xl bg-stone-900 text-stone-200 flex items-center justify-between border border-stone-800">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">Prefer a direct call?</p>
                <p className="text-[11px] text-stone-400">Speak with our Hyderabad managing director</p>
              </div>
              <a
                href="tel:+914068001200"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
