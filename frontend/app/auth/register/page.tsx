'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function WonderMediaRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 sm:px-6 font-sans">
        <div className="floating-shell w-full max-w-[460px] p-8 sm:p-10 ring-1 ring-white/10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-semibold mb-2">Account Created!</div>
          <p className="text-white/50 mb-6">Welcome to WonderMedia. Redirecting to your dashboard...</p>
          <div className="flex justify-center">
            <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] rounded-full animate-[shrink_2s_linear]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 sm:px-6 font-sans">
      <div className="floating-shell w-full max-w-[460px] p-8 sm:p-10 ring-1 ring-white/10">
        <Link href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="WonderMedia" className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover" />
            <div className="font-semibold text-3xl sm:text-4xl tracking-[-1.5px]">WonderMedia</div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-3xl sm:text-4xl font-semibold tracking-[-1.5px]">Create your account</div>
          <p className="text-white/50 mt-2">Start your free journey with WonderMedia</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs tracking-[2px] font-mono text-white/50 mb-2">FULL NAME</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#7c3aed] transition-colors"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-[2px] font-mono text-white/50 mb-2">EMAIL ADDRESS</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#7c3aed] transition-colors"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-[2px] font-mono text-white/50 mb-2">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#7c3aed] transition-colors pr-12"
                placeholder="Create a strong password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neon-button w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>

        <div className="text-center mt-8 text-sm text-white/60">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
