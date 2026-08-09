'use client';

import React, { useEffect, useState } from 'react';
import { useBusinessProfile, useUpdateBusinessProfile } from '@/hooks/useBusiness';
import { toast } from 'sonner';

export default function BusinessSettings() {
  const { data: profile, isLoading } = useBusinessProfile();
  const updateProfile = useUpdateBusinessProfile();
  const [form, setForm] = useState({
    name: '',
    industry: '',
    website: '',
    voice: '',
    audience: '',
    primaryColor: '#7c3aed',
    secondaryColor: '#ec4899',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        industry: profile.industry || '',
        website: profile.website || '',
        voice: profile.voice || '',
        audience: profile.audience || '',
        primaryColor: profile.primaryColor || '#7c3aed',
        secondaryColor: profile.secondaryColor || '#ec4899',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(form);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10 max-w-3xl">
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="font-mono text-xs tracking-[3px] text-white/50">SETTINGS</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Business Profile</div>
      </div>

      <div className="px-4 sm:px-8 pb-10">
        <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="h-3 bg-white/10 rounded w-24 mb-3" />
                  <div className="h-12 bg-white/5 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">BUSINESS NAME</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">INDUSTRY</label>
                <input type="text" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="w-full" />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">WEBSITE</label>
                <input type="url" value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="w-full" />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">BRAND VOICE</label>
                <textarea value={form.voice} onChange={e => setForm({...form, voice: e.target.value})} className="w-full h-24" />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">TARGET AUDIENCE</label>
                <input type="text" value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PRIMARY COLOR</label>
                  <div className="flex gap-3">
                    <input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} className="w-12 h-12 rounded-xl border-0 cursor-pointer" />
                    <input type="text" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} className="flex-1" />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">SECONDARY COLOR</label>
                  <div className="flex gap-3">
                    <input type="color" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} className="w-12 h-12 rounded-xl border-0 cursor-pointer" />
                    <input type="text" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} className="flex-1" />
                  </div>
                </div>
              </div>

              <button className="neon-button w-full mt-4" onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
