'use client';

import React from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function AdminUsers() {
  const users = [
    { name: "Sarah Chen", email: "sarah@ecobottle.co", role: "Admin", status: "Active", joined: "Jul 15, 2026" },
    { name: "Marcus Rivera", email: "marcus@greenpack.io", role: "Editor", status: "Active", joined: "Jul 18, 2026" },
    { name: "Ava Patel", email: "ava@reusables.com", role: "Viewer", status: "Pending", joined: "Jul 22, 2026" },
    { name: "James Wilson", email: "james@techcorp.com", role: "Editor", status: "Active", joined: "Jul 25, 2026" },
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
          <button className="neon-button text-sm">Invite User</button>
        </div>

        <div className="px-4 sm:px-8 pt-9 pb-6">
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">User Management</div>
        </div>

        <div className="px-4 sm:px-8 pb-12">
          <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10">
            <div className="table-wrapper">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-mono tracking-[2px] text-white/40">
                    <th className="px-4 sm:px-8 py-5 text-left">USER</th>
                    <th className="px-4 sm:px-8 py-5 text-left hidden md:table-cell">EMAIL</th>
                    <th className="px-4 sm:px-8 py-5 text-left">ROLE</th>
                    <th className="px-4 sm:px-8 py-5 text-left">STATUS</th>
                    <th className="px-4 sm:px-8 py-5 text-left hidden lg:table-cell">JOINED</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={i} className="border-b border-white/10 hover:bg-white/5 last:border-none">
                      <td className="px-4 sm:px-8 py-6">
                        <div className="font-medium">{user.name}</div>
                        <div className="md:hidden text-xs text-white/50 mt-1">{user.email}</div>
                      </td>
                      <td className="px-4 sm:px-8 py-6 text-white/70 hidden md:table-cell">{user.email}</td>
                      <td className="px-4 sm:px-8 py-6 text-white/70">{user.role}</td>
                      <td className="px-4 sm:px-8 py-6">
                        <span className={`status-badge ${user.status === 'Active' ? 'status-published' : 'status-draft'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-6 text-sm text-white/60 font-mono hidden lg:table-cell">{user.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
