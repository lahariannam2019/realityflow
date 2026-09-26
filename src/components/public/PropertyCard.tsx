import React from 'react';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize2, ArrowRight } from 'lucide-react';
import { Property } from '@/lib/types';
import { formatIndianCurrency } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-amber-400/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-stone-900/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
            {property.property_type}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
            {property.status === 'active' ? 'Available' : property.status}
          </span>
        </div>

        {/* Price on Image Bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
            {formatIndianCurrency(property.price)}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate font-medium">{property.location}</span>
          </div>

          <h3 className="font-bold text-stone-900 text-base line-clamp-1 group-hover:text-amber-700 transition-colors">
            {property.title}
          </h3>

          <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Key Specs */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          {property.bedrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-stone-400" />
              <span><strong>{property.bedrooms}</strong> BHK</span>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-stone-400" />
              <span><strong>{property.bathrooms}</strong> Baths</span>
            </div>
          )}
          {property.area_sqft !== null && (
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-stone-400" />
              <span><strong>{property.area_sqft.toLocaleString('en-IN')}</strong> sq.ft</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={`/properties/${property.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white text-xs font-semibold transition-colors duration-200"
          >
            <span>View Property & Enquire</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
