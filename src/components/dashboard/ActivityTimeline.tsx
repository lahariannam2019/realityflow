'use client';

import React, { useState } from 'react';
import { LeadActivity, ActivityType } from '@/lib/types';
import {
  MessageSquare,
  FileText,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  Send,
  Loader2,
} from 'lucide-react';
import { formatTimeAgo, formatDateDetailed } from '@/lib/utils';

interface ActivityTimelineProps {
  enquiryId: string;
  activities: LeadActivity[];
  onActivityAdded: () => Promise<void>;
  disabled?: boolean;
}

export default function ActivityTimeline({
  enquiryId,
  activities = [],
  onActivityAdded,
  disabled,
}: ActivityTimelineProps) {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || submitting || disabled) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'note_added',
          title: 'Internal Note',
          description: newNote.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewNote('');
        await onActivityAdded();
      }
    } catch (err) {
      console.error('Failed to post note', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'note_added':
        return <FileText className="w-3.5 h-3.5 text-stone-600" />;
      case 'call_logged':
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'whatsapp_sent':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'email_sent':
        return <Mail className="w-3.5 h-3.5 text-purple-600" />;
      case 'visit_scheduled':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
      case 'visit_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />;
      case 'status_changed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-stone-700" />;
      case 'assigned':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-600" />;
      case 'followup_set':
        return <Clock className="w-3.5 h-3.5 text-orange-600" />;
      case 'reanalyzed':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Activity Timeline & Internal Notes
        </h3>
        <span className="text-xs text-stone-400 font-medium">{activities.length} entries</span>
      </div>

      {/* Add Note Input */}
      <form onSubmit={handlePostNote} className="space-y-2">
        <textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={disabled || submitting}
          placeholder="Add an internal note or meeting summary..."
          className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newNote.trim() || submitting || disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3 h-3 text-amber-400" />
            )}
            <span>Post Note</span>
          </button>
        </div>
      </form>

      {/* Timeline List */}
      <div className="pt-2">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-xs text-stone-400">
            No activity history yet. Actions and notes will appear here.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Node icon circle */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-stone-300 shadow-2xs flex items-center justify-center">
                  {getActivityIcon(act.activity_type)}
                </div>

                <div className="bg-stone-50/60 p-3 rounded-xl border border-stone-200/70 hover:bg-stone-50 transition-colors">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900">{act.title}</span>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {formatTimeAgo(act.created_at)}
                    </span>
                  </div>

                  {act.description && (
                    <p className="text-xs text-stone-700 mt-1 whitespace-pre-wrap">
                      {act.description}
                    </p>
                  )}

                  {act.metadata?.outcome && (
                    <div className="mt-1.5 inline-block text-[10px] font-semibold text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded-md">
                      Outcome: {act.metadata.outcome}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-400">
                    {act.staff ? (
                      <span>by {act.staff.full_name}</span>
                    ) : (
                      <span>System auto-log</span>
                    )}
                    <span>•</span>
                    <span>{formatDateDetailed(act.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
