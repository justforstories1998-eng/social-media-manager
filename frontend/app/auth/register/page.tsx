'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Sparkles, CheckCircle, Star, Zap, Calendar, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function WonderMediaRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, router]);

  useEffect(() => {
    let strength = 0;
    if (form.password.length >= 8) strength++;
    if (/[A-Z]/.test(form.password)) strength++;
    if (/[0-9]/.test(form.password)) strength++;
    if (/[^A-Za-z0-9]/.test(form.password)) strength++;
    setPasswordStrength(strength);
  }, [form.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      setShowSuccess(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4 sm:px-6 font-sans overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 16% 20%, rgba(45,212,191,.55) 0%, transparent 60%),
                radial-gradient(ellipse 70% 55% at 86% 26%, rgba(232,121,249,.50) 0%, transparent 60%),
                radial-gradient(ellipse 65% 50% at 64% 90%, rgba(45,212,191,.30) 0%, transparent 60%),
                radial-gradient(ellipse 60% 45% at 30% 82%, rgba(232,121,249,.26) 0%, transparent 60%),
                radial-gradient(ellipse 55% 40% at 78% 70%, rgba(94,234,212,.22) 0%, transparent 60%)
              `,
              filter: 'blur(42px) saturate(155%)',
              animation: 'drift 22s ease-in-out infinite alternate',
            }}
          />
        </div>
        <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(transparent 40%, rgba(5,7,10,.55) 100%)' }} />
        <div
          className="relative z-10 w-full max-w-md p-9 text-center rounded-3xl"
          style={{
            background: 'linear-gradient(155deg, rgba(255,255,255,.11), rgba(255,255,255,.025))',
            backdropFilter: 'blur(26px) saturate(130%)',
            border: '1px solid rgba(255,255,255,.12)',
            boxShadow: '0 40px 120px -30px rgba(0,0,0,.85)',
          }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(45,212,191,.15)' }}>
              <CheckCircle className="w-10 h-10 text-[#2dd4bf]" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-white mb-2">Account Created!</div>
          <p className="text-slate-400 text-sm mb-6">Welcome to WonderMedia. Redirecting to your dashboard...</p>
          <div className="flex justify-center">
            <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
              <div
                className="h-full rounded-full animate-[shrink_2s_linear]"
                style={{ background: 'linear-gradient(90deg, #2dd4bf, #e879f9)' }}
              />
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes shrink { from { width: 100%; } to { width: 0%; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] flex flex-col font-sans overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 16% 20%, rgba(45,212,191,.55) 0%, transparent 60%),
              radial-gradient(ellipse 70% 55% at 86% 26%, rgba(232,121,249,.50) 0%, transparent 60%),
              radial-gradient(ellipse 65% 50% at 64% 90%, rgba(45,212,191,.30) 0%, transparent 60%),
              radial-gradient(ellipse 60% 45% at 30% 82%, rgba(232,121,249,.26) 0%, transparent 60%),
              radial-gradient(ellipse 55% 40% at 78% 70%, rgba(94,234,212,.22) 0%, transparent 60%)
            `,
            filter: 'blur(42px) saturate(155%)',
            animation: 'drift 22s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Grain Overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(transparent 40%, rgba(5,7,10,.55) 100%)',
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50" style={{ background: 'rgba(11,15,20,.55)', backdropFilter: 'blur(16px) saturate(140%)', borderBottom: '1px solid rgba(255,255,255,.10)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(105deg, #2dd4bf, #5eead4 35%, #e879f9)' }}>
              <Sparkles className="w-5 h-5 text-[#0b0f14]" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">WonderMedia</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-slate-300 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium text-white px-4 py-2 rounded-full border border-white/15 hover:bg-white/10 transition-colors"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center pt-28 pb-20 px-6">
        <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          {/* LEFT — Marketing Pitch */}
          <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
            {/* Trial Pill */}
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8" style={{ background: 'rgba(45,212,191,.1)', border: '1px solid rgba(45,212,191,.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
              <span className="text-xs font-medium text-[#2dd4bf]/90">14-day Pro trial &middot; no card</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-white text-[2.6rem] leading-[1.05] sm:text-5xl lg:text-[3.4rem] tracking-tight">
              Your social media on{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(100deg, #5eead4, #2dd4bf 30%, #e879f9)' }}
              >
                autopilot.
              </span>
            </h1>

            {/* Lead Paragraph */}
            <p className="mt-5 text-slate-400 text-base sm:text-lg leading-relaxed">
              Create stunning posts, schedule weeks of content, and grow your audience with AI that knows your brand inside out. Join 57,000 creators already using WonderMedia.
            </p>

            {/* Benefits */}
            <div className="mt-8 space-y-3.5">
              {[
                { icon: <Zap className="w-4 h-4" />, text: 'AI-generated posts, captions, and hashtags' },
                { icon: <Calendar className="w-4 h-4" />, text: 'Smart scheduling across Instagram, Twitter, LinkedIn' },
                { icon: <BarChart3 className="w-4 h-4" />, text: 'Performance analytics and growth insights' },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-[#2dd4bf] flex-shrink-0" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full ring-2 ring-[#0b0f14] flex items-center justify-center text-xs font-semibold text-white"
                    style={{
                      background: i === 1 ? 'linear-gradient(135deg, #2dd4bf, #2dd4bf)' :
                                  i === 2 ? 'linear-gradient(135deg, #e879f9, #f472b6)' :
                                  i === 3 ? 'linear-gradient(135deg, #38bdf8, #2dd4bf)' :
                                  'linear-gradient(135deg, #f472b6, #e879f9)',
                    }}
                  >
                    {['A', 'M', 'K', 'S'][i - 1]}
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400">
                <Star className="w-3.5 h-3.5 text-amber-300 inline mr-1" />
                <span className="font-bold text-slate-300">4.9</span> from 2,300+ social media managers
              </div>
            </div>
          </div>

          {/* RIGHT — Auth Card */}
          <div className="w-full max-w-md mx-auto">
            <div
              className="relative rounded-3xl p-7 sm:p-9"
              style={{
                background: 'linear-gradient(155deg, rgba(255,255,255,.11), rgba(255,255,255,.025))',
                backdropFilter: 'blur(26px) saturate(130%)',
                border: '1px solid rgba(255,255,255,.12)',
                boxShadow: '0 40px 120px -30px rgba(0,0,0,.85)',
              }}
            >
              {/* Gradient Edge Light */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(45,212,191,.55), rgba(232,121,249,.45), transparent)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  padding: '1px',
                  opacity: 0.7,
                }}
              />

              {/* Inner Sheen */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,.12) 0%, transparent 40%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)',
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-7">
                  <h2 className="font-display font-bold text-2xl sm:text-[1.7rem] text-white tracking-tight">
                    Create your account
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Start building in under a minute.</p>
                </div>

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2dd4bf] transition-colors" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full rounded-xl h-12 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-400/40 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,.045)',
                        border: '1px solid rgba(255,255,255,.10)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background = 'rgba(45,212,191,.06)';
                        e.currentTarget.style.borderColor = 'rgba(45,212,191,.65)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45,212,191,.14), 0 0 28px rgba(45,212,191,.22)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,.045)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,.10)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2dd4bf] transition-colors" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full rounded-xl h-12 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-400/40 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,.045)',
                        border: '1px solid rgba(255,255,255,.10)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background = 'rgba(45,212,191,.06)';
                        e.currentTarget.style.borderColor = 'rgba(45,212,191,.65)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45,212,191,.14), 0 0 28px rgba(45,212,191,.22)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,.045)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,.10)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="you@company.com"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2dd4bf] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({...form, password: e.target.value})}
                      className="w-full rounded-xl h-12 pl-11 pr-16 text-sm text-slate-100 placeholder:text-slate-400/40 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,.045)',
                        border: '1px solid rgba(255,255,255,.10)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background = 'rgba(45,212,191,.06)';
                        e.currentTarget.style.borderColor = 'rgba(45,212,191,.65)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45,212,191,.14), 0 0 28px rgba(45,212,191,.22)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,.045)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,.10)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Create a password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2dd4bf] hover:text-[#e879f9] transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {form.password && (
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            background: i < passwordStrength ? '#2dd4bf' : 'rgba(255,255,255,.10)',
                          }}
                        />
                      ))}
                      <span className="text-xs text-slate-400 ml-2 min-w-[50px]">
                        {strengthLabels[passwordStrength - 1] || 'Weak'}
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl h-12 mt-2 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      background: 'linear-gradient(105deg, #2dd4bf, #5eead4 35%, #e879f9)',
                      color: '#0b0f14',
                      boxShadow: '0 4px 20px rgba(45,212,191,.3), 0 4px 20px rgba(232,121,249,.2)',
                    }}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                {/* Legal */}
                <p className="text-center mt-5 text-xs text-slate-500">
                  By signing up you agree to our{' '}
                  <Link href="#" className="text-slate-300 hover:text-[#2dd4bf] underline transition-colors">Terms</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-slate-300 hover:text-[#2dd4bf] underline transition-colors">Privacy Policy</Link>.
                </p>

                {/* Footer */}
                <div className="text-center mt-5 text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-semibold bg-clip-text text-transparent hover:opacity-80 transition-opacity" style={{ backgroundImage: 'linear-gradient(100deg, #5eead4, #2dd4bf 30%, #e879f9)' }}>
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Strip */}
      <section className="relative z-10 border-t border-white/10" style={{ background: 'rgba(255,255,255,.015)' }}>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-slate-500 mb-8">
            Trusted by teams shipping fast
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
            {[
              { name: 'ContentPro', icon: <Sparkles className="w-5 h-5" /> },
              { name: 'SocialFlow', icon: <Zap className="w-5 h-5" /> },
              { name: 'BrandSync', icon: <BarChart3 className="w-5 h-5" /> },
              { name: 'PostCraft', icon: <Calendar className="w-5 h-5" /> },
              { name: 'ReachHQ', icon: <Star className="w-5 h-5" /> },
            ].map((brand) => (
              <div key={brand.name} className="flex items-center gap-2 text-slate-300">
                <span className="text-[#2dd4bf]">{brand.icon}</span>
                <span className="font-display font-semibold text-lg">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aurora Keyframes */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        :root {
          color-scheme: dark;
        }

        body {
          background: #0b0f14;
        }

        .font-sans {
          font-family: 'Inter', system-ui, sans-serif;
        }

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        @keyframes drift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(30px, -20px, 0) scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}
