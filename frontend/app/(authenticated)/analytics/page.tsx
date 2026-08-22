'use client';

import React from 'react';
import { useDashboardMetrics, usePlatformStats } from '@/hooks/useAnalytics';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: metrics, isLoading: isLoadingMetrics, error: metricsError, refetch: refetchMetrics } = useDashboardMetrics();
  const { data: platformStats, isLoading: isLoadingPlatforms, error: platformsError, refetch: refetchPlatforms } = usePlatformStats();

  const defaultMetrics = {
    totalReach: '284.6K',
    engagement: '4.8%',
    posts: 42,
    avgReach: '6.8K',
    reachOverTime: [42, 58, 71, 65, 89, 110, 95, 134, 128, 160],
  };

  const m = {
    totalReach: metrics?.reachThisWeek || defaultMetrics.totalReach,
    engagement: metrics?.engagement || defaultMetrics.engagement,
    posts: defaultMetrics.posts,
    avgReach: defaultMetrics.avgReach,
    reachOverTime: defaultMetrics.reachOverTime,
  };

  const platformData = platformStats || [
    { platform: 'Instagram', reach: '42%', engagement: '5.1%' },
    { platform: 'LinkedIn', reach: '31%', engagement: '4.8%' },
    { platform: 'Facebook', reach: '18%', engagement: '3.9%' },
  ];

  const maxVal = Math.max(...m.reachOverTime);

  if (isLoadingMetrics || isLoadingPlatforms) {
    return (
      <div className="floating-shell mx-auto ring-1 ring-white/10 p-12 text-center">
        <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin mx-auto" />
        <div className="text-white/50 mt-4">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      {(metricsError || platformsError) && (
        <div className="mx-4 sm:mx-8 mt-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm text-white/70">Failed to load analytics data</div>
            <div className="text-xs text-white/40">{metricsError?.message || platformsError?.message || 'Check your connection and try again.'}</div>
          </div>
          <button onClick={() => { refetchMetrics(); refetchPlatforms(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-xs text-white/70">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="font-mono text-xs tracking-[3px] text-white/50">PERFORMANCE</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Analytics</div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
        {[
          { label: "TOTAL REACH", value: m.totalReach, change: "+34%" },
          { label: "ENGAGEMENT", value: m.engagement, change: "+1.2%" },
          { label: "POSTS", value: String(m.posts), change: "+9" },
          { label: "AVG REACH", value: m.avgReach, change: "+18%" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[2rem]">
            <div className="text-xs font-mono tracking-[2px] text-white/50">{stat.label}</div>
            <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px] mt-2">{stat.value}</div>
            <div className="text-emerald-400 text-xs mt-2">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
        <div className="glass p-6 sm:p-8 rounded-[2.5rem]">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">REACH OVER TIME</div>
          <div className="h-64 flex items-end gap-2 sm:gap-3 pt-4">
            {m.reachOverTime.map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t-xl" style={{ height: `${(val / maxVal) * 100}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-white/30">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span>
          </div>
        </div>

        <div className="glass p-6 sm:p-8 rounded-[2.5rem]">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">TOP PLATFORMS</div>
          {platformData.map((p, i) => (
            <div key={i} className="mb-5">
              <div className="flex justify-between text-sm mb-1.5">
                <div>{p.platform}</div>
                <div>{p.reach}</div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#7c3aed] to-[#ec4899]" style={{ width: p.reach }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
