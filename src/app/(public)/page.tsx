import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Award, Sparkles, Building, MapPin, Compass, Search } from 'lucide-react';
import { fetchProperties } from '@/lib/db/repository';
import PropertyCard from '@/components/public/PropertyCard';

export const revalidate = 0; // Fresh data for demo

export default async function HomePage() {
  const properties = await fetchProperties();
  const featuredProperties = properties.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-stone-950 overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transform animate-fade-in"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/80" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hyderabad’s Premier Real Estate Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Exceptional Living in{' '}
            <span className="text-amber-400 font-serif italic block sm:inline">Hyderabad</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-300 leading-relaxed font-light">
            Curated ultra-luxury villas in Jubilee Hills, panoramic sky mansions in Kokapet, and bespoke residences in the Financial District.
          </p>

          {/* Quick Search Widget */}
          <div className="max-w-3xl mx-auto bg-stone-900/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-stone-800 shadow-2xl">
            <form action="/properties" method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <select
                  name="location"
                  className="w-full px-3.5 py-3 rounded-xl bg-stone-800 text-stone-200 border border-stone-700 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">All Hyderabad Locations</option>
                  <option value="Jubilee Hills">Jubilee Hills</option>
                  <option value="Kokapet">Kokapet</option>
                  <option value="Financial District">Financial District</option>
                  <option value="Banjara Hills">Banjara Hills</option>
                  <option value="Tellapur">Tellapur</option>
                  <option value="Hitec City">Hitec City</option>
                </select>
              </div>

              <div>
                <select
                  name="type"
                  className="w-full px-3.5 py-3 rounded-xl bg-stone-800 text-stone-200 border border-stone-700 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">All Property Types</option>
                  <option value="villa">Luxury Villa</option>
                  <option value="apartment">Sky Apartment</option>
                  <option value="penthouse">Penthouse</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full h-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-lg transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400 pt-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verified Property Listings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Direct Builder Representation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Confidential Site Visits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-700">
              Curated Portfolio
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Featured Residences in Hyderabad
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Handpicked properties available for private viewing this week.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-800 group"
          >
            <span>View All Listings ({properties.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* Prime Hyderabad Micro-Markets */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-700">
              Prime Micro-Markets
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Explore Hyderabad’s Elite Neighborhoods
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Seamlessly connected to the Outer Ring Road (ORR), international schools, and premier lifestyle hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Jubilee Hills',
                desc: 'Bespoke hilltop mansions & elite gated communities.',
                avgPrice: 'From ₹12 Cr+',
                query: 'Jubilee Hills',
                img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Kokapet',
                desc: 'High-rise sky residences overlooking Gandipet Lake.',
                avgPrice: 'From ₹4.5 Cr+',
                query: 'Kokapet',
                img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Financial District',
                desc: 'Walk-to-work luxury apartments for corporate leaders.',
                avgPrice: 'From ₹2.5 Cr+',
                query: 'Financial District',
                img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Banjara Hills',
                desc: 'Historic prestige, embassies, and private penthouses.',
                avgPrice: 'From ₹8 Cr+',
                query: 'Banjara Hills',
                img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
              },
            ].map((loc) => (
              <Link
                key={loc.name}
                href={`/properties?location=${encodeURIComponent(loc.query)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-900 border border-stone-200/50 shadow-sm hover:shadow-lg transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loc.img}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 space-y-1">
                  <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    {loc.avgPrice}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-stone-300 line-clamp-2">{loc.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Banner / CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-900 text-stone-100 p-8 sm:p-14 relative overflow-hidden border border-stone-800 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Private Real Estate Advisory
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Looking for something truly bespoke?
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed font-light">
              Connect directly with our senior property advisors. We provide private off-market listings, customized property searches, and discreet representation.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                Schedule Private Consultation
              </Link>
              <Link
                href="/properties"
                className="px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs sm:text-sm transition-all"
              >
                Browse All Properties
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
