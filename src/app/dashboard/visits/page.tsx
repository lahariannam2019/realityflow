'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  X,
  Star,
} from 'lucide-react';
import { SiteVisit, SiteVisitStatus } from '@/lib/types';
import { formatTimeAgo, formatDateDetailed } from '@/lib/utils';

export default function SiteVisitsPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Complete visit modal state
  const [completeModalVisit, setCompleteModalVisit] = useState<SiteVisit | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const fetchVisits = async () => {
    try {
      setRefreshing(true);
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.set('status', statusFilter);

      const res = await fetch(`/api/site-visits?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setVisits(data.visits || []);
      }
    } catch (err) {
      console.error('Failed to load site visits', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [statusFilter]);

  const handleUpdateStatus = async (visitId: string, status: SiteVisitStatus) => {
    try {
      const res = await fetch(`/api/site-visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setVisits((prev) =>
          prev.map((v) => (v.id === visitId ? { ...v, status } : v))
        );
      }
    } catch (err) {
      console.error('Error updating visit status', err);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalVisit) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/site-visits/${completeModalVisit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          feedback,
          rating,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVisits((prev) =>
          prev.map((v) =>
            v.id === completeModalVisit.id
              ? { ...v, status: 'COMPLETED', feedback, rating }
              : v
          )
        );
        setCompleteModalVisit(null);
        setFeedback('');
      }
    } catch (err) {
      console.error('Failed to complete visit', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Site Visits & Appointments
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-1.5">
            Property Viewings Agenda
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage scheduled customer walkthroughs, confirm showings, and record client feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchVisits}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : 'text-stone-400'}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            {st === 'all' ? 'All Visits' : st.replace('_', ' ').toLowerCase()}
          </button>
        ))}
      </div>

      {/* Visits List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-stone-500">Loading visit appointments...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No scheduled visits found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Schedule site viewings directly from any lead profile in the dashboard.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {visits.map((visit) => {
              const visitDate = new Date(visit.scheduled_at);
              const isPast = visitDate.getTime() < Date.now();

              return (
                <div
                  key={visit.id}
                  className="p-5 sm:p-6 hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold uppercase">
                        {visitDate.toLocaleDateString([], { month: 'short' })}
                      </span>
                      <span className="text-base font-extrabold leading-none">
                        {visitDate.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900">
                          {visit.property?.title || 'Luxury Residence'}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            visit.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : visit.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : visit.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {visit.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            {visitDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span>{visit.property?.location || 'Hyderabad'}</span>
                        </span>
                        {visit.assigned_staff && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-stone-400" />
                              <span>Host: {visit.assigned_staff.full_name}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {visit.visitor_notes && (
                        <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 mt-1">
                          Note: {visit.visitor_notes}
                        </p>
                      )}

                      {visit.feedback && (
                        <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                          <div className="font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>Visitor Feedback ({visit.rating || 5}/5):</span>
                          </div>
                          <p className="mt-0.5">{visit.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {visit.status === 'SCHEDULED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(visit.id, 'CONFIRMED')}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                      >
                        Confirm Show
                      </button>
                    )}

                    {visit.status !== 'COMPLETED' && visit.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => setCompleteModalVisit(visit)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    )}

                    <Link
                      href={`/dashboard/leads/${visit.enquiry_id}`}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>View Lead</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mark Completed Modal */}
      {completeModalVisit && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Complete Site Visit
              </h4>
              <button
                type="button"
                onClick={() => setCompleteModalVisit(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Client Interest Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-600 ml-2">
                    {rating === 5
                      ? '5/5 - Highly Interested'
                      : rating === 4
                      ? '4/5 - Positive'
                      : rating === 3
                      ? '3/5 - Neutral'
                      : 'Low Interest'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Visit Notes & Client Feedback
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Which unit did they prefer? Any concerns raised regarding pricing or layout?"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalVisit(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
