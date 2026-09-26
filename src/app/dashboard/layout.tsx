import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  Building2,
  Users,
  Home,
  LogOut,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import DashboardNav from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('realityflow_session');

  // Route protection: redirect to login if session cookie is not found
  if (!sessionCookie?.value) {
    redirect('/login');
  }

  let sessionUser: { email?: string; name?: string; role?: string; authenticated?: boolean } = {};
  try {
    sessionUser = JSON.parse(sessionCookie.value);
    if (!sessionUser?.authenticated) {
      redirect('/login');
    }
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col">
      {/* Top Header & Navigation */}
      <DashboardNav user={sessionUser} />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Staff footer */}
      <footer className="border-t border-stone-200/80 bg-white py-4 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RealityFlow Lead Management Engine v1.0 • Single-Tenant Deployment</span>
          <span className="text-stone-500 font-medium">UrbanNest Realty Hyderabad</span>
        </div>
      </footer>
    </div>
  );
}
