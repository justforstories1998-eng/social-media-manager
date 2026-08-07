'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function ExportsPage() {
  const [exportType, setExportType] = useState('analytics');
  const [format, setFormat] = useState('pdf');

  const recentExports = [
    { name: "Analytics Report", type: "PDF", date: "Jul 30, 2026", size: "2.4 MB" },
    { name: "All Posts", type: "CSV", date: "Jul 28, 2026", size: "890 KB" },
    { name: "Product Catalog", type: "Excel", date: "Jul 25, 2026", size: "1.1 MB" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      <div className="floating-shell mx-auto my-6 ring-1 ring-white/10">
        <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="font-semibold text-2xl tracking-tight">WonderMedia</Link>
          <div className="font-mono text-xs tracking-[3px] text-white/50">EXPORTS</div>
        </div>

        <div className="px-4 sm:px-8 pt-9 pb-6">
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Export Center</div>
        </div>

        <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
          {/* Export Form */}
          <div className="lg:col-span-2 glass p-6 sm:p-9 rounded-[2.5rem]">
            <div className="font-mono text-xs tracking-[2px] text-white/50 mb-6">NEW EXPORT</div>
            
            <div className="space-y-6">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">EXPORT TYPE</label>
                <select value={exportType} onChange={e => setExportType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-sm">
                  <option value="analytics">Analytics Report</option>
                  <option value="posts">All Posts</option>
                  <option value="products">Product Catalog</option>
                  <option value="full">Full Database Export</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">FORMAT</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['pdf', 'excel', 'csv', 'json'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`py-3 rounded-2xl text-sm font-medium border transition-colors ${format === f ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]' : 'border-white/10 hover:bg-white/5'}`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button className="neon-button w-full mt-4" onClick={() => alert(`Exporting ${exportType} as ${format.toUpperCase()}...`)}>
                Generate Export
              </button>
            </div>
          </div>

          {/* Recent Exports */}
          <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
            <div className="font-mono text-xs tracking-[2px] text-white/50 mb-6">RECENT EXPORTS</div>
            <div className="space-y-4">
              {recentExports.map((exp, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-none">
                  <div>
                    <div className="font-medium text-sm">{exp.name}</div>
                    <div className="text-xs text-white/50 mt-px">{exp.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-white/60">{exp.type}</div>
                    <div className="text-xs text-white/40">{exp.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
