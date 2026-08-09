'use client';

import React from 'react';
import { useAdminUsers } from '@/hooks/useAdmin';

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();

  const defaultUsers = [
    { id: '1', name: "Sarah Chen", email: "sarah@ecobottle.co", role: "Admin", status: "Active", createdAt: "Jul 15, 2026" },
    { id: '2', name: "Marcus Rivera", email: "marcus@greenpack.io", role: "Editor", status: "Active", createdAt: "Jul 18, 2026" },
    { id: '3', name: "Ava Patel", email: "ava@reusables.com", role: "Viewer", status: "Pending", createdAt: "Jul 22, 2026" },
    { id: '4', name: "James Wilson", email: "james@techcorp.com", role: "Editor", status: "Active", createdAt: "Jul 25, 2026" },
  ];

  const displayUsers = users || defaultUsers;

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-2xl tracking-tight">WonderMedia</div>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-white/50">Loading users...</td>
                  </tr>
                ) : (
                  displayUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 last:border-none">
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
                      <td className="px-4 sm:px-8 py-6 text-sm text-white/60 font-mono hidden lg:table-cell">{user.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
