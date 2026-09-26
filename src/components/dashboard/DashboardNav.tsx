'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Home,
  Calendar,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';

interface DashboardNavProps {
  user: {
    email?: string;
    name?: string;
    role?: string;
    is_demo?: boolean;
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Hard navigation to /login guarantees clearing of Next.js client-side router cache
      window.location.href = '/login';
    }
  };

  const navItems = [
    { label: 'Leads CRM', href: '/dashboard', icon: Users, exact: true },
    { label: 'Site Visits', href: '/dashboard/visits', icon: Calendar, exact: false },
    { label: 'Property Listings', href: '/dashboard/properties', icon: Home, exact: false },
  ];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-amber-400 shadow-sm">
                <Building2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base font-bold text-stone-900 tracking-tight block">
                  Reality<span className="text-amber-600 font-serif italic">Flow</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block -mt-0.5">
                  UrbanNest Staff CRM
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Public Site Link, Notification Center, User Info, Logout */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <span>View Public Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            <div className="h-4 w-px bg-stone-200" />

            {/* Realtime Notification Center */}
            <NotificationCenter />

            {/* User Avatar & Tag */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs border border-amber-200">
                {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-stone-800 leading-tight">
                    {user.name || 'Sales Advisor'}
                  </p>
                  {user.is_demo && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      LIVE DEMO
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-400 truncate max-w-[140px]">
                  {user.email || 'staff@realityflow'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center"
              title="Sign Out"
              aria-label="Sign Out"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <NotificationCenter />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <item.icon className="w-4 h-4 text-stone-500" />
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 truncate max-w-[200px]">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-xs text-rose-600 font-semibold px-2 py-1 rounded hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loggingOut ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
