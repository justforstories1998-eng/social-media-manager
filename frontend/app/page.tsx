'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Globe, Sparkles, Calendar, BarChart3, Star, CheckCircle } from 'lucide-react';

export default function WonderMediaLanding() {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-white font-sans overflow-hidden">
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
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(transparent 40%, rgba(5,7,10,.55) 100%)' }}
      />

      {/* Navigation */}
      <nav
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: 'rgba(11,15,20,.55)',
          backdropFilter: 'blur(16px) saturate(140%)',
          borderBottom: '1px solid rgba(255,255,255,.10)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(105deg, #2dd4bf, #5eead4 35%, #e879f9)' }}
            >
              <Sparkles className="w-5 h-5 text-[#0b0f14]" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">WonderMedia</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.08)' }}>
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it Works', href: '#how-it-works' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-5 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </div>

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

      {/* Hero Section */}
      <main className="relative z-10 pt-28 pb-20 px-6">
        <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          {/* LEFT — Marketing Pitch */}
          <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
            {/* Trial Pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8"
              style={{ background: 'rgba(45,212,191,.1)', border: '1px solid rgba(45,212,191,.2)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
              <span className="text-xs font-medium text-[#2dd4bf]/90">14-day Pro trial &middot; no card</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-white text-[2.6rem] leading-[1.05] sm:text-5xl lg:text-[3.4rem] tracking-tight">
              Your entire social media.{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(100deg, #5eead4, #2dd4bf 30%, #e879f9)' }}
              >
                On autopilot.
              </span>
            </h1>

            {/* Lead Paragraph */}
            <p className="mt-5 text-slate-400 text-base sm:text-lg leading-relaxed">
              WonderMedia is the open-source, AI-powered platform that generates, schedules, and publishes content across every major social network — all under your control.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 lg:justify-start justify-center">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto rounded-xl h-12 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:brightness-105"
                style={{
                  background: 'linear-gradient(105deg, #2dd4bf, #5eead4 35%, #e879f9)',
                  color: '#0b0f14',
                  boxShadow: '0 4px 20px rgba(45,212,191,.3), 0 4px 20px rgba(232,121,249,.2)',
                }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/justforstories1998-eng/social-media-manager"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto rounded-xl h-12 text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,.15)' }}
              >
                View on GitHub
              </a>
            </div>

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
                      background:
                        i === 1 ? 'linear-gradient(135deg, #2dd4bf, #2dd4bf)' :
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

          {/* RIGHT — Glass Dashboard Mockup */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
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

              {/* Dashboard Content */}
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Today &middot; Aug 31</div>
                    <div className="text-xl font-semibold">3 posts ready</div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(45,212,191,.15)', color: '#2dd4bf' }}
                  >
                    AI ACTIVE
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className="rounded-2xl p-4 flex items-center justify-between text-sm"
                    style={{ background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.08)' }}
                  >
                    <div>
                      <div className="font-medium">Product Launch Post</div>
                      <div className="text-xs text-slate-400">Instagram &middot; 9:00 AM</div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(45,212,191,.15)', color: '#2dd4bf' }}
                    >
                      APPROVED
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-4 flex items-center justify-between text-sm"
                    style={{ background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.08)' }}
                  >
                    <div>
                      <div className="font-medium">Weekly Engagement</div>
                      <div className="text-xs text-slate-400">LinkedIn &middot; 2:30 PM</div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(232,121,249,.15)', color: '#e879f9' }}
                    >
                      SCHEDULED
                    </div>
                  </div>
                </div>

                <div
                  className="pt-4 flex items-center justify-between text-xs"
                  style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}
                >
                  <span className="text-slate-400">MODEL: MINIMAX-M3</span>
                  <span style={{ color: '#2dd4bf' }}>98% CONFIDENCE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-[0.25em] mb-3">Capabilities</div>
              <div className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
                Everything you need.<br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(100deg, #5eead4, #2dd4bf 30%, #e879f9)' }}
                >
                  Nothing you pay for.
                </span>
              </div>
            </div>
            <Link href="/dashboard" className="text-sm flex items-center gap-2 hover:text-[#2dd4bf] transition-colors text-slate-400">
              Explore the platform <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Large 2x2 Daily Planner */}
            <div
              className="lg:col-span-2 lg:row-span-2 rounded-[1.5rem] p-8"
              style={{
                background: 'linear-gradient(155deg, rgba(255,255,255,.11), rgba(255,255,255,.025))',
                border: '1px solid rgba(255,255,255,.12)',
              }}
            >
              <div className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-4">Daily AI Planner</div>
              <div className="font-display font-bold text-2xl sm:text-4xl tracking-tight mb-4">
                Intelligent content<br />generated daily.
              </div>
              <div className="text-slate-400 text-sm">
                Automatically detects holidays, trending moments, and brand events — then creates relevant posts for every platform.
              </div>
              <div className="mt-8 flex items-end gap-2 h-24">
                {[65, 40, 88, 72, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${h}%`,
                      background: 'linear-gradient(to top, #2dd4bf, #e879f9)',
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-500 mt-2">ENGAGEMENT LAST 7 DAYS</div>
            </div>

            {/* Brand System Card */}
            <div
              className="lg:row-span-2 rounded-[1.5rem] p-7 flex flex-col"
              style={{
                background: 'linear-gradient(155deg, rgba(255,255,255,.11), rgba(255,255,255,.025))',
                border: '1px solid rgba(255,255,255,.12)',
              }}
            >
              <div className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-4">Brand System</div>
              <div className="font-display font-bold text-lg sm:text-xl tracking-tight mb-6">
                Your voice.<br />Your colors.<br />Your products.
              </div>
              <div className="mt-auto space-y-4">
                {[
                  { color: '#2dd4bf', label: 'Teal' },
                  { color: '#e879f9', label: 'Pink' },
                  { color: '#0b0f14', label: 'Obsidian' },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-2xl border border-white/20"
                      style={{ background: c.color }}
                    />
                    <div className="text-xs text-slate-400">{c.color} &mdash; {c.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero Cost Accent Card */}
            <div
              className="rounded-[1.5rem] p-8 text-black relative overflow-hidden"
              style={{
                background: 'linear-gradient(105deg, #2dd4bf, #5eead4 35%, #e879f9)',
              }}
            >
              <div className="text-xs uppercase tracking-[0.25em] mb-3 text-black/50">Zero Cost</div>
              <div className="font-display font-bold text-3xl sm:text-4xl tracking-tight leading-none mb-4">
                100% Open Source.<br />100% Yours.
              </div>
              <div className="text-sm text-black/60">Self-hosted. No vendor lock-in. Full control.</div>
            </div>

            {/* Multi Platform */}
            <div
              className="rounded-[1.5rem] p-7"
              style={{
                background: 'linear-gradient(155deg, rgba(255,255,255,.11), rgba(255,255,255,.025))',
                border: '1px solid rgba(255,255,255,.12)',
              }}
            >
              <div className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-3">Multi-Platform</div>
              <div className="font-medium text-sm">Instagram &middot; Facebook &middot; LinkedIn &middot; X &middot; TikTok &middot; Pinterest</div>
              <div className="text-xs text-slate-500 pt-6">Publish to all major platforms from one dashboard</div>
            </div>

            {/* Telegram */}
            <div
              className="rounded-[1.5rem] p-7"
              style={{
                background: 'linear-gradient(155deg, rgba(255,255,255,.11), rgba(255,255,255,.025))',
                border: '1px solid rgba(255,255,255,.12)',
              }}
            >
              <div className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-3">Telegram Approval</div>
              <div className="font-medium text-sm">Review every post in Telegram before publishing.</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-slate-500 uppercase tracking-[0.25em] mb-3">How it Works</div>
            <div className="font-display font-bold text-3xl sm:text-5xl tracking-tight">Up and running in minutes.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Install & Configure', desc: 'Clone the repo, run docker-compose up, and configure your brand settings in the dashboard.', icon: Zap },
              { step: '02', title: 'Connect Platforms', desc: 'Link your social media accounts and Telegram bot for approval workflows.', icon: Globe },
              { step: '03', title: 'Generate & Publish', desc: 'Let AI create content, review in Telegram, and publish across all platforms.', icon: Shield },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center rounded-[1.5rem] p-8"
                style={{
                  background: 'linear-gradient(155deg, rgba(255,255,255,.11), rgba(255,255,255,.025))',
                  border: '1px solid rgba(255,255,255,.12)',
                }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(105deg, #2dd4bf, #e879f9)' }}
                >
                  <item.icon className="w-7 h-7 text-[#0b0f14]" />
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-2">Step {item.step}</div>
                <div className="font-display font-semibold text-xl mb-2">{item.title}</div>
                <div className="text-slate-400 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Value Props */}
          <div className="mt-16 space-y-8 text-lg text-slate-300 max-w-3xl mx-auto">
            {[
              { num: '01', title: 'Free AI Powered', desc: 'Uses free AI providers for content generation, image creation, and daily social media tasks.' },
              { num: '02', title: 'Glassmorphism UI', desc: 'A modern interface that feels premium and futuristic.' },
              { num: '03', title: 'Enterprise Security', desc: 'OWASP compliant with Argon2, JWT, and full audit trails.' },
            ].map((item, index) => (
              <div key={index} className="flex gap-5">
                <div
                  className="w-9 h-9 flex-shrink-0 rounded-full text-sm flex items-center justify-center font-mono"
                  style={{ background: 'rgba(45,212,191,.15)', color: '#2dd4bf' }}
                >
                  {item.num}
                </div>
                <div>
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs text-slate-500 uppercase tracking-[0.25em] mb-3">Get Started</div>
          <div className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-6">Ready to get started?</div>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join WonderMedia and start creating amazing social media content with AI &mdash; completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto rounded-xl h-12 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:brightness-105"
              style={{
                background: 'linear-gradient(105deg, #2dd4bf, #5eead4 35%, #e879f9)',
                color: '#0b0f14',
                boxShadow: '0 4px 20px rgba(45,212,191,.3), 0 4px 20px rgba(232,121,249,.2)',
              }}
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/justforstories1998-eng/social-media-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto rounded-xl h-12 text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,.15)' }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 px-6 py-12"
        style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          background: 'rgba(255,255,255,.01)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-y-8">
            <div>
              <Link
                href="/auth/register"
                className="rounded-xl h-12 px-10 text-base font-semibold inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:brightness-105"
                style={{
                  background: 'linear-gradient(105deg, #2dd4bf, #5eead4 35%, #e879f9)',
                  color: '#0b0f14',
                }}
              >
                Deploy WonderMedia Today
              </Link>
            </div>

            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="https://github.com/justforstories1998-eng/social-media-manager" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            </div>

            <div className="text-xs text-slate-500">&copy; 2026 WonderMedia &middot; MIT Licensed</div>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
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
