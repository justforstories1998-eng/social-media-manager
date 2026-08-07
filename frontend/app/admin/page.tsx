'use client';

import React from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function AdminDashboard() {
  const stats = [
    { label: "TOTAL USERS", value: "2,847", change: "+142" },
    { label: "ACTIVE BUSINESSES", value: "1,932", change: "+87" },
    { label: "POSTS GENERATED", value: "184.2k", change: "+9.4k" },
    { label: "AI TOKENS USED", value: "41.3M", change: "+2.1M" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      <div className="floating-shell mx-auto my-6 ring-1 ring-white/10">
        
        <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-semibold text-2xl tracking-tight">WonderMedia</Link>
            <div className="px-3 py-1 text-xs font-mono bg-red-500/10 text-red-400 rounded-full tracking-widest">ADMIN</div>
          </div>
          <div className="font-mono text-xs tracking-[3px] text-white/40 hidden sm:block">SYSTEM CONTROL</div>
        </div>

        <div className="px-4 sm:px-8 pt-9 pb-6">
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Admin Dashboard</div>
        </div>

        {/* Global Stats */}
        <div className="px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-6 rounded-[2rem]">
              <div className="text-xs font-mono tracking-[2px] text-white/50">{stat.label}</div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px] mt-1.5">{stat.value}</div>
              <div className="text-emerald-400 text-xs mt-2">{stat.change} this month</div>
            </div>
          ))}
        </div>

        <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
          
          {/* Users */}
          <div className="glass p-6 sm:p-8 rounded-[2.5rem]">
            <div className="flex justify-between mb-6">
              <div className="font-semibold text-xl">Recent Users</div>
              <Link href="/admin/users" className="text-sm text-[#ec4899]">Manage Users →</Link>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Sarah Chen", email: "sarah@ecobottle.co", joined: "2h ago" },
                { name: "Marcus Rivera", email: "marcus@greenpack.io", joined: "yesterday" },
                { name: "Ava Patel", email: "ava@reusables.com", joined: "3d ago" },
              ].map((u, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-white/10 pb-4 last:border-none">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-white/50 text-xs">{u.email}</div>
                  </div>
                  <div className="text-xs text-white/40 font-mono">{u.joined}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="glass p-6 sm:p-8 rounded-[2.5rem]">
            <div className="font-semibold text-xl mb-6">System Health</div>
            
            <div className="space-y-5">
              {[
                { name: "Ollama (AI)", status: "Healthy", className: "health-healthy" },
                { name: "PostgreSQL", status: "Healthy", className: "health-healthy" },
                { name: "Redis Queue", status: "Healthy", className: "health-healthy" },
                { name: "Telegram Bot", status: "Connected", className: "health-connected" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>{s.name}</div>
                  <div className={`status-badge ${s.className}`}>{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 pb-10">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4 px-1">QUICK ACTIONS</div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/models" className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors inline-block">
              Manage AI Models
            </Link>
            <button onClick={() => alert('Audit logs coming soon!')} className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">View Audit Logs</button>
            <button onClick={() => alert('Announcements coming soon!')} className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">System Announcements</button>
            <button onClick={() => alert('Export coming soon!')} className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">Export All Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}
