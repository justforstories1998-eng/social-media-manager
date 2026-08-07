'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function TelegramSettings() {
  const [form, setForm] = useState({
    botToken: '',
    chatId: '',
    channelId: '',
    groupId: '',
    enabled: true,
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
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Telegram Integration</div>
        </div>

        <div className="px-4 sm:px-8 pb-10">
          <div className="glass p-6 sm:p-9 rounded-[2.5rem] max-w-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="font-semibold text-lg">Enable Telegram Bot</div>
                <div className="text-white/50 text-sm">Receive post approvals and notifications via Telegram</div>
              </div>
              <button 
                role="switch"
                aria-checked={form.enabled}
                aria-label="Enable Telegram Bot"
                onClick={() => setForm({...form, enabled: !form.enabled})}
                className={`w-14 h-7 rounded-full transition-colors ${form.enabled ? 'bg-[#7c3aed]' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.enabled ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">BOT TOKEN</label>
                <input 
                  type="password" 
                  value={form.botToken} 
                  onChange={e => setForm({...form, botToken: e.target.value})}
                  placeholder="Enter your Telegram bot token"
                  className="w-full"
                />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">CHAT ID</label>
                <input 
                  type="text" 
                  value={form.chatId} 
                  onChange={e => setForm({...form, chatId: e.target.value})}
                  placeholder="Your Telegram chat ID"
                  className="w-full"
                />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">CHANNEL ID</label>
                <input 
                  type="text" 
                  value={form.channelId} 
                  onChange={e => setForm({...form, channelId: e.target.value})}
                  placeholder="Your Telegram channel ID"
                  className="w-full"
                />
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">GROUP ID</label>
                <input 
                  type="text" 
                  value={form.groupId} 
                  onChange={e => setForm({...form, groupId: e.target.value})}
                  placeholder="Your Telegram group ID"
                  className="w-full"
                />
              </div>

              <button className="neon-button w-full mt-4" onClick={() => alert('Telegram settings saved!')}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
