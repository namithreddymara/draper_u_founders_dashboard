'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn, Sun, UserPlus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login, loginWithGoogle, signup } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@draperu.io');
  const [password, setPassword] = useState('password123');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          router.push(redirectUrl);
        } else {
          setError(res.error || 'Invalid credentials');
          setLoading(false);
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        const res = await signup({ name, email, password, company });
        if (res.success) {
          router.push(redirectUrl);
        } else {
          setError(res.error || 'Failed to create account');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed');
      setLoading(false);
    }
  };

  const handleQuickFill = (accEmail: string) => {
    setEmail(accEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4f8' }}>
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d2050 60%, #0a1f45 100%)' }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient glow */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <div className="absolute bottom-32 left-10 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />

        {/* Brand & Headline */}
        <div className="relative z-10">
          <div className="flex flex-col items-center gap-3 mb-10">
            {/* Shield Logo */}
            <div className="w-20 h-20 relative flex items-center justify-center">
              <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M40 2L6 16V44C6 62 21 76 40 88C59 76 74 62 74 44V16L40 2Z" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" />
                <path d="M40 8L12 20V44C12 59 24 71 40 82C56 71 68 59 68 44V20L40 8Z" fill="#1d4ed8" />
                <text x="40" y="58" textAnchor="middle" fill="white" fontSize="36" fontWeight="900" fontFamily="system-ui">D</text>
                <path d="M32 22L40 14L36 30H44L36 38" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black tracking-widest text-white">
                DRAPER<span style={{ color: '#38bdf8' }}>U</span>
              </div>
              <div className="text-xs font-bold tracking-[0.3em] text-blue-300 mt-0.5">INDIA</div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white leading-tight">
              Empowering Founders.<br />
              Building <span style={{ color: '#38bdf8' }}>Bharat.</span>
            </h1>
            <div className="w-12 h-0.5 rounded-full" style={{ background: '#3b82f6' }} />
            <p className="text-sm text-blue-200 leading-relaxed max-w-xs">
              DraperU India is building the most powerful founder community and startup ecosystem in the country.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-black text-white">5,000+</div>
              <div className="text-[11px] text-blue-300">Founders</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-black text-white">3,000+</div>
              <div className="text-[11px] text-blue-300">Startups</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-black text-white">500+</div>
              <div className="text-[11px] text-blue-300">Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col bg-white relative overflow-y-auto">
        {/* Top Header Mode Indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Light Mode</span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-12 max-w-md mx-auto w-full">
          {/* Mobile brand header */}
          <div className="lg:hidden mb-6 flex flex-col items-center">
            <div className="text-2xl font-black tracking-widest text-slate-900">
              DRAPER<span style={{ color: '#2563eb' }}>U</span> INDIA
            </div>
          </div>

          <div className="w-full space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-slate-900">
                {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'login'
                  ? 'Login to access your DraperU India dashboard'
                  : 'Join the premier Indian founder ecosystem'}
              </p>
            </div>

            {/* Quick Demo Fill Buttons */}
            {mode === 'login' && (
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                <div className="flex items-center justify-between mb-1.5 text-blue-900 font-semibold text-[11px]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Quick Demo Logins:
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@draperu.io')}
                    className="py-1 px-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-[10px] hover:bg-blue-600 hover:text-white transition truncate"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('rohit@draperu.io')}
                    className="py-1 px-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-[10px] hover:bg-blue-600 hover:text-white transition truncate"
                  >
                    Community
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('priya@draperu.io')}
                    className="py-1 px-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-[10px] hover:bg-blue-600 hover:text-white transition truncate"
                  >
                    Event Ops
                  </button>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (for Signup) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Company (for Signup) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Startup / Company (Optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. ApexAI Labs"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 transition disabled:opacity-70 cursor-pointer"
              >
                {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>
                  {loading
                    ? mode === 'login'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : mode === 'login'
                    ? 'Login'
                    : 'Create Account'}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="text-center text-xs text-slate-500 pt-2">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Create one here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="mt-8 text-[11px] text-slate-400">© 2026 DraperU India. All rights reserved.</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered DraperU email address and we will send you a password reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Reset link sent to {forgotEmail || email}!</span>
              </div>
            ) : (
              <input
                type="email"
                value={forgotEmail || email}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@draperu.io"
                className="w-full px-3.5 py-2.5 mb-4 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              {!forgotSuccess && (
                <button
                  type="button"
                  onClick={() => setForgotSuccess(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
