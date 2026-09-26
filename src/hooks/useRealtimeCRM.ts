'use client';

import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Enquiry, LeadAnalysis, Notification } from '@/lib/types';

interface RealtimeCRMOptions {
  onNewEnquiry?: (enquiry: Enquiry) => void;
  onEnquiryUpdated?: (enquiry: Partial<Enquiry> & { id: string }) => void;
  onAnalysisCompleted?: (analysis: LeadAnalysis) => void;
  onNewNotification?: (notification: Notification) => void;
}

export function useRealtimeCRM({
  onNewEnquiry,
  onEnquiryUpdated,
  onAnalysisCompleted,
  onNewNotification,
}: RealtimeCRMOptions = {}) {
  const onNewEnquiryRef = useRef(onNewEnquiry);
  const onEnquiryUpdatedRef = useRef(onEnquiryUpdated);
  const onAnalysisCompletedRef = useRef(onAnalysisCompleted);
  const onNewNotificationRef = useRef(onNewNotification);

  useEffect(() => {
    onNewEnquiryRef.current = onNewEnquiry;
    onEnquiryUpdatedRef.current = onEnquiryUpdated;
    onAnalysisCompletedRef.current = onAnalysisCompleted;
    onNewNotificationRef.current = onNewNotification;
  });

  useEffect(() => {
    // 1. Supabase Realtime CDC (when Supabase URL/key are configured)
    let supabaseChannel: any = null;
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      supabaseChannel = client
        .channel('realityflow_crm_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'enquiries' },
          (payload) => {
            if (onNewEnquiryRef.current) {
              onNewEnquiryRef.current(payload.new as Enquiry);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'enquiries' },
          (payload) => {
            if (onEnquiryUpdatedRef.current) {
              onEnquiryUpdatedRef.current(payload.new as any);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'lead_analysis' },
          (payload) => {
            if (onAnalysisCompletedRef.current && payload.new) {
              onAnalysisCompletedRef.current(payload.new as LeadAnalysis);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            if (onNewNotificationRef.current) {
              onNewNotificationRef.current(payload.new as Notification);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[RealityFlow] Supabase Realtime CDC subscribed');
          }
        });
    }

    // 2. Server-Sent Events (SSE) Stream (works across tabs, browsers, and local dev)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime/stream');

      eventSource.addEventListener('enquiry', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (onNewEnquiryRef.current) {
            onNewEnquiryRef.current(data);
          }
        } catch (err) {
          console.error('Error parsing SSE enquiry event', err);
        }
      });

      eventSource.addEventListener('analysis', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (onAnalysisCompletedRef.current) {
            onAnalysisCompletedRef.current(data);
          }
        } catch (err) {
          console.error('Error parsing SSE analysis event', err);
        }
      });

      eventSource.addEventListener('notification', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (onNewNotificationRef.current) {
            onNewNotificationRef.current(data);
          }
        } catch (err) {
          console.error('Error parsing SSE notification event', err);
        }
      });
    } catch (err) {
      console.error('EventSource connection error:', err);
    }

    return () => {
      if (supabase && supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);
}
