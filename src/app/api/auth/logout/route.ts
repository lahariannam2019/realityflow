import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

const SESSION_COOKIE_NAME = 'realityflow_session';

async function performLogout(request: NextRequest) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut notice:', e);
    }
  }

  const isHtml = request.headers.get('accept')?.includes('text/html');
  const response = isHtml
    ? NextResponse.redirect(new URL('/login', request.url))
    : NextResponse.json({ success: true, message: 'Logged out successfully' });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}

export async function GET(request: NextRequest) {
  return performLogout(request);
}

export async function POST(request: NextRequest) {
  return performLogout(request);
}
