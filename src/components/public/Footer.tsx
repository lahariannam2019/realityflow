import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, CheckCircle2, MapPin, Mail, Phone, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* Credibility highlights bar */}
      <div className="border-b border-stone-800/80 bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-stone-100">Verified Property Listings</p>
                <p className="text-xs text-stone-400">Directly authenticated builder portfolios in Hyderabad</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-stone-100">Curated Hyderabad Neighborhoods</p>
                <p className="text-xs text-stone-400">Jubilee Hills, Kokapet, Financial District, Banjara Hills</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-stone-100">Confidential Buyer Advisory</p>
                <p className="text-xs text-stone-400">Private negotiations & bespoke site viewings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">
                UrbanNest<span className="text-amber-400 font-serif italic ml-1">Realty</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Hyderabad’s premier destination for bespoke luxury residences, penthouses, and gated community villas.
            </p>
            <div className="pt-2 text-xs text-stone-500">
              Demo real estate business powered by{' '}
              <span className="text-amber-400 font-medium">RealityFlow Lead Management</span>.
            </div>
          </div>

          {/* Prime Locations */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-200 mb-4">
              Prime Hyderabad
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link href="/properties?location=Jubilee+Hills" className="hover:text-amber-400 transition-colors">Jubilee Hills</Link></li>
              <li><Link href="/properties?location=Banjara+Hills" className="hover:text-amber-400 transition-colors">Banjara Hills</Link></li>
              <li><Link href="/properties?location=Kokapet" className="hover:text-amber-400 transition-colors">Kokapet Sky Mansions</Link></li>
              <li><Link href="/properties?location=Financial+District" className="hover:text-amber-400 transition-colors">Financial District</Link></li>
              <li><Link href="/properties?location=Tellapur" className="hover:text-amber-400 transition-colors">Tellapur Gated Villas</Link></li>
              <li><Link href="/properties?location=Hitec+City" className="hover:text-amber-400 transition-colors">Hitec City & Madhapur</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-200 mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link href="/properties?type=villa" className="hover:text-amber-400 transition-colors">Luxury Villas</Link></li>
              <li><Link href="/properties?type=penthouse" className="hover:text-amber-400 transition-colors">Exclusive Penthouses</Link></li>
              <li><Link href="/properties?type=apartment" className="hover:text-amber-400 transition-colors">High-Rise Apartments</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Book Private Consultation</Link></li>
              <li><Link href="/dashboard" className="text-amber-400/90 hover:text-amber-300 font-medium transition-colors">Staff Login (RealityFlow)</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-200 mb-4">
              Advisory Office
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 40 6800 1200 / +91 98490 12345</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>advisory@urbannest.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} UrbanNest Realty. Fictional demo property portal.</p>
          <div className="flex items-center gap-6">
            <span>Powered by <strong className="text-stone-300 font-semibold">RealityFlow</strong> AI Lead Platform</span>
            <Link href="/dashboard" className="text-stone-400 hover:text-amber-400 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
