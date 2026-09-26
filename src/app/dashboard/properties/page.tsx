'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Globe,
  EyeOff,
} from 'lucide-react';
import { Property, PropertyStatus, PropertyAvailability } from '@/lib/types';
import { formatIndianCurrency } from '@/lib/utils';

export default function PropertiesManagementPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPropertiesList = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties');
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertiesList();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting property', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishToggle = async (id: string, currentPublished: boolean = true) => {
    const nextPublished = !currentPublished;
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: nextPublished }),
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_published: nextPublished } : p))
        );
      }
    } catch (err) {
      console.error('Error toggling publish', err);
    }
  };

  const handleAvailabilityCycle = async (id: string, currentAvail: PropertyAvailability = 'available') => {
    const nextAvail: PropertyAvailability =
      currentAvail === 'available' ? 'reserved' : currentAvail === 'reserved' ? 'sold' : 'available';

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: nextAvail }),
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, availability: nextAvail } : p))
        );
      }
    } catch (err) {
      console.error('Error cycling availability', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Property Catalog Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage luxury residences, availability status, published listings, and unit specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </Link>
        </div>
      </div>

      {/* Properties Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-xs text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
          <span>Loading properties catalog...</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
          <Home className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No properties in database</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Click &ldquo;Add New Property&rdquo; to publish your first property listing.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  <th className="py-3.5 px-6">Property / Title</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Type & Specs</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Web Visibility</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {prop.images && prop.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={prop.images[0]}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                        )}
                        <div className="truncate max-w-[240px]">
                          <p className="font-bold text-stone-900 truncate">{prop.title}</p>
                          <p className="text-[10px] text-stone-400 font-mono truncate">{prop.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-stone-900">
                      ₹{formatIndianCurrency(prop.price)}
                    </td>

                    <td className="py-4 px-4 text-stone-600">
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{prop.location}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-stone-600">
                      <div className="space-y-0.5">
                        <span className="capitalize font-semibold text-stone-800">
                          {prop.property_type}
                        </span>
                        <p className="text-[11px] text-stone-400">
                          {prop.bedrooms ? `${prop.bedrooms} BHK • ` : ''}
                          {prop.carpet_area_sqft ? `${prop.carpet_area_sqft} carpet sqft` : prop.area_sqft ? `${prop.area_sqft} sqft` : ''}
                        </p>
                      </div>
                    </td>

                    {/* Availability Status */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleAvailabilityCycle(prop.id, prop.availability)}
                        title="Click to cycle: Available -> Reserved -> Sold"
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          prop.availability === 'sold'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : prop.availability === 'reserved'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {prop.availability || 'available'}
                      </button>
                    </td>

                    {/* Publish / Unpublish Toggle */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handlePublishToggle(prop.id, prop.is_published)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          prop.is_published !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        {prop.is_published !== false ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                            <span>Draft/Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/properties/${prop.id}`}
                          target="_blank"
                          className="p-2 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                          title="View on Public Site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/properties/${prop.id}/edit`}
                          className="p-2 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="Edit Property"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prop.id, prop.title)}
                          disabled={deletingId === prop.id}
                          className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete Property"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
