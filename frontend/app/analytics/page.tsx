'use client';

import React from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function AnalyticsPage() {
  const chartData = [42, 58, 71, 65, 89, 110, 95, 134, 128, 160];
  const maxVal = Math.max(...chartData);

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      <div className="floating-shell mx-auto my-6 ring-1 ring-white/10">
        <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="font-semibold text-2xl tracking-tight">WonderMedia</Link>
          <div className="font-mono text-xs tracking-[3px] text-white/50">PERFORMANCE</div>
        </div>

        <div className="px-4 sm:px-8 pt-9 pb-6">
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Analytics</div>
        </div>

        <div className="px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
          {[
            { label: "TOTAL REACH", value: "284.6K", change: "+34%" },
            { label: "ENGAGEMENT", value: "4.8%", change: "+1.2%" },
            { label: "POSTS", value: "42", change: "+9" },
            { label: "AVG REACH", value: "6.8K", change: "+18%" },
          ].map((m, i) => (
            <div key={i} className="glass p-6 rounded-[2rem]">
              <div className="text-xs font-mono tracking-[2px] text-white/50">{m.label}</div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px] mt-2">{m.value}</div>
              <div className="text-emerald-400 text-xs mt-2">{m.change}</div>
            </div>
          ))}
        </div>

        <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
          <div className="glass p-6 sm:p-8 rounded-[2.5rem]">
            <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">REACH OVER TIME</div>
            <div className="h-64 flex items-end gap-2 sm:gap-3 pt-4">
              {chartData.map((val, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t-xl" style={{ height: `${(val / maxVal) * 100}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono text-white/30">
              <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span>
            </div>
          </div>

          <div className="glass p-6 sm:p-8 rounded-[2.5rem]">
            <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">TOP PLATFORMS</div>
            {[
              { name: "Instagram", pct: 42 },
              { name: "LinkedIn", pct: 31 },
              { name: "Facebook", pct: 18 },
            ].map((p, i) => (
              <div key={i} className="mb-5">
                <div className="flex justify-between text-sm mb-1.5">
                  <div>{p.name}</div>
                  <div>{p.pct}%</div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-[#7c3aed] to-[#ec4899]" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
