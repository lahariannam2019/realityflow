'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MessageSquare,
  Building,
  ArrowRight,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  AlertCircle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Enquiry, EnquiryStatus, PriorityClassification, DashboardKPIs, StaffProfile } from '@/lib/types';
import {
  PriorityBadge,
  StatusBadge,
  VisitIntentBadge,
  AnalysisStatusBadge,
} from '@/components/dashboard/LeadBadges';
import { formatTimeAgo, formatDateDetailed } from '@/lib/utils';
import { useRealtimeCRM } from '@/hooks/useRealtimeCRM';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Stages' },
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'SITE_VISIT_SCHEDULED', label: 'Visit Sched' },
  { key: 'SITE_VISIT_COMPLETED', label: 'Visited' },
  { key: 'NEGOTIATION', label: 'Negotiation' },
  { key: 'WON', label: 'Won' },
  { key: 'LOST', label: 'Lost' },
];

export default function LeadsDashboardPage() {
  const [leads, setLeads] = useState<Enquiry[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [followUpFilter, setFollowUpFilter] = useState<string>('all');

  const fetchLeadsAndKpis = async () => {
    try {
      setRefreshing(true);
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.set('status', statusFilter);
      if (priorityFilter !== 'all') query.set('priority', priorityFilter);
      if (assignedFilter !== 'all') query.set('assignedTo', assignedFilter);
      if (followUpFilter !== 'all') query.set('followUpDue', followUpFilter);
      if (searchTerm) query.set('search', searchTerm);

      const [leadsRes, kpiRes, staffRes] = await Promise.all([
        fetch(`/api/enquiries?${query.toString()}`),
        fetch('/api/dashboard/kpis'),
        fetch('/api/staff'),
      ]);

      const leadsData = await leadsRes.json();
      const kpiData = await kpiRes.json();
      const staffData = await staffRes.json();

      if (leadsData.success) setLeads(leadsData.enquiries || []);
      if (kpiData.success) setKpis(kpiData.kpis || null);
      if (staffData.success) setStaffList(staffData.staff || []);
    } catch (err) {
      console.error('Failed to fetch leads and KPIs', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndKpis();
  }, [statusFilter, priorityFilter, assignedFilter, followUpFilter]);

  // Real-time updates: prepend new enquiries and refresh KPI counts
  useRealtimeCRM({
    onNewEnquiry: (newEnq) => {
      setLeads((prev) => [newEnq, ...prev.filter((l) => l.id !== newEnq.id)]);
      fetch('/api/dashboard/kpis')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setKpis(data.kpis);
        });
    },
    onAnalysisCompleted: (analysis) => {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === analysis.enquiry_id ? { ...l, lead_analysis: analysis } : l
        )
      );
      fetch('/api/dashboard/kpis')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setKpis(data.kpis);
        });
    },
    onEnquiryUpdated: (updated) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
      );
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeadsAndKpis();
  };

  // Quick WhatsApp helper
  const handleQuickWhatsApp = (lead: Enquiry, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const intPhone = cleanPhone.startsWith('91')
      ? cleanPhone
      : cleanPhone.length === 10
      ? `91${cleanPhone}`
      : cleanPhone;

    const propTitle = lead.property?.title || 'our luxury residences';
    const text = encodeURIComponent(
      `Hello ${lead.name}, this is UrbanNest Realty regarding your enquiry for ${propTitle}. When is a good time to speak?`
    );
    window.open(`https://wa.me/${intPhone}?text=${text}`, '_blank');
  };

  const nowTime = new Date().getTime();

  return (
    <div className="space-y-8">
      {/* Header and Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              RealityFlow Production CRM
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-1.5">
            Real Estate Leads & Pipeline
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Operational dashboard tracking high-intent buyers, agent assignments, and follow-up schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeadsAndKpis}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : 'text-stone-400'}`}
            />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads / Today */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Leads</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-stone-900">
              {kpis ? kpis.totalLeads : leads.length}
            </span>
            <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
              +{kpis?.todayLeads || 0} today
            </span>
          </div>
        </div>

        {/* High Priority Leads */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>High Intent Buyers</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-rose-700">
              {kpis ? kpis.highPriority : 0}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Ready to visit/buy</span>
          </div>
        </div>

        {/* Follow-ups Due / Overdue */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Follow-Ups Due</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-stone-900">
              {kpis ? kpis.followUpsDueToday : 0}
            </span>
            {kpis && kpis.followUpsOverdue > 0 ? (
              <span className="text-[11px] text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded">
                {kpis.followUpsOverdue} overdue
              </span>
            ) : (
              <span className="text-[11px] text-stone-500">Scheduled today</span>
            )}
          </div>
        </div>

        {/* Today's Site Visits */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Today's Visits</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-stone-900">
              {kpis ? kpis.todayVisits : 0}
            </span>
            <Link
              href="/dashboard/visits"
              className="text-[11px] text-amber-700 hover:text-amber-900 font-bold"
            >
              View Agenda →
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
        {/* CRM Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 mr-1">
            Stage:
          </span>
          {STATUS_FILTERS.map((s) => {
            const isSelected = statusFilter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatusFilter(s.key)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Search, Priority, Assignment & Follow-Up Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-stone-100">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by client, phone, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </form>

          {/* Priority Filter */}
          <div className="lg:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">🔥 HIGH Intent</option>
              <option value="MEDIUM">MEDIUM Intent</option>
              <option value="LOW">LOW Intent</option>
            </select>
          </div>

          {/* Salesperson Assignment Filter */}
          <div className="lg:col-span-3">
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="all">All Salespeople</option>
              <option value="unassigned">Unassigned Only</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          {/* Follow-up Due Filter */}
          <div className="lg:col-span-3">
            <select
              value={followUpFilter}
              onChange={(e) => setFollowUpFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="all">All Follow-ups</option>
              <option value="overdue">⚠️ Overdue Follow-ups</option>
              <option value="today">📅 Due Today</option>
              <option value="upcoming">⏳ Upcoming (Future)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            <p className="text-xs text-stone-500">Loading incoming leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No leads match criteria</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Try adjusting your stage, priority, or salesperson filters to view other leads.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Client & Contact</th>
                  <th className="py-3 px-4">AI Intent & Insights</th>
                  <th className="py-3 px-4">CRM Stage</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {leads.map((lead) => {
                  const followDate = lead.next_follow_up_at ? new Date(lead.next_follow_up_at) : null;
                  const isOverdue =
                    followDate &&
                    followDate.getTime() < nowTime &&
                    lead.status !== 'WON' &&
                    lead.status !== 'LOST';
                  const isToday =
                    followDate &&
                    followDate.toDateString() === new Date().toDateString();

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                      onClick={() => (window.location.href = `/dashboard/leads/${lead.id}`)}
                    >
                      {/* Client info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 group-hover:text-amber-900 flex items-center gap-1.5">
                          <span>{lead.name}</span>
                          {lead.lead_analysis?.visit_intent && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Visit Requested" />
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          {lead.phone}
                        </div>
                        {lead.property && (
                          <div className="text-[11px] text-stone-400 truncate max-w-[200px] mt-0.5">
                            {lead.property.title}
                          </div>
                        )}
                        <span className="text-[10px] text-stone-400 block mt-1">
                          {formatTimeAgo(lead.created_at)}
                        </span>
                      </td>

                      {/* AI Intent & Insights */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          {lead.lead_analysis?.classification ? (
                            <PriorityBadge priority={lead.lead_analysis.classification} />
                          ) : (
                            <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                              Pending
                            </span>
                          )}
                          {lead.lead_analysis?.visit_intent && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              Visit
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2">
                          {lead.lead_analysis?.summary || lead.message}
                        </p>
                      </td>

                      {/* CRM Stage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Assigned Agent */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {lead.assigned_staff ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center border border-amber-300">
                              {lead.assigned_staff.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <span className="text-xs font-medium text-stone-800">
                              {lead.assigned_staff.full_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic text-[11px] flex items-center gap-1">
                            <UserX className="w-3 h-3 text-stone-300" />
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Follow-up status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {followDate ? (
                          <div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full block w-fit ${
                                isOverdue
                                  ? 'bg-rose-100 text-rose-800'
                                  : isToday
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {isOverdue ? 'Overdue' : isToday ? 'Today' : 'Scheduled'}
                            </span>
                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              {followDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="Call customer"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-600" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => handleQuickWhatsApp(lead, e)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                            title="WhatsApp message"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors"
                            title="Open Lead Details"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
