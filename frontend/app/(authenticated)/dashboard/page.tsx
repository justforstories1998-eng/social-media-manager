'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useAnalytics';

export default function DashboardPage() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'GOOD MORNING' : hours < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  const defaultMetrics = {
    todayPosts: 2,
    scheduled: 11,
    reachThisWeek: '132.4k',
    engagement: '4.9%',
    recentPosts: [
      { id: '1', title: 'Eco Bottle Launch', platform: 'Instagram', status: 'Ready', scheduledFor: '09:00' },
      { id: '2', title: 'Summer Sustainability Tips', platform: 'LinkedIn', status: 'Approved', scheduledFor: '14:30' },
    ],
    platformStats: [
      { name: 'Instagram', reach: '68.4k', engagement: '5.1%' },
      { name: 'LinkedIn', reach: '41.3k', engagement: '4.8%' },
      { name: 'Facebook', reach: '22.7k', engagement: '3.9%' },
    ],
    aiUsage: { tokens: 1800, model: 'QWEN2.5-7B', percentage: 38, postsRemaining: 1 },
    activities: [
      'AI generated 2 posts for Earth Day campaign',
      'Post published on Instagram (42.8k reach)',
      'New product added: Reusable Bottle Pro',
      'Telegram approval received from team',
    ],
  };

  const m = metrics || defaultMetrics;

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      {/* Header */}
      <div className="pt-8 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="font-mono tracking-[3px] text-xs text-white/40">{dateStr} • {greeting}</div>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-2px] sm:tracking-[-2.5px] mt-1">Welcome back.</div>
        </div>
        <Link href="/ai/generate" className="neon-button flex items-center gap-2 text-sm sm:text-base">
          Generate Today&apos;s Content <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics */}
      <div className="px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
        {[
          { label: "TODAY'S POSTS", value: String(m.todayPosts), change: "+1", icon: Calendar },
          { label: "SCHEDULED", value: String(m.scheduled), change: "+4", icon: Clock },
          { label: "REACH THIS WEEK", value: m.reachThisWeek, change: "+22%", icon: TrendingUp },
          { label: "ENGAGEMENT", value: m.engagement, change: "+0.7%", icon: Users },
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
              <div className="font-semibold text-2xl sm:text-3xl tracking-tight">{m.recentPosts.length} posts ready for review</div>
            </div>
            <Link href="/posts" className="text-sm flex items-center gap-1 text-[#ec4899]">VIEW ALL <ArrowRight className="w-3.5" /></Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="glass p-5 rounded-3xl animate-pulse">
                    <div className="h-5 bg-white/10 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              m.recentPosts.map((post) => (
                <div key={post.id} className="glass flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 gap-3">
                  <div>
                    <div className="font-medium tracking-tight text-lg">{post.title}</div>
                    <div className="text-xs font-mono text-white/50 mt-px">{post.platform} • {post.scheduledFor || '—'}</div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`status-badge ${post.status === 'Approved' || post.status === 'Published' ? 'status-approved' : 'status-ready'}`}>
                      {post.status}
                    </div>
                    <Link href="/posts" className="px-5 py-2 rounded-full bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors">
                      Review
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem]">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">PLATFORM PERFORMANCE</div>
          {m.platformStats.map((p, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-none">
              <div>{p.name}</div>
              <div className="text-right">
                <div className="font-medium">{p.reach}</div>
                <div className="text-xs text-white/40">{p.engagement} ENG</div>
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
              <span className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter">{(m.aiUsage.tokens / 1000).toFixed(1)}k</span>
              <span className="text-white/40 ml-1 text-lg sm:text-xl">tokens</span>
            </div>
            <div className="text-xs text-white/40 hidden sm:block">MODEL: {m.aiUsage.model}</div>
          </div>
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] rounded-full" style={{ width: `${m.aiUsage.percentage}%` }} />
          </div>
          <div className="text-xs text-white/40 mt-1.5">{m.aiUsage.percentage}% of daily limit • {m.aiUsage.postsRemaining} posts remaining</div>
        </div>

        <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem]">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">RECENT ACTIVITY</div>
          <div className="space-y-3 text-sm">
            {m.activities.map((act, i) => (
              <div key={i} className="flex gap-3 text-white/70">
                <div className="text-[#ec4899] mt-px">•</div> {act}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
