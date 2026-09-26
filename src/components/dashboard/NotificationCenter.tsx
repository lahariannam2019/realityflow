'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Flame, Calendar, Clock, UserCheck, Sparkles, Check, X } from 'lucide-react';
import { Notification } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import { useRealtimeCRM } from '@/hooks/useRealtimeCRM';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Listen for realtime notifications
  useRealtimeCRM({
    onNewNotification: (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    },
  });

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_high_lead':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'followup_due':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'site_visit_reminder':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'lead_assigned':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'ai_completed':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between p-3.5 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900">CRM Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    notif.is_read ? 'bg-white hover:bg-stone-50' : 'bg-amber-50/40 hover:bg-amber-50/70'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-xs font-bold text-stone-900 truncate">{notif.title}</p>
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{notif.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-1">
                      {notif.link_url ? (
                        <Link
                          href={notif.link_url}
                          onClick={() => {
                            if (!notif.is_read) markAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900"
                        >
                          View Lead →
                        </Link>
                      ) : <div />}
                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={(e) => markAsRead(notif.id, e)}
                          className="text-[10px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
