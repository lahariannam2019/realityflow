'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Bot,
  User,
  MapPin,
  Tag,
  Loader2,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ShieldAlert,
  Flame,
  DollarSign,
} from 'lucide-react';
import { Enquiry, CRMEnquiryStatus, EnquiryStatus, LeadAnalysis, Property, StaffProfile, SiteVisit } from '@/lib/types';
import {
  StatusBadge,
  PriorityBadge,
  VisitIntentBadge,
  AnalysisStatusBadge,
} from '@/components/dashboard/LeadBadges';
import { formatTimeAgo, formatDateDetailed, formatIndianCurrency } from '@/lib/utils';
import CRMStagePipeline from '@/components/dashboard/CRMStagePipeline';
import SalespersonAssigner from '@/components/dashboard/SalespersonAssigner';
import FollowUpScheduler from '@/components/dashboard/FollowUpScheduler';
import ContactActionModal from '@/components/dashboard/ContactActionModal';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [lead, setLead] = useState<Enquiry | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // AI Re-analyze state
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [signalsExpanded, setSignalsExpanded] = useState<boolean>(true);

  const loadLead = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/enquiries/${id}`);
      const data = await res.json();
      if (data.success && data.enquiry) {
        setLead(data.enquiry);
      }
    } catch (err) {
      console.error('Failed to load lead details', err);
    }
  };

  const loadDependencies = async () => {
    try {
      const [propRes, staffRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/staff'),
      ]);
      const propData = await propRes.json();
      const staffData = await staffRes.json();
      if (propData.success) setProperties(propData.properties || []);
      if (staffData.success) setStaffList(staffData.staff || []);
    } catch (err) {
      console.error('Failed to load dependencies', err);
    }
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([loadLead(), loadDependencies()]);
      setLoading(false);
    }
    init();
  }, [id]);

  // Handle Stage Pipeline change
  const handleStageChange = async (
    newStatus: CRMEnquiryStatus,
    details?: { lost_reason?: string; deal_value?: number }
  ) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          lost_reason: details?.lost_reason,
          deal_value: details?.deal_value,
        }),
      });
      const data = await res.json();
      if (data.success && data.enquiry) {
        setLead(data.enquiry);
        setSuccessMessage(`Stage changed to "${newStatus.replace(/_/g, ' ')}"`);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err) {
      console.error('Error changing stage', err);
    }
  };

  // Handle Salesperson Assignment
  const handleAssign = async (staffId: string | null) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: staffId }),
      });
      const data = await res.json();
      if (data.success && data.enquiry) {
        setLead(data.enquiry);
        setSuccessMessage('Salesperson assignment updated');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error assigning salesperson', err);
    }
  };

  // Handle Follow-up schedule
  const handleSetFollowUp = async (dateIso: string | null, note?: string) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          next_follow_up_at: dateIso,
          follow_up_note: note,
        }),
      });
      const data = await res.json();
      if (data.success && data.enquiry) {
        setLead(data.enquiry);
        setSuccessMessage(dateIso ? 'Follow-up appointment scheduled' : 'Follow-up cleared');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error updating follow-up', err);
    }
  };

  // Handle AI Re-analyze
  const handleReanalyze = async () => {
    if (cooldownRemaining > 0 || reanalyzing) return;

    try {
      setReanalyzing(true);
      setReanalyzeError(null);

      const res = await fetch(`/api/enquiries/${id}/analyze`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.cooldownRemaining) {
          setCooldownRemaining(data.cooldownRemaining);
        }
        throw new Error(data.error || 'Failed to re-analyze lead');
      }

      if (data.analysis) {
        setLead((prev) => (prev ? { ...prev, lead_analysis: data.analysis } : prev));
        setSuccessMessage('AI analysis updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setCooldownRemaining(10);
      }
    } catch (err: any) {
      setReanalyzeError(err.message || 'Error executing AI analysis');
    } finally {
      setReanalyzing(false);
    }
  };

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
        <p className="text-xs text-stone-500">Loading lead file and CRM history...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-stone-200 p-8">
        <h2 className="text-lg font-bold text-stone-800">Lead Not Found</h2>
        <p className="text-xs text-stone-500">The requested lead enquiry could not be found.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads</span>
        </Link>
      </div>
    );
  }

  const analysis: LeadAnalysis | null = lead.lead_analysis || null;
  const isAnalysisCompleted = analysis?.analysis_status === 'completed';
  const isAnalysisFailed = analysis?.analysis_status === 'failed';
  const isAnalysisPending = analysis?.analysis_status === 'pending';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Lead ID:</span>
          <span className="font-mono text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
            {lead.id}
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Main Lead Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-stone-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{lead.name}</h1>
              <StatusBadge status={lead.status} />
              {analysis?.classification && (
                <PriorityBadge priority={analysis.classification} />
              )}
              {analysis?.visit_intent && (
                <VisitIntentBadge detail={analysis.visit_intent_detail} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Submitted {formatTimeAgo(lead.created_at)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{formatDateDetailed(lead.created_at)}</span>
              </span>
              <span>•</span>
              <span className="capitalize text-stone-600 font-medium">
                Source: {lead.source.replace('_', ' ')}
              </span>
            </div>

            {lead.lost_reason && (
              <div className="mt-2 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl px-3 py-1.5">
                <span className="font-bold">Deal Lost Reason:</span> {lead.lost_reason}
              </div>
            )}
            {lead.deal_value && (
              <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-3 py-1.5">
                <span className="font-bold">Closed Deal Value:</span> ₹{lead.deal_value.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* Quick Contact Action Bar */}
          <div className="sm:w-80">
            <ContactActionModal
              enquiry={lead}
              properties={properties}
              staff={staffList}
              onContactLogged={loadLead}
              onSiteVisitScheduled={loadLead}
            />
          </div>
        </div>

        {/* 8-Stage CRM Progression Pipeline */}
        <CRMStagePipeline
          currentStatus={lead.status}
          onStatusChange={handleStageChange}
        />

        {/* Salesperson Assignment & Follow-Up Manager Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <SalespersonAssigner
            currentStaffId={lead.assigned_to}
            assignedStaff={lead.assigned_staff}
            onAssign={handleAssign}
          />
          <FollowUpScheduler
            currentFollowUpAt={lead.next_follow_up_at}
            onSetFollowUp={handleSetFollowUp}
          />
        </div>
      </div>

      {/* Grid: AI Intelligence vs Customer Context & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): AI Intelligence & Enquiry Message */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Intelligence Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">RealityFlow AI Lead Analysis</h2>
                  <p className="text-[11px] text-stone-400">
                    Gemini 1.5 Flash Lead Intelligence Engine
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AnalysisStatusBadge status={analysis?.analysis_status} />
                <button
                  onClick={handleReanalyze}
                  disabled={reanalyzing || cooldownRemaining > 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                  title="Re-run AI extraction"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin text-amber-600' : 'text-stone-400'}`}
                  />
                  <span>
                    {reanalyzing
                      ? 'Analyzing...'
                      : cooldownRemaining > 0
                      ? `Wait ${cooldownRemaining}s`
                      : 'Re-analyze'}
                  </span>
                </button>
              </div>
            </div>

            {reanalyzeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{reanalyzeError}</span>
              </div>
            )}

            {isAnalysisPending && (
              <div className="py-8 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
                <p className="text-xs font-semibold text-stone-700">AI Analysis in Progress...</p>
                <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                  Extracting budget, timeline, location, and purchase signals.
                </p>
              </div>
            )}

            {isAnalysisFailed && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>AI Analysis Unavailable</span>
                </div>
                <p className="text-xs text-amber-800">
                  {analysis?.last_error || 'The AI service could not complete the evaluation. You can review the customer message directly.'}
                </p>
              </div>
            )}

            {isAnalysisCompleted && analysis && (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">
                    AI Lead Summary
                  </span>
                  <p className="text-xs font-medium text-stone-800 leading-relaxed">
                    {analysis.summary || 'Summary unavailable.'}
                  </p>
                </div>

                {/* Intent Classification & Reason */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Intent Classification
                    </span>
                    {analysis.classification && (
                      <PriorityBadge priority={analysis.classification} />
                    )}
                  </div>
                  {analysis.classification_reason && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 leading-relaxed">
                      {analysis.classification_reason}
                    </p>
                  )}
                </div>

                {/* Extracted Parameters Grid */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-3">
                    Extracted Requirements
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                      <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                        Budget Range
                      </span>
                      <span className="text-xs font-bold text-stone-900 mt-0.5 block">
                        {analysis.extracted_budget || 'Not specified'}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                      <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                        Preferred Location
                      </span>
                      <span className="text-xs font-bold text-stone-900 mt-0.5 block truncate">
                        {analysis.extracted_location || 'Not specified'}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                      <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                        Property Type / BHK
                      </span>
                      <span className="text-xs font-bold text-stone-900 mt-0.5 block">
                        {[analysis.extracted_bhk, analysis.extracted_property_type]
                          .filter(Boolean)
                          .join(' • ') || 'Not specified'}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                      <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                        Buying Timeline
                      </span>
                      <span className="text-xs font-bold text-stone-900 mt-0.5 block truncate">
                        {analysis.extracted_timeline || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specific Requirements Tags */}
                {analysis.extracted_requirements && analysis.extracted_requirements.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
                      Specific Requirements
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extracted_requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium"
                        >
                          <Tag className="w-3 h-3 text-stone-400" />
                          <span>{req}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explainable Signals Collapsible */}
                {analysis.signals && (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setSignalsExpanded(!signalsExpanded)}
                      className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-stone-700">
                        Underlying Decision Signals ({Object.keys(analysis.signals).length})
                      </span>
                      {signalsExpanded ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </button>

                    {signalsExpanded && (
                      <div className="p-3.5 divide-y divide-stone-100 text-xs">
                        <div className="py-1.5 flex items-center justify-between">
                          <span className="text-stone-500">Specific Budget Identified</span>
                          <span className="font-semibold text-stone-800">
                            {analysis.signals.has_specific_budget ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="py-1.5 flex items-center justify-between">
                          <span className="text-stone-500">Location Specificity</span>
                          <span className="font-semibold text-stone-800">
                            {analysis.signals.has_specific_location ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="py-1.5 flex items-center justify-between">
                          <span className="text-stone-500">Clear Timeline Given</span>
                          <span className="font-semibold text-stone-800">
                            {analysis.signals.has_clear_timeline ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="py-1.5 flex items-center justify-between">
                          <span className="text-stone-500">Urgency Detected</span>
                          <span className="font-semibold text-stone-800">
                            {analysis.signals.urgency_detected ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="py-1.5 flex items-center justify-between">
                          <span className="text-stone-500">Visit Explicitly Requested</span>
                          <span className="font-semibold text-stone-800">
                            {analysis.signals.visit_requested ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Raw Customer Enquiry Message Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Original Customer Enquiry Message
            </h2>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-900 leading-relaxed font-sans whitespace-pre-wrap">
              {lead.message}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                  Form Stated Budget
                </span>
                <span className="font-bold text-stone-800">
                  {lead.stated_budget || 'None'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                  Form Stated Location
                </span>
                <span className="font-bold text-stone-800">
                  {lead.stated_location || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Contact Profile, Property Info & Activity Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customer Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Customer Contact Profile
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-stone-600" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Phone Number</span>
                  <a
                    href={`tel:${lead.phone}`}
                    className="font-bold text-stone-900 hover:text-amber-700"
                  >
                    {lead.phone}
                  </a>
                </div>
              </div>

              {lead.email && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-stone-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Email Address</span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-bold text-stone-900 hover:text-amber-700 truncate max-w-[200px] block"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}

              {lead.last_contacted_at && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Last Contacted</span>
                    <span className="font-semibold text-stone-800">
                      {formatTimeAgo(lead.last_contacted_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Linked Property Listing */}
          {lead.property && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Associated Listing
                </h3>
                <Link
                  href={`/properties/${lead.property.id}`}
                  target="_blank"
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                >
                  <span>View Public</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-stone-900">{lead.property.title}</h4>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{lead.property.location}</span>
                </p>
                <p className="text-sm font-bold text-amber-900 pt-1">
                  ₹{formatIndianCurrency(lead.property.price)}
                </p>
              </div>
            </div>
          )}

          {/* Scheduled Site Visits for this Lead */}
          {lead.visits && lead.visits.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Site Visits ({lead.visits.length})
              </h3>
              <div className="space-y-2">
                {lead.visits.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">
                        {new Date(v.scheduled_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(v.scheduled_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    {v.visitor_notes && (
                      <p className="text-stone-600 text-[11px] italic">{v.visitor_notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline & Internal Notes */}
          <ActivityTimeline
            enquiryId={lead.id}
            activities={lead.activities || []}
            onActivityAdded={loadLead}
          />
        </div>
      </div>
    </div>
  );
}
