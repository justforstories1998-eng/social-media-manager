'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "success", title: "Post Published", message: "Earth Day post published to Instagram", time: "2m ago", read: false },
    { id: 2, type: "info", title: "AI Generation Complete", message: "2 new posts are ready for approval", time: "14m ago", read: false },
    { id: 3, type: "warning", title: "Telegram Approval", message: "Summer campaign awaiting your review", time: "1h ago", read: false },
    { id: 4, type: "success", title: "Analytics Updated", message: "Weekly report is now available", time: "Yesterday", read: false },
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      <div className="floating-shell mx-auto my-6 ring-1 ring-white/10">
        <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="font-semibold text-2xl tracking-tight">WonderMedia</Link>
          <div className="font-mono text-xs tracking-[3px] text-white/50">NOTIFICATIONS</div>
        </div>

        <div className="px-4 sm:px-8 pt-9 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Notifications</div>
              <div className="text-white/60">Stay up to date with your platform activity</div>
            </div>
            <button 
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="text-sm px-4 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {unreadCount > 0 ? `Mark all read (${unreadCount})` : 'All read'}
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-8 pb-10">
          <ul className="glass rounded-[2.5rem] divide-y divide-white/10">
            {notifications.map(notif => (
              <li key={notif.id} className={`px-4 sm:px-8 py-5 sm:py-6 flex gap-4 sm:gap-5 ${notif.read ? 'opacity-60' : ''}`}>
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-white/20' : notif.type === 'success' ? 'bg-emerald-400' : notif.type === 'warning' ? 'bg-amber-400' : 'bg-[#7c3aed]'}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{notif.title}</div>
                  <div className="text-white/60 text-sm mt-px truncate">{notif.message}</div>
                </div>
                <div className="text-xs text-white/40 font-mono self-start flex-shrink-0">{notif.time}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
