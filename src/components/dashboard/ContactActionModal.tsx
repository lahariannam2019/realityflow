'use client';

import React, { useState } from 'react';
import { Enquiry, Property, StaffProfile } from '@/lib/types';
import { Phone, MessageSquare, Mail, Calendar, Check, X, Loader2 } from 'lucide-react';

interface ContactActionModalProps {
  enquiry: Enquiry;
  properties?: Property[];
  staff?: StaffProfile[];
  onContactLogged: () => Promise<void>;
  onSiteVisitScheduled: () => Promise<void>;
}

export default function ContactActionModal({
  enquiry,
  properties = [],
  staff = [],
  onContactLogged,
  onSiteVisitScheduled,
}: ContactActionModalProps) {
  // Modal states
  const [activeModal, setActiveModal] = useState<'call_outcome' | 'schedule_visit' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Call outcome state
  const [callOutcome, setCallOutcome] = useState('Connected - Discussed Requirements');
  const [callNotes, setCallNotes] = useState('');

  // Site visit state
  const [visitPropertyId, setVisitPropertyId] = useState(enquiry.property_id || properties[0]?.id || '');
  const [visitDateTime, setVisitDateTime] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitStaffId, setVisitStaffId] = useState(enquiry.assigned_to || '');

  const cleanPhone = enquiry.phone.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('91')
    ? cleanPhone
    : cleanPhone.length === 10
    ? `91${cleanPhone}`
    : cleanPhone;

  // 1. Phone Call Handler
  const handleInitiateCall = () => {
    // Open tel protocol
    window.location.href = `tel:${enquiry.phone}`;
    // Show outcome modal
    setActiveModal('call_outcome');
  };

  const submitCallOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`/api/enquiries/${enquiry.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'call_logged',
          outcome: callOutcome,
          notes: callNotes,
        }),
      });
      setActiveModal(null);
      setCallNotes('');
      await onContactLogged();
    } catch (err) {
      console.error('Failed to log call outcome', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. WhatsApp Handler
  const handleInitiateWhatsApp = async () => {
    const propTitle = enquiry.property?.title || 'our verified luxury residences';
    const text = encodeURIComponent(
      `Hello ${enquiry.name}, this is UrbanNest Realty regarding your enquiry for ${propTitle}. When would be a convenient time for a brief discussion or to schedule an exclusive viewing?`
    );
    const waUrl = `https://wa.me/${internationalPhone}?text=${text}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Automatically log WhatsApp initiation
    try {
      await fetch(`/api/enquiries/${enquiry.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'whatsapp_sent',
          title: 'WhatsApp message initiated',
          notes: `Sent introductory message regarding ${propTitle}`,
        }),
      });
      await onContactLogged();
    } catch (err) {
      console.error('Failed to log whatsapp', err);
    }
  };

  // 3. Email Handler
  const handleInitiateEmail = async () => {
    if (!enquiry.email) return;
    const propTitle = enquiry.property?.title || 'UrbanNest Luxury Properties';
    const mailtoUrl = `mailto:${enquiry.email}?subject=${encodeURIComponent(`UrbanNest Realty: Details on ${propTitle}`)}`;
    window.location.href = mailtoUrl;

    try {
      await fetch(`/api/enquiries/${enquiry.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'email_sent',
          title: 'Email client opened',
          notes: `Email drafted to ${enquiry.email}`,
        }),
      });
      await onContactLogged();
    } catch (err) {
      console.error('Failed to log email', err);
    }
  };

  // 4. Schedule Site Visit Submit
  const submitScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitPropertyId || !visitDateTime) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiry_id: enquiry.id,
          property_id: visitPropertyId,
          scheduled_at: new Date(visitDateTime).toISOString(),
          assigned_staff_id: visitStaffId || null,
          visitor_notes: visitNotes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveModal(null);
        setVisitNotes('');
        setVisitDateTime('');
        await onSiteVisitScheduled();
      }
    } catch (err) {
      console.error('Failed to schedule visit', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
        Quick Contact Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Call Action */}
        <button
          type="button"
          onClick={handleInitiateCall}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>Call Client</span>
        </button>

        {/* WhatsApp Action */}
        <button
          type="button"
          onClick={handleInitiateWhatsApp}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        {/* Email Action */}
        <button
          type="button"
          onClick={handleInitiateEmail}
          disabled={!enquiry.email}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            enquiry.email
              ? 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              : 'bg-stone-50 text-stone-400 border-stone-100 cursor-not-allowed'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-stone-500" />
          <span>{enquiry.email ? 'Send Email' : 'No Email'}</span>
        </button>

        {/* Schedule Visit Action */}
        <button
          type="button"
          onClick={() => setActiveModal('schedule_visit')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-700" />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Call Outcome Prompt Modal */}
      {activeModal === 'call_outcome' && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-600" />
                Log Call Outcome
              </h4>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitCallOutcome} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Call Result
                </label>
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Connected - Discussed Requirements">Connected - Discussed Requirements</option>
                  <option value="Connected - Scheduled Site Visit">Connected - Scheduled Site Visit</option>
                  <option value="Connected - Requested Callback Later">Connected - Requested Callback Later</option>
                  <option value="Ringing / No Answer">Ringing / No Answer</option>
                  <option value="Busy / Call Dropped">Busy / Call Dropped</option>
                  <option value="Left Voicemail / SMS">Left Voicemail / SMS</option>
                  <option value="Wrong Number / Invalid">Wrong Number / Invalid</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Call Notes & Observations
                </label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Key topics discussed, client tone, next action agreed upon..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs"
                >
                  Save Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {activeModal === 'schedule_visit' && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Schedule Site Visit
              </h4>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitScheduleVisit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Property to Visit *
                </label>
                <select
                  value={visitPropertyId}
                  onChange={(e) => setVisitPropertyId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={visitDateTime}
                  onChange={(e) => setVisitDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {staff.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Host Salesperson
                  </label>
                  <select
                    value={visitStaffId}
                    onChange={(e) => setVisitStaffId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Unassigned Host</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Visitor Notes / Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="e.g. Buyer coming with spouse, requested afternoon daylight tour..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !visitPropertyId || !visitDateTime}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
