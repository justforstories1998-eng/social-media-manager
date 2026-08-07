'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function WonderMediaRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 sm:px-6 font-sans">
      <div className="floating-shell w-full max-w-[460px] p-8 sm:p-10 ring-1 ring-white/10">
        <Link href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] flex items-center justify-center">
              <span className="font-bold text-2xl sm:text-3xl text-white">W</span>
            </div>
            <div className="font-semibold text-3xl sm:text-4xl tracking-[-1.5px]">WonderMedia</div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-3xl sm:text-4xl font-semibold tracking-[-1.5px]">Create your account</div>
          <p className="text-white/50 mt-2">Start your free journey with WonderMedia</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}>
          <div>
            <label className="block text-xs tracking-[2px] font-mono text-white/50 mb-2">FULL NAME</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm" 
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm" 
              placeholder="you@company.com" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs tracking-[2px] font-mono text-white/50 mb-2">PASSWORD</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm" 
              placeholder="Create a strong password" 
              required 
            />
          </div>

          <button type="submit" className="neon-button w-full mt-4">Create Free Account</button>
        </form>

        <div className="text-center mt-8 text-sm text-white/60">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
