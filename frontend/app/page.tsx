'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Globe, Image, Video, Sparkles, Calendar, BarChart3, Package, Layers } from 'lucide-react';

export default function WonderMediaLanding() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f5] font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 h-14 sm:h-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="WonderMedia" className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover" />
          <div>
            <div className="font-semibold text-xl sm:text-2xl tracking-[-0.04em]">WonderMedia</div>
            <div className="text-[10px] text-white/40 -mt-1 hidden sm:block">AI SOCIAL OS</div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it Works', href: '#how-it-works' },
          ].map((item) => (
            <a key={item.href} href={item.href}
               className="px-5 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="system-status hidden md:flex">
            <div className="status-dot" />
            ALL SYSTEMS OPERATIONAL
          </div>
          
          <Link href="/auth/login" className="px-4 sm:px-6 py-2 text-sm font-medium rounded-full border border-white/20 hover:bg-white/5 transition-all">
            Sign in
          </Link>
          
          <Link href="/auth/register" className="neon-button hidden sm:inline-flex">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 text-xs tracking-[2px] mb-6 sm:mb-8 border border-white/10">
              <span className="font-mono">NEW</span> • AI IMAGE & VIDEO GENERATION
            </div>

            <h1 className="hero-title tracking-[-0.07em] leading-none">
              The most beautiful<br />
              way to run your<br />
              <span className="bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#7c3aed] bg-clip-text text-transparent">
                entire social media.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg sm:text-xl text-white/60">
              Generate posts, images, and videos with AI. Schedule across every platform. Track analytics — all from one beautiful dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8 sm:mt-10">
              <Link href="/auth/register" className="neon-button flex items-center gap-3 group">
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>

            <div className="mt-8 text-xs text-white/40 flex items-center gap-3">
              <div>100% Free • No API keys • Self-hosted</div>
            </div>
          </div>

          {/* Glass Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="glass p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden">
              <div className="noise" />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="font-mono text-xs tracking-[3px] text-white/50">TODAY • AUG 31</div>
                  <div className="text-xl sm:text-2xl font-semibold">3 posts ready</div>
                </div>
                <div className="ai-cursor">AI ACTIVE</div>
              </div>

              <div className="space-y-3">
                <div className="glass p-3 sm:p-4 rounded-2xl flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">Product Launch Post</div>
                    <div className="text-white/50 text-xs">Instagram • 9:00 AM</div>
                  </div>
                  <div className="px-3 py-px rounded-full text-xs bg-[#7c3aed]/20 text-[#7c3aed]">APPROVED</div>
                </div>
                
                <div className="glass p-3 sm:p-4 rounded-2xl flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">Summer Campaign Reel</div>
                    <div className="text-white/50 text-xs">TikTok • 2:30 PM</div>
                  </div>
                  <div className="px-3 py-px rounded-full text-xs bg-emerald-400/10 text-emerald-400">SCHEDULED</div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="font-mono text-white/50">MODEL: MINIMAX-M3</div>
                <div className="font-mono text-[#ec4899]">98% CONFIDENCE</div>
              </div>
            </div>

            <div className="absolute -right-2 sm:-right-3 -top-3 sm:-top-4 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-mono bg-[#ec4899] text-black rounded-full flex items-center gap-2 shadow-xl">
              LIVE AI GENERATION
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <div className="font-mono text-xs tracking-[3px] text-white/40 mb-2">CAPABILITIES</div>
              <div className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em]">Everything you need.<br />Nothing you pay for.</div>
            </div>
            <Link href="/dashboard" className="text-sm flex items-center gap-2 hover:text-[#7c3aed] transition-colors">
              Explore the platform <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Large 2x2 AI Content Generator */}
            <div className="lg:col-span-2 lg:row-span-2 bento-card glass p-6 sm:p-8 border border-white/10">
              <div className="font-mono text-xs tracking-[2px] mb-4 text-white/50">AI CONTENT GENERATOR</div>
              <div className="text-2xl sm:text-4xl font-semibold tracking-tight mb-4">Generate posts,<br />images, and videos.</div>
              <div className="text-white/60 text-sm sm:text-base">Full post packages with captions, hashtags, and AI-generated visuals. Product-aware generation that understands your brand.</div>
              
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { icon: <Sparkles className="w-5 h-5" />, label: 'Captions', color: '#7c3aed' },
                  { icon: <Image className="w-5 h-5" />, label: 'Images', color: '#ec4899' },
                  { icon: <Video className="w-5 h-5" />, label: 'Videos', color: '#7c3aed' },
                ].map((item) => (
                  <div key={item.label} className="glass rounded-2xl p-3 text-center border border-white/10">
                    <div className="mx-auto mb-2" style={{ color: item.color }}>{item.icon}</div>
                    <div className="text-xs text-white/60">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products & Combos */}
            <div className="lg:row-span-2 bento-card glass p-6 sm:p-7 border border-white/10 flex flex-col">
              <div className="font-mono text-xs tracking-[2px] mb-4 text-white/50">PRODUCTS & COMBOS</div>
              <div className="font-semibold text-lg sm:text-xl tracking-tight mb-6">Manage products.<br />Create bundle offers.</div>
              
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-[#7c3aed]" />
                  <div className="text-xs text-white/60">Product catalog with images & details</div>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-[#ec4899]" />
                  <div className="text-xs text-white/60">AI-powered combo offer generator</div>
                </div>
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-[#7c3aed]" />
                  <div className="text-xs text-white/60">Auto-generate ad images per product</div>
                </div>
              </div>
            </div>

            {/* Zero Cost Accent Card */}
            <div className="bento-card rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 text-black relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <div className="noise" />
              <div className="font-mono text-xs tracking-[3px] mb-3 text-black/60">ZERO COST</div>
              <div className="text-3xl sm:text-4xl font-bold tracking-[-1.5px] leading-none mb-4">100% Open Source.<br />100% Yours.</div>
              <div className="text-sm text-black/70">6 free AI models. No API keys needed. Self-hosted.</div>
            </div>

            {/* Smart Calendar */}
            <div className="bento-card glass p-6 sm:p-7 border border-white/10">
              <div className="font-mono text-xs tracking-[2px] mb-3 text-white/50">SMART CALENDAR</div>
              <div className="font-semibold text-sm sm:text-base">Schedule posts across weeks. Auto-detect holidays.</div>
              <div className="mt-auto text-xs text-white/50 pt-6 sm:pt-8">100+ occasions with AI-generated content suggestions</div>
            </div>

            {/* Multi Platform */}
            <div className="bento-card glass p-6 sm:p-7 border border-white/10">
              <div className="font-mono text-xs tracking-[2px] mb-3 text-white/50">MULTI-PLATFORM</div>
              <div className="font-semibold text-sm sm:text-base">Instagram • Facebook • LinkedIn • X • TikTok • Pinterest</div>
              <div className="mt-auto text-xs text-white/50 pt-6 sm:pt-8">Publish to all major platforms from one dashboard</div>
            </div>

            {/* Analytics */}
            <div className="bento-card glass p-6 sm:p-7 border border-white/10">
              <div className="font-mono text-xs tracking-[2px] mb-3 text-white/50">ANALYTICS</div>
              <div className="font-semibold text-sm sm:text-base">Track reach, engagement, and growth per platform.</div>
              <div className="mt-auto text-xs text-white/50 pt-6 sm:pt-8">Export reports as CSV, PDF, or Excel</div>
            </div>

            {/* Telegram */}
            <div className="bento-card glass p-6 sm:p-7 border border-white/10">
              <div className="font-mono text-xs tracking-[2px] mb-3 text-white/50">TELEGRAM APPROVAL</div>
              <div className="font-semibold text-sm sm:text-base">Review every post in Telegram before publishing.</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="contrast-section px-4 sm:px-6 lg:px-12 py-12 sm:py-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="font-mono text-xs tracking-[3px] mb-3 text-black/60">HOW IT WORKS</div>
            <div className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em] leading-none text-black">Up and running in minutes.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Install & Configure", desc: "Clone the repo, run docker-compose up, and configure your brand settings in the dashboard.", icon: Zap },
              { step: "02", title: "Connect Platforms", desc: "Link your social media accounts and Telegram bot for approval workflows.", icon: Globe },
              { step: "03", title: "Generate & Publish", desc: "Let AI create content, images, and videos — review in Telegram, then publish.", icon: Shield },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-black text-white flex items-center justify-center">
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="font-mono text-xs tracking-[2px] mb-2 text-black/40">STEP {item.step}</div>
                <div className="font-semibold text-xl text-black mb-2">{item.title}</div>
                <div className="text-black/60 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 space-y-8 text-lg text-black/80">
            {[
              { num: "01", title: "Free AI Powered", desc: "6 free models for text, image, and video generation. No API keys, no subscriptions." },
              { num: "02", title: "Glassmorphism UI", desc: "A modern interface that feels premium and futuristic." },
              { num: "03", title: "Enterprise Security", desc: "OWASP compliant with Argon2, JWT, and full audit trails." },
            ].map((item, index) => (
              <div key={index} className="flex gap-5">
                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-black text-white text-sm flex items-center justify-center font-mono">{item.num}</div>
                <div>
                  <div className="font-semibold text-black">{item.title}</div>
                  <div className="text-black/60 mt-px">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12 border-t border-white/10">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="font-mono text-xs tracking-[3px] text-white/40 mb-2">GET STARTED</div>
          <div className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] mb-6">Ready to get started?</div>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Join WonderMedia and start creating amazing social media content with AI — completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="neon-button flex items-center gap-3">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://github.com/justforstories1998-eng/social-media-manager" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-7 py-4 rounded-full border border-white/20 hover:bg-white/5 text-sm font-medium transition-all">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] px-4 sm:px-6 lg:px-12 py-10 sm:py-16 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="absolute top-9 left-1/2 -translate-x-1/2 watermark font-black tracking-[-8px]">WONDERMEDIA</div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-y-8">
            <div>
              <Link href="/auth/register" className="neon-button px-10 sm:px-14 text-base sm:text-lg">
                Deploy WonderMedia Today
              </Link>
            </div>

            <div className="flex gap-6 sm:gap-8 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="https://github.com/justforstories1998-eng/social-media-manager" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            </div>

            <div className="font-mono text-xs text-white/40">© 2026 WonderMedia • MIT Licensed</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
