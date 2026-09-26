'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, Loader2, Sparkles, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    try {
      setDemoLoading(true);
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo_login' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize live demo session.');
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo access failed. Please try again.');
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both your staff email and password.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      // Successful login -> navigate to protected dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleFillDevCredentials = () => {
    // Fills development credentials configured in .env.local
    setEmail(process.env.NEXT_PUBLIC_TEST_STAFF_EMAIL || 'agent@urbannest.in');
    setPassword(process.env.NEXT_PUBLIC_TEST_STAFF_PASSWORD || '');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-stone-100 relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-4">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 mx-auto shadow-xl">
          <Building2 className="w-7 h-7 stroke-[2.2]" />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            RealityFlow <span className="text-amber-400 font-serif italic">Portal</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Staff & Sales Advisor Dashboard — UrbanNest Realty
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-stone-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-stone-800 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Try Live Demo Section */}
          <div className="space-y-3 pb-5 border-b border-stone-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>Explore Without Credentials</span>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {demoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Accessing Live Demo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950 fill-stone-950" />
                  <span>Try Live Demo</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-400 text-center leading-relaxed">
              Instant 1-click preview with a dedicated demo sales session. Clean catalog with zero client data exposed.
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-800 w-full" />
            <span className="bg-stone-900 px-3 text-[11px] uppercase tracking-wider text-stone-500 shrink-0 font-medium">
              or sign in with staff account
            </span>
            <div className="border-t border-stone-800 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="agent@urbannest.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Development environment helper */}
          <div className="pt-4 border-t border-stone-800/80 space-y-3">
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dev Test Account</span>
                </span>
                <button
                  type="button"
                  onClick={handleFillDevCredentials}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px]"
                >
                  Quick Fill
                </button>
              </div>
              <p className="text-[11px] text-stone-500 leading-tight">
                Populates credentials configured in your local environment file (<code className="text-stone-400">.env.local</code>) for rapid testing.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-xs text-stone-400 hover:text-amber-400 transition-colors"
              >
                ← Return to UrbanNest Public Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
