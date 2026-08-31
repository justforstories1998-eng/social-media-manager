'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Zap, Calendar, BarChart3, CheckCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function WonderMediaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col font-sans overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 16% 20%, rgba(124,58,237,.55) 0%, transparent 60%),
              radial-gradient(ellipse 70% 55% at 86% 26%, rgba(236,72,153,.50) 0%, transparent 60%),
              radial-gradient(ellipse 65% 50% at 64% 90%, rgba(124,58,237,.30) 0%, transparent 60%),
              radial-gradient(ellipse 60% 45% at 30% 82%, rgba(236,72,153,.26) 0%, transparent 60%),
              radial-gradient(ellipse 55% 40% at 78% 70%, rgba(124,58,237,.22) 0%, transparent 60%)
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
      <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6 lg:px-10" style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(16px) saturate(140%)', borderBottom: '1px solid rgba(255,255,255,.10)' }}>
        <Link href="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center pt-16 pb-10 px-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          {/* LEFT — Marketing Pitch */}
          <div className="max-w-md mx-auto lg:mx-0 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
              <img src="/logo.jpg" alt="WonderMedia" className="w-11 h-11 rounded-2xl object-cover" />
              <span className="font-semibold text-2xl tracking-tight">WonderMedia</span>
            </div>

            <h1 className="font-display font-bold text-white text-[2.4rem] leading-[1.08] sm:text-5xl tracking-tight">
              Manage social media at the{' '}
              <span className="bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#7c3aed] bg-clip-text text-transparent">
                speed of thought.
              </span>
            </h1>

            <p className="mt-5 text-white/50 text-base sm:text-lg leading-relaxed">
              Create posts, schedule content, and manage your entire social presence with AI that understands your brand. Built for creators who move fast.
            </p>

            <div className="mt-8 space-y-3.5">
              {[
                { icon: <Zap className="w-4 h-4" />, text: 'AI-generated posts and captions in seconds' },
                { icon: <Calendar className="w-4 h-4" />, text: 'Smart scheduling across all platforms' },
                { icon: <BarChart3 className="w-4 h-4" />, text: 'Analytics and insights to grow your audience' },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-[#7c3aed] flex-shrink-0" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Auth Card */}
          <div className="w-full max-w-md mx-auto">
            <div
              className="relative rounded-3xl p-8 sm:p-9"
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
                  background: 'linear-gradient(135deg, rgba(124,58,237,.55), rgba(236,72,153,.45), transparent)',
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
                    Welcome back
                  </h2>
                  <p className="text-sm text-white/50 mt-1">Sign in to your WonderMedia account</p>
                </div>

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl h-12 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid rgba(255,255,255,.10)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background = 'rgba(124,58,237,.06)';
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,.65)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,.14), 0 0 28px rgba(124,58,237,.22)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,.10)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="you@company.com"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl h-12 px-4 pr-16 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid rgba(255,255,255,.10)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background = 'rgba(124,58,237,.06)';
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,.65)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,.14), 0 0 28px rgba(124,58,237,.22)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,.10)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#7c3aed] hover:text-[#ec4899] transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl h-12 mt-2 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 20px rgba(124,58,237,.4)',
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-white/50">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="font-semibold bg-clip-text text-transparent hover:opacity-80 transition-opacity" style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Aurora Keyframes */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        :root {
          color-scheme: dark;
        }

        body {
          background: #000000;
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
