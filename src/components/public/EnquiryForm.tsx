'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface EnquiryFormProps {
  propertyId?: string;
  propertyTitle?: string;
  defaultLocation?: string;
  source?: 'property_page' | 'contact_form';
}

export default function EnquiryForm({
  propertyId,
  propertyTitle,
  defaultLocation,
  source = 'property_page',
}: EnquiryFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: propertyTitle
      ? `Hello, I am interested in "${propertyTitle}". Please share more details and available slots for a site visit.`
      : '',
    stated_budget: '',
    stated_location: defaultLocation || '',
    _hp_check: '', // Honeypot field
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client validation
    if (!formData.name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 8) {
      setErrorMessage('Please provide a valid contact phone number.');
      return;
    }

    if (!formData.message.trim()) {
      setErrorMessage('Please provide a message or requirements.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId || null,
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          message: formData.message,
          stated_budget: formData.stated_budget || null,
          stated_location: formData.stated_location || null,
          source: source,
          _hp_check: formData._hp_check,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit your enquiry.');
      }

      // Route to confirmation screen with enquiry details
      const params = new URLSearchParams({
        ref: data.enquiryId || 'CONF-OK',
        name: formData.name,
        property: propertyTitle || 'General Advisory',
      });

      router.push(`/enquiry-confirmation?${params.toString()}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-lg">
      <div className="mb-6">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
          {propertyTitle ? 'Property Enquiry' : 'Direct Advisory'}
        </span>
        <h3 className="text-xl font-bold text-stone-900 mt-2">
          {propertyTitle ? 'Request Private Viewing' : 'Connect with UrbanNest Advisors'}
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Direct builder pricing, detailed floor plans, and priority appointment booking.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field (hidden from real users) */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="_hp_check"
            tabIndex={-1}
            value={formData._hp_check}
            onChange={(e) => setFormData({ ...formData, _hp_check: e.target.value })}
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ramesh Kumar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/40"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98490 00000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Approx. Budget <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ₹3 - 5 Cr"
              value={formData.stated_budget}
              onChange={(e) => setFormData({ ...formData, stated_budget: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Preferred Location <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kokapet, Jubilee Hills"
              value={formData.stated_location}
              onChange={(e) => setFormData({ ...formData, stated_location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Requirements / Questions <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Tell us about your timeline, possession preferences, or specific questions..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/40 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-md hover:shadow-amber-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Enquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Enquiry</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 pt-2">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your contact information is strictly confidential. Zero spam policy.</span>
        </div>
      </form>
    </div>
  );
}
