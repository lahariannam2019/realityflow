import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import EnquiryForm from '@/components/public/EnquiryForm';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Advisory & Consultation
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Private Real Estate Advisory
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
          Whether you are looking for an off-market luxury villa in Jubilee Hills or evaluating high-yield assets in the Financial District, our senior partners are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Office & Direct Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-stone-900">Advisory Headquarters</h2>

            <div className="space-y-4 text-xs sm:text-sm text-stone-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">UrbanNest Executive Office</p>
                  <p>Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Direct Desk</p>
                  <p>+91 40 6800 1200 / +91 98490 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Email Inquiries</p>
                  <p>advisory@urbannest.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Private Viewings Hours</p>
                  <p>Monday – Sunday: 9:00 AM – 7:30 PM (By prior appointment)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credibility highlights */}
          <div className="bg-stone-900 rounded-2xl p-6 text-stone-200 border border-stone-800 space-y-4">
            <h3 className="text-sm font-semibold text-white">Why Work With UrbanNest?</h3>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Verified Property Listings across Hyderabad</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero markup — direct builder pricing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Strict confidentiality and non-disclosure guarantees</span>
              </li>
            </ul>
          </div>
        </div>

        {/* General Consultation Form (7 cols) */}
        <div className="lg:col-span-7">
          <EnquiryForm
            source="contact_form"
            defaultLocation="Hyderabad"
          />
        </div>
      </div>
    </div>
  );
}
