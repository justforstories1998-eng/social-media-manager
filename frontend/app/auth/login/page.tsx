'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-6 font-sans overflow-hidden relative">
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

      {/* Auth Card */}
      <div
        className="relative z-10 w-full max-w-md p-9 rounded-3xl"
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
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/logo.jpg" alt="WonderMedia" className="w-14 h-14 rounded-2xl object-cover" />
          </div>

          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="font-display font-bold text-2xl sm:text-[1.7rem] text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to your WonderMedia account</p>
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
                className="w-full rounded-xl h-12 px-4 text-sm text-slate-100 placeholder:text-slate-400/40 focus:outline-none transition-all"
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
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl h-12 px-4 pr-16 text-sm text-slate-100 placeholder:text-slate-400/40 focus:outline-none transition-all"
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
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2dd4bf] hover:text-[#e879f9] transition-colors"
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
                background: 'linear-gradient(105deg, #2dd4bf, #5eead4 35%, #e879f9)',
                color: '#0b0f14',
                boxShadow: '0 4px 20px rgba(45,212,191,.3), 0 4px 20px rgba(232,121,249,.2)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold bg-clip-text text-transparent hover:opacity-80 transition-opacity" style={{ backgroundImage: 'linear-gradient(100deg, #5eead4, #2dd4bf 30%, #e879f9)' }}>
              Create account
            </Link>
          </div>
        </div>
      </div>

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
