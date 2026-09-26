'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Phone, Menu, X, ShieldCheck, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">
                UrbanNest<span className="text-amber-400 font-serif italic ml-1">Realty</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 block -mt-0.5">
                Hyderabad Prime Residences
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/properties"
              className="text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors"
            >
              Browse Properties
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors"
            >
              Contact Advisors
            </Link>
          </nav>

          {/* Quick Actions & Staff Portal */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:+914068001200"
              className="flex items-center gap-2 text-xs font-medium text-stone-300 hover:text-white px-3 py-2 rounded-md hover:bg-stone-800/60 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>+91 40 6800 1200</span>
            </a>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-amber-400/40 transition-all shadow-sm"
              title="Staff Portal (RealityFlow Dashboard)"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Portal</span>
            </Link>

            <Link
              href="/properties"
              className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 shadow-md hover:shadow-amber-500/20 transition-all"
            >
              Explore Homes
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs px-2.5 py-1.5 rounded bg-stone-800 text-amber-400 border border-stone-700 font-medium"
            >
              Staff
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-stone-400 hover:text-white hover:bg-stone-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-stone-800"
          >
            Home
          </Link>
          <Link
            href="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-stone-800"
          >
            Browse Properties
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-stone-800"
          >
            Contact Advisors
          </Link>
          <div className="pt-4 border-t border-stone-800 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-stone-800 text-stone-200 font-medium text-sm border border-stone-700"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>RealityFlow Staff Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
