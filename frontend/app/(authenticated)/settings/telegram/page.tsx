'use client';

import React, { useState } from 'react';
import api, { type TelegramSettings } from '@/lib/api';
import { toast } from 'sonner';
import { ExternalLink, CheckCircle } from 'lucide-react';

const steps = [
  {
    num: 1,
    title: 'Create a Telegram Bot',
    description: 'Open Telegram and search for @BotFather. Send the command /newbot and follow the prompts to create your bot. You\'ll receive a bot token.',
    link: 'https://t.me/BotFather',
    linkLabel: 'Open @BotFather',
  },
  {
    num: 2,
    title: 'Get Your Chat ID',
    description: 'Start a chat with your new bot in Telegram. Then forward a message from your bot to @userinfobot or use the Telegram API to get your chat ID.',
    link: 'https://t.me/userinfobot',
    linkLabel: 'Open @userinfobot',
  },
  {
    num: 3,
    title: 'Optional: Set Up a Channel or Group',
    description: 'If you want to post to a channel or group, create it in Telegram, add your bot as an admin, and get the channel/group ID using @userinfobot.',
    link: null,
    linkLabel: null,
  },
  {
    num: 4,
    title: 'Enter Your Credentials',
    description: 'Paste your bot token and chat ID (and optional channel/group IDs) into the form below, then click Save.',
    link: null,
    linkLabel: null,
  },
  {
    num: 5,
    title: 'Test the Connection',
    description: 'After saving, click "Test Connection" to verify your bot is working correctly.',
    link: null,
    linkLabel: null,
  },
];

export default function TelegramSettingsPage() {
  const [form, setForm] = useState<TelegramSettings>({
    botToken: '',
    chatId: '',
    channelId: '',
    groupId: '',
    enabled: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/telegram/settings', form);
      toast.success('Telegram settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await api.post('/telegram/test');
      toast.success('Telegram connection successful!');
    } catch {
      toast.error('Connection test failed. Check your credentials.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10 max-w-3xl">
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="font-mono text-xs tracking-[3px] text-white/50">SETTINGS</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Telegram Integration</div>
      </div>

      {/* Setup Guide */}
      <div className="px-4 sm:px-8 pb-6">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <span>How to set up Telegram integration</span>
          <span className="text-white/40">{showGuide ? '▲' : '▼'}</span>
        </button>

        {showGuide && (
          <div className="mt-4 space-y-4">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] flex items-center justify-center font-mono text-sm font-bold">
                  {step.num}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{step.title}</div>
                  <div className="text-white/50 text-sm leading-relaxed">{step.description}</div>
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#7c3aed] hover:underline"
                    >
                      {step.linkLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <CheckCircle className="w-5 h-5 text-white/20 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 sm:px-8 pb-10">
        <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
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
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">CHANNEL ID (OPTIONAL)</label>
              <input
                type="text"
                value={form.channelId}
                onChange={e => setForm({...form, channelId: e.target.value})}
                placeholder="Your Telegram channel ID"
                className="w-full"
              />
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">GROUP ID (OPTIONAL)</label>
              <input
                type="text"
                value={form.groupId}
                onChange={e => setForm({...form, groupId: e.target.value})}
                placeholder="Your Telegram group ID"
                className="w-full"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button className="neon-button flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={handleTest}
                disabled={isTesting || !form.botToken}
                className="flex-1 py-3.5 border border-white/20 rounded-full text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
