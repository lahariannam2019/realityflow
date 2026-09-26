'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Building, PhoneCall, ShieldCheck, Home } from 'lucide-react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || 'ENQ-CONFIRMED';
  const name = searchParams.get('name') || 'Valued Client';
  const property = searchParams.get('property');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/90 shadow-xl space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Enquiry Received
          </span>
          <h1 className="text-3xl font-bold text-stone-900">
            Thank you, {name}!
          </h1>
          <p className="text-sm text-stone-600 max-w-lg mx-auto">
            Your enquiry has been successfully logged with UrbanNest Realty. Our dedicated Hyderabad property specialist will reach out shortly.
          </p>
        </div>

        {/* Confirmation Details Card */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left space-y-3 max-w-md mx-auto text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500 font-medium">Reference Code:</span>
            <span className="font-mono font-bold text-stone-800">{ref}</span>
          </div>

          {property && (
            <div className="flex justify-between items-center pb-2 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Interest:</span>
              <span className="font-semibold text-stone-800 truncate max-w-[200px]">
                {property}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-stone-500 font-medium">Expected Response:</span>
            <span className="text-emerald-700 font-semibold">Within 30–60 minutes</span>
          </div>
        </div>

        {/* Next Steps notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
          <PhoneCall className="w-4 h-4 text-amber-600" />
          <span>Need immediate assistance? Call our desk directly at <strong>+91 40 6800 1200</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <span>Browse More Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EnquiryConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-stone-400">
          Generating enquiry confirmation...
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
