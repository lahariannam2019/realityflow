import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'realityflow_session';

/**
 * Server-Side Middleware for RealityFlow
 * Guarantees strict server-side protection for /dashboard and staff APIs.
 * Frictionless customer acquisition: public pages and enquiry submission remain unblocked.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  let isAuthenticated = false;
  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      isAuthenticated = Boolean(parsed && parsed.authenticated);
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Protect all /dashboard routes (Pages)
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Protect Staff Mutating APIs
  const isProtectedApi =
    pathname.startsWith('/api/enquiries/') ||
    (pathname.startsWith('/api/properties') && request.method !== 'GET') ||
    pathname.startsWith('/api/site-visits') ||
    pathname.startsWith('/api/staff') ||
    pathname.startsWith('/api/notifications');

  if (isProtectedApi) {
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Staff authentication required.',
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
