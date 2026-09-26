'use client';

import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react';
import { formatDateDetailed } from '@/lib/utils';

interface FollowUpSchedulerProps {
  currentFollowUpAt?: string | null;
  onSetFollowUp: (dateIso: string | null, note?: string) => Promise<void>;
  disabled?: boolean;
}

export default function FollowUpScheduler({
  currentFollowUpAt,
  onSetFollowUp,
  disabled,
}: FollowUpSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customDateTime, setCustomDateTime] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const followDate = currentFollowUpAt ? new Date(currentFollowUpAt) : null;
  const isOverdue = followDate && followDate.getTime() < now.getTime();
  const isToday =
    followDate &&
    followDate.toDateString() === now.toDateString();

  const handleApplyPreset = async (presetHours: number) => {
    if (disabled || saving) return;
    const target = new Date();
    target.setHours(target.getHours() + presetHours);
    target.setMinutes(0);
    target.setSeconds(0);

    setSaving(true);
    try {
      await onSetFollowUp(target.toISOString(), `Quick preset: +${presetHours}h`);
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDateTime) return;
    setSaving(true);
    try {
      await onSetFollowUp(new Date(customDateTime).toISOString(), followUpNote);
      setIsOpen(false);
      setCustomDateTime('');
      setFollowUpNote('');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (disabled || saving) return;
    setSaving(true);
    try {
      await onSetFollowUp(null, 'Follow-up cleared');
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
          Follow-Up Date & Time
        </label>
        {isOverdue && (
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Overdue
          </span>
        )}
        {!isOverdue && isToday && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Due Today
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || saving}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left border transition-all cursor-pointer ${
          isOverdue
            ? 'bg-rose-50/50 border-rose-200 text-rose-950 hover:bg-rose-50'
            : isToday
            ? 'bg-amber-50/50 border-amber-200 text-amber-950 hover:bg-amber-50'
            : 'bg-stone-50 border-stone-200 text-stone-900 hover:bg-stone-100'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Calendar
            className={`w-4 h-4 shrink-0 ${
              isOverdue ? 'text-rose-600' : isToday ? 'text-amber-600' : 'text-stone-400'
            }`}
          />
          <div className="truncate">
            <span className="block text-xs font-bold truncate">
              {followDate
                ? `${followDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${followDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'No Follow-up Scheduled'}
            </span>
            <span className="block text-[10px] text-stone-500">
              {followDate ? (isOverdue ? 'Action required immediately' : 'Scheduled call/meeting') : 'Click to schedule'}
            </span>
          </div>
        </div>

        {saving ? (
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
        ) : (
          <Clock className="w-4 h-4 text-stone-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-900">Schedule Follow-up</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-3">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset(24)}
                className="px-2.5 py-1.5 bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 text-left cursor-pointer transition-colors"
              >
                Tomorrow (+24h)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(48)}
                className="px-2.5 py-1.5 bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 text-left cursor-pointer transition-colors"
              >
                In 2 Days (+48h)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(72)}
                className="px-2.5 py-1.5 bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 text-left cursor-pointer transition-colors"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(168)}
                className="px-2.5 py-1.5 bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 text-left cursor-pointer transition-colors"
              >
                Next Week (+7d)
              </button>
            </div>
          </div>

          {/* Custom Date Picker */}
          <form onSubmit={handleCustomSubmit} className="mt-4 pt-3 border-t border-stone-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
              Custom Date & Time
            </span>
            <input
              type="datetime-local"
              required
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Optional follow-up agenda..."
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              {currentFollowUpAt ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                >
                  Clear Follow-up
                </button>
              ) : <div />}
              <button
                type="submit"
                disabled={saving || !customDateTime}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                Set Follow-up
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
