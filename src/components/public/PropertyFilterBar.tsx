'use client';

import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { PropertyFilterParams } from '@/lib/types';

interface PropertyFilterBarProps {
  filters: PropertyFilterParams;
  onFilterChange: (newFilters: PropertyFilterParams) => void;
  onReset: () => void;
}

export default function PropertyFilterBar({
  filters,
  onFilterChange,
  onReset,
}: PropertyFilterBarProps) {
  const neighborhoods = [
    'Jubilee Hills',
    'Banjara Hills',
    'Kokapet',
    'Financial District',
    'Tellapur',
    'Hitec City',
    'Gachibowli',
  ];

  const propertyTypes = [
    { label: 'All Types', value: 'all' },
    { label: 'Villas', value: 'villa' },
    { label: 'Apartments', value: 'apartment' },
    { label: 'Penthouses', value: 'penthouse' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/90 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by community or title..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50"
          />
        </div>

        {/* Location selector */}
        <div>
          <select
            value={filters.location || ''}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value || undefined })}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50"
          >
            <option value="">All Locations (Hyderabad)</option>
            {neighborhoods.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type selector */}
        <div>
          <select
            value={filters.type || 'all'}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50"
          >
            {propertyTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bedroom count selector */}
        <div>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                bedrooms: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50"
          >
            <option value="">Bedrooms (Any)</option>
            <option value="2">2+ BHK</option>
            <option value="3">3+ BHK</option>
            <option value="4">4+ BHK</option>
            <option value="5">5+ BHK</option>
          </select>
        </div>
      </div>

      {/* Second row: Sort and Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-medium">Sort by:</span>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value as any })}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
