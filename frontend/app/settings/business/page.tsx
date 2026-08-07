'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function BusinessSettings() {
  const [form, setForm] = useState({
    name: 'EcoBottle Co.',
    industry: 'Sustainable Products',
    website: 'https://ecobottle.co',
    voice: 'Friendly, eco-conscious, and inspiring',
    audience: 'Environmentally conscious millennials',
    primaryColor: '#7c3aed',
    secondaryColor: '#ec4899',
  });

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      <div className="floating-shell mx-auto my-6 ring-1 ring-white/10">
        <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="font-semibold text-2xl tracking-tight">WonderMedia</Link>
          <div className="font-mono text-xs tracking-[3px] text-white/50">SETTINGS</div>
        </div>

        <div className="px-4 sm:px-8 pt-9 pb-6">
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Business Profile</div>
        </div>

        <div className="px-4 sm:px-8 pb-10">
          <div className="glass p-6 sm:p-9 rounded-[2.5rem] max-w-2xl">
            <div className="space-y-6">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">BUSINESS NAME</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">INDUSTRY</label>
                <input 
                  type="text" 
                  value={form.industry} 
                  onChange={e => setForm({...form, industry: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">WEBSITE</label>
                <input 
                  type="url" 
                  value={form.website} 
                  onChange={e => setForm({...form, website: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">BRAND VOICE</label>
                <textarea 
                  value={form.voice} 
                  onChange={e => setForm({...form, voice: e.target.value})}
                  className="w-full h-24"
                />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">TARGET AUDIENCE</label>
                <input 
                  type="text" 
                  value={form.audience} 
                  onChange={e => setForm({...form, audience: e.target.value})}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PRIMARY COLOR</label>
                  <div className="flex gap-3">
                    <input 
                      type="color" 
                      value={form.primaryColor} 
                      onChange={e => setForm({...form, primaryColor: e.target.value})}
                      className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={form.primaryColor} 
                      onChange={e => setForm({...form, primaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">SECONDARY COLOR</label>
                  <div className="flex gap-3">
                    <input 
                      type="color" 
                      value={form.secondaryColor} 
                      onChange={e => setForm({...form, secondaryColor: e.target.value})}
                      className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={form.secondaryColor} 
                      onChange={e => setForm({...form, secondaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <button className="neon-button w-full mt-4" onClick={() => alert('Settings saved!')}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
