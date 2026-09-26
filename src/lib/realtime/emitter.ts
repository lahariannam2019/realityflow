import { EventEmitter } from 'events';
import { Enquiry, LeadAnalysis, Notification } from '../types';

declare global {
  // eslint-disable-next-line no-var
  var __realityflow_realtime_emitter: EventEmitter | undefined;
}

if (!global.__realityflow_realtime_emitter) {
  global.__realityflow_realtime_emitter = new EventEmitter();
  global.__realityflow_realtime_emitter.setMaxListeners(200);
}

export const realtimeEmitter = global.__realityflow_realtime_emitter;

export function emitNewEnquiry(enquiry: Enquiry) {
  try {
    realtimeEmitter.emit('enquiry', enquiry);
  } catch (err) {
    console.error('Error emitting enquiry event:', err);
  }
}

export function emitAnalysisCompleted(analysis: LeadAnalysis) {
  try {
    realtimeEmitter.emit('analysis', analysis);
  } catch (err) {
    console.error('Error emitting analysis event:', err);
  }
}

export function emitNewNotification(notification: Notification) {
  try {
    realtimeEmitter.emit('notification', notification);
  } catch (err) {
    console.error('Error emitting notification event:', err);
  }
}
