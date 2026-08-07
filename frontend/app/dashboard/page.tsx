'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react';
import MobileNav from '@/components/MobileNav';

export default function WonderMediaDashboard() {
  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'GOOD MORNING' : hours < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      
      <div className="floating-shell mx-auto my-4 sm:my-6 ring-1 ring-white/10">
        
        {/* Top Nav */}
        <div className="dashboard-nav px-4 sm:px-8 h-[64px] sm:h-[72px] flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] flex items-center justify-center">
                <span className="font-bold text-lg sm:text-xl">W</span>
              </div>
              <div className="font-semibold text-xl sm:text-2xl tracking-tight">WonderMedia</div>
            </div>
            <div className="px-3 py-px text-xs font-mono tracking-[2px] bg-white/5 border border-white/10 rounded-full hidden sm:block">v1.0.0</div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link href="/posts" className="px-4 py-2 hover:bg-white/5 rounded-full transition-colors">Posts</Link>
            <Link href="/products" className="px-4 py-2 hover:bg-white/5 rounded-full transition-colors">Products</Link>
            <Link href="/calendar" className="px-4 py-2 hover:bg-white/5 rounded-full transition-colors">Calendar</Link>
            <Link href="/analytics" className="px-4 py-2 hover:bg-white/5 rounded-full transition-colors">Analytics</Link>
            <Link href="/ai/generate" className="px-4 py-2 hover:bg-white/5 rounded-full transition-colors">AI Studio</Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="system-status hidden lg:flex">
              <div className="status-dot" /> ALL SYSTEMS HEALTHY
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">JD</div>
          </div>
        </div>

        {/* Header */}
        <div className="px-4 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="font-mono tracking-[3px] text-xs text-white/40">{dateStr} • {greeting}</div>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-2px] sm:tracking-[-2.5px] mt-1">Welcome back, John.</div>
          </div>
          <Link href="/ai/generate" className="neon-button flex items-center gap-2 text-sm sm:text-base">
            Generate Today&apos;s Content <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Metrics */}
        <div className="px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
          {[
            { label: "TODAY'S POSTS", value: "2", change: "+1", icon: Calendar },
            { label: "SCHEDULED", value: "11", change: "+4", icon: Clock },
            { label: "REACH THIS WEEK", value: "132.4k", change: "+22%", icon: TrendingUp },
            { label: "ENGAGEMENT", value: "4.9%", change: "+0.7%", icon: Users },
          ].map((metric, index) => (
            <div key={index} className="metric-card glass p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10">
              <div className="flex justify-between">
                <div>
                  <div className="text-xs font-mono tracking-[1.5px] text-white/50">{metric.label}</div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-3px] mt-2">{metric.value}</div>
                </div>
                <metric.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white/30 mt-1" />
              </div>
              <div className="text-emerald-400 text-xs mt-3 font-medium tracking-wide">{metric.change} FROM LAST WEEK</div>
            </div>
          ))}
        </div>

        {/* Today's Posts + Platform Stats */}
        <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-4 pb-8">
          
          <div className="lg:col-span-8 glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="flex justify-between mb-6">
              <div>
                <div className="font-mono text-xs tracking-[2px] text-white/50">AI GENERATED TODAY</div>
                <div className="font-semibold text-2xl sm:text-3xl tracking-tight">2 posts ready for review</div>
              </div>
              <Link href="/posts" className="text-sm flex items-center gap-1 text-[#ec4899]">VIEW ALL <ArrowRight className="w-3.5" /></Link>
            </div>

            <div className="space-y-3">
              {[
                { title: "Eco Bottle Launch", platform: "Instagram", status: "Ready", time: "09:00" },
                { title: "Summer Sustainability Tips", platform: "LinkedIn", status: "Approved", time: "14:30" }
              ].map((post, idx) => (
                <div key={idx} className="glass flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 gap-3">
                  <div>
                    <div className="font-medium tracking-tight text-lg">{post.title}</div>
                    <div className="text-xs font-mono text-white/50 mt-px">{post.platform} • {post.time}</div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`status-badge ${post.status === 'Approved' ? 'status-approved' : 'status-ready'}`}>
                      {post.status}
                    </div>
                    <Link href="/posts" className="px-5 py-2 rounded-full bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors">
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">PLATFORM PERFORMANCE</div>
            {[
              { name: "Instagram", reach: "68.4k", eng: "5.1%" },
              { name: "LinkedIn", reach: "41.3k", eng: "4.8%" },
              { name: "Facebook", reach: "22.7k", eng: "3.9%" },
            ].map((p, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-none">
                <div>{p.name}</div>
                <div className="text-right">
                  <div className="font-medium">{p.reach}</div>
                  <div className="text-xs text-white/40">{p.eng} ENG</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Usage + Activity */}
        <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
          <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="font-mono text-xs tracking-[2px] text-white/50 mb-1">AI USAGE TODAY</div>
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter">1.8k</span>
                <span className="text-white/40 ml-1 text-lg sm:text-xl">tokens</span>
              </div>
              <div className="text-xs text-white/40 hidden sm:block">MODEL: QWEN2.5-7B</div>
            </div>
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-1.5 w-[38%] bg-gradient-to-r from-[#7c3aed] to-[#ec4899] rounded-full" />
            </div>
            <div className="text-xs text-white/40 mt-1.5">38% of daily limit • 1 post remaining</div>
          </div>

          <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">RECENT ACTIVITY</div>
            <div className="space-y-3 text-sm">
              {[
                "AI generated 2 posts for Earth Day campaign",
                "Post published on Instagram (42.8k reach)",
                "New product added: Reusable Bottle Pro",
                "Telegram approval received from team"
              ].map((act, i) => (
                <div key={i} className="flex gap-3 text-white/70">
                  <div className="text-[#ec4899] mt-px">•</div> {act}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
