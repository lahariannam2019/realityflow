import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

const SESSION_COOKIE_NAME = 'realityflow_session';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    if (!session || !session.authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    return NextResponse.json({ authenticated: true, user: session });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'login';

    if (action === 'logout') {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Supabase signOut notice:', e);
        }
      }

      const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
      // Set expired cookie on root path to ensure all browser variants drop the cookie
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

    if (action === 'demo_login') {
      const demoUser = {
        id: 'staff-demo-prospect',
        email: 'demo.advisor@urbannest.in',
        name: 'Demo Sales Advisor',
        role: 'staff',
        authenticated: true,
        is_demo: true,
      };

      const response = NextResponse.json({
        success: true,
        user: demoUser,
        message: 'Live demo session authenticated successfully',
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: JSON.stringify(demoUser),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required.' },
          { status: 400 }
        );
      }

      const cleanEmail = email.toLowerCase().trim();

      // 1. If Supabase is connected, attempt Supabase Auth
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data.user) {
          const sessionPayload = {
            id: data.user.id,
            email: data.user.email,
            role: 'staff',
            authenticated: true,
          };

          const response = NextResponse.json({
            success: true,
            user: sessionPayload,
          });

          response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: JSON.stringify(sessionPayload),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });

          return response;
        }
      }

      // 2. Check against environment variables (for testing & development without hardcoding)
      const testEmail = (process.env.TEST_STAFF_EMAIL || '').toLowerCase().trim();
      const testPassword = process.env.TEST_STAFF_PASSWORD || '';

      if (testEmail && testPassword && cleanEmail === testEmail && password === testPassword) {
        const sessionPayload = {
          id: 'staff-dev-01',
          email: testEmail,
          name: 'UrbanNest Senior Advisor',
          role: 'staff',
          authenticated: true,
        };

        const response = NextResponse.json({
          success: true,
          user: sessionPayload,
        });

        response.cookies.set({
          name: SESSION_COOKIE_NAME,
          value: JSON.stringify(sessionPayload),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
      }

      return NextResponse.json(
        { success: false, error: 'Invalid email or password. Please verify your staff credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error in /api/auth:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
