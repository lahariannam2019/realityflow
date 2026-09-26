import React from 'react';
import { PriorityClassification, EnquiryStatus } from '@/lib/types';
import {
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
  XCircle,
  Calendar,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
} from 'lucide-react';

export function PriorityBadge({ priority }: { priority?: PriorityClassification | null }) {
  if (priority === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
        <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
        <span>HIGH</span>
      </span>
    );
  }

  if (priority === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>MEDIUM</span>
      </span>
    );
  }

  if (priority === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
        <Clock className="w-3.5 h-3.5 text-stone-400" />
        <span>LOW</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-400 border border-stone-200">
      <span>UNCLASSIFIED</span>
    </span>
  );
}

export function VisitIntentBadge({ detail }: { detail?: string | null }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shadow-xs"
      title={detail || 'Customer requested an in-person site visit or inspection'}
    >
      <Calendar className="w-3 h-3 text-purple-600" />
      <span>Visit Requested</span>
    </span>
  );
}

export function AnalysisStatusBadge({ status }: { status?: 'pending' | 'completed' | 'failed' | null }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
        <span>AI Analyzing...</span>
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-500" />
        <span>AI Failed</span>
      </span>
    );
  }

  return null;
}

export function StatusBadge({ status }: { status?: EnquiryStatus | string | null }) {
  const normalized = (status || 'NEW').toUpperCase();

  switch (normalized) {
    case 'NEW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span>New Lead</span>
        </span>
      );
    case 'CONTACTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>Contacted</span>
        </span>
      );
    case 'QUALIFIED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
          <span>Qualified</span>
        </span>
      );
    case 'SITE_VISIT_SCHEDULED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Visit Sched</span>
        </span>
      );
    case 'SITE_VISIT_COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Visited</span>
        </span>
      );
    case 'NEGOTIATION':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-300">
          <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
          <span>Negotiation</span>
        </span>
      );
    case 'WON':
    case 'CLOSED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
          <Award className="w-3.5 h-3.5 text-emerald-700" />
          <span>WON</span>
        </span>
      );
    case 'LOST':
    case 'NOT_INTERESTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
          <XCircle className="w-3.5 h-3.5 text-stone-400" />
          <span>Lost</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
          <span>{normalized}</span>
        </span>
      );
  }
}
