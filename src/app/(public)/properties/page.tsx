'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard from '@/components/public/PropertyCard';
import PropertyFilterBar from '@/components/public/PropertyFilterBar';
import { Property, PropertyFilterParams } from '@/lib/types';
import { Building2, Loader2, Sparkles } from 'lucide-react';

function PropertyListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState<PropertyFilterParams>({
    location: searchParams.get('location') || undefined,
    type: searchParams.get('type') || 'all',
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as any) || 'newest',
  });

  // Sync state when URL params change
  useEffect(() => {
    setFilters({
      location: searchParams.get('location') || undefined,
      type: searchParams.get('type') || 'all',
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      search: searchParams.get('search') || undefined,
      sort: (searchParams.get('sort') as any) || 'newest',
    });
  }, [searchParams]);

  // Fetch properties based on active filters
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (filters.location) query.set('location', filters.location);
        if (filters.type && filters.type !== 'all') query.set('type', filters.type);
        if (filters.bedrooms) query.set('bedrooms', String(filters.bedrooms));
        if (filters.search) query.set('search', filters.search);
        if (filters.sort) query.set('sort', filters.sort);

        const res = await fetch(`/api/properties?${query.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProperties(data.properties);
        }
      } catch (err) {
        console.error('Failed to load properties', err);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [filters]);

  const handleFilterChange = (newFilters: PropertyFilterParams) => {
    setFilters(newFilters);
    const query = new URLSearchParams();
    if (newFilters.location) query.set('location', newFilters.location);
    if (newFilters.type && newFilters.type !== 'all') query.set('type', newFilters.type);
    if (newFilters.bedrooms) query.set('bedrooms', String(newFilters.bedrooms));
    if (newFilters.search) query.set('search', newFilters.search);
    if (newFilters.sort) query.set('sort', newFilters.sort);

    router.push(`/properties?${query.toString()}`);
  };

  const handleReset = () => {
    setFilters({ type: 'all', sort: 'newest' });
    router.push('/properties');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
          <Sparkles className="w-3 h-3 text-amber-700" />
          <span>Curated Portfolio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Luxury Properties in Hyderabad
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Explore luxury villas, signature penthouses, and high-rise condominiums across Hyderabad’s most coveted neighborhoods.
        </p>
      </div>

      {/* Filter Component */}
      <PropertyFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          Showing <strong className="text-stone-900 font-semibold">{properties.length}</strong>{' '}
          {properties.length === 1 ? 'residence' : 'residences'} available
        </span>
      </div>

      {/* Property Grid or Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-xs">Loading verified properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">No properties match your current filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search criteria or reset filters to see all available luxury listings.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PropertyListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <PropertyListingsContent />
    </Suspense>
  );
}
