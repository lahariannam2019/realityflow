'use client';

import React, { useState } from 'react';
import { CRMEnquiryStatus, EnquiryStatus } from '@/lib/types';
import { Check, ChevronRight, X, DollarSign, AlertCircle } from 'lucide-react';

export const CRM_STAGES: { key: CRMEnquiryStatus; label: string; short: string; step: number }[] = [
  { key: 'NEW', label: 'New Lead', short: 'New', step: 1 },
  { key: 'CONTACTED', label: 'Contacted', short: 'Contacted', step: 2 },
  { key: 'QUALIFIED', label: 'Qualified', short: 'Qualified', step: 3 },
  { key: 'SITE_VISIT_SCHEDULED', label: 'Visit Scheduled', short: 'Visit Sched', step: 4 },
  { key: 'SITE_VISIT_COMPLETED', label: 'Visit Completed', short: 'Visited', step: 5 },
  { key: 'NEGOTIATION', label: 'Negotiation', short: 'Negotiate', step: 6 },
  { key: 'WON', label: 'Won / Closed', short: 'Won', step: 7 },
  { key: 'LOST', label: 'Lost', short: 'Lost', step: 7 },
];

interface CRMStagePipelineProps {
  currentStatus: EnquiryStatus;
  onStatusChange: (newStatus: CRMEnquiryStatus, details?: { lost_reason?: string; deal_value?: number }) => Promise<void>;
  disabled?: boolean;
}

export default function CRMStagePipeline({
  currentStatus,
  onStatusChange,
  disabled,
}: CRMStagePipelineProps) {
  const normalizedCurrent = (currentStatus || 'NEW').toUpperCase() as CRMEnquiryStatus;
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [showWonModal, setShowWonModal] = useState(false);
  const [dealValue, setDealValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentStageObj = CRM_STAGES.find((s) => s.key === normalizedCurrent) || CRM_STAGES[0];
  const currentStep = currentStageObj.step;
  const isWon = normalizedCurrent === 'WON';
  const isLost = normalizedCurrent === 'LOST';

  const handleStageClick = async (stageKey: CRMEnquiryStatus) => {
    if (disabled || submitting) return;
    if (stageKey === normalizedCurrent) return;

    if (stageKey === 'LOST') {
      setShowLostModal(true);
      return;
    }

    if (stageKey === 'WON') {
      setShowWonModal(true);
      return;
    }

    setSubmitting(true);
    try {
      await onStatusChange(stageKey);
    } finally {
      setSubmitting(false);
    }
  };

  const submitLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostReason.trim()) return;
    setSubmitting(true);
    try {
      await onStatusChange('LOST', { lost_reason: lostReason.trim() });
      setShowLostModal(false);
      setLostReason('');
    } finally {
      setSubmitting(false);
    }
  };

  const submitWon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onStatusChange('WON', { deal_value: dealValue ? Number(dealValue) : undefined });
      setShowWonModal(false);
      setDealValue('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Pipeline Progression
          </h3>
          <p className="text-sm font-semibold text-stone-900 mt-0.5">
            Current Stage: <span className="text-amber-800 font-bold">{currentStageObj.label}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleStageClick('WON')}
            disabled={disabled || submitting || isWon}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isWon
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Mark as WON
          </button>
          <button
            type="button"
            onClick={() => handleStageClick('LOST')}
            disabled={disabled || submitting || isLost}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isLost
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Mark as LOST
          </button>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {CRM_STAGES.filter((s) => s.key !== 'WON' && s.key !== 'LOST').map((stage) => {
          const isPassed = !isLost && stage.step < currentStep;
          const isCurrent = normalizedCurrent === stage.key;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => handleStageClick(stage.key)}
              disabled={disabled || submitting}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-300/60 font-bold'
                  : isPassed
                  ? 'bg-amber-50/80 text-amber-950 border-amber-200/80 hover:bg-amber-100'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isPassed && <Check className="w-3.5 h-3.5 text-amber-700 stroke-[2.5]" />}
                <span className="text-xs font-semibold">{stage.short}</span>
              </div>
              <span className={`text-[10px] mt-0.5 ${isCurrent ? 'text-amber-100' : 'text-stone-400'}`}>
                Step {stage.step}
              </span>
            </button>
          );
        })}
      </div>

      {/* Won Modal */}
      {showWonModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                Close Lead as WON
              </h4>
              <button
                type="button"
                onClick={() => setShowWonModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitWon} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Final Deal Value (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="e.g. 15000000"
                    className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Leave blank if value is not yet finalized.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWonModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Confirm Lead Won
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lost Modal */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Close Lead as LOST
              </h4>
              <button
                type="button"
                onClick={() => setShowLostModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitLost} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Reason for Lost Deal *
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-2"
                >
                  <option value="">Select reason...</option>
                  <option value="Budget mismatch / Too expensive">Budget mismatch / Too expensive</option>
                  <option value="Purchased with another builder/agent">Purchased with another builder/agent</option>
                  <option value="Location preference changed">Location preference changed</option>
                  <option value="Timeline postponed indefinitely">Timeline postponed indefinitely</option>
                  <option value="Unresponsive / Ghosted after visit">Unresponsive / Ghosted after visit</option>
                  <option value="Did not like property layout/specs">Did not like property layout/specs</option>
                  <option value="Other">Other (specify below)</option>
                </select>
                {lostReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Describe reason..."
                    onChange={(e) => setLostReason(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLostModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !lostReason}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Confirm Lead Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
