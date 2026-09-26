import { NextRequest } from 'next/server';
import { realtimeEmitter } from '@/lib/realtime/emitter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (eventType: string, data: any) => {
        try {
          const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Controller might be closed
        }
      };

      // Initial connection ping
      sendEvent('connected', { timestamp: new Date().toISOString() });

      const onEnquiry = (enquiry: any) => sendEvent('enquiry', enquiry);
      const onAnalysis = (analysis: any) => sendEvent('analysis', analysis);
      const onNotification = (notif: any) => sendEvent('notification', notif);

      realtimeEmitter.on('enquiry', onEnquiry);
      realtimeEmitter.on('analysis', onAnalysis);
      realtimeEmitter.on('notification', onNotification);

      // Heartbeat every 15s to keep proxy/browser connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        realtimeEmitter.off('enquiry', onEnquiry);
        realtimeEmitter.off('analysis', onAnalysis);
        realtimeEmitter.off('notification', onNotification);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
