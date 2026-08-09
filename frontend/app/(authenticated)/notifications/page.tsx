'use client';

import React from 'react';
import { useNotifications, useMarkAllRead } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  const notifs = notifications || [];
  const unreadCount = notifs.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="font-mono text-xs tracking-[3px] text-white/50">NOTIFICATIONS</div>
            <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Notifications</div>
            <div className="text-white/60">Stay up to date with your platform activity</div>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className="text-sm px-4 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {unreadCount > 0 ? `Mark all read (${unreadCount})` : 'All read'}
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-10">
        {isLoading ? (
          <div className="glass rounded-[2.5rem] p-8 text-center text-white/50">Loading notifications...</div>
        ) : notifs.length > 0 ? (
          <ul className="glass rounded-[2.5rem] divide-y divide-white/10">
            {notifs.map((notif) => (
              <li key={notif.id} className={`px-4 sm:px-8 py-5 sm:py-6 flex gap-4 sm:gap-5 ${notif.read ? 'opacity-60' : ''}`}>
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-white/20' : notif.type === 'success' ? 'bg-emerald-400' : notif.type === 'warning' ? 'bg-amber-400' : 'bg-[#7c3aed]'}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{notif.title}</div>
                  <div className="text-white/60 text-sm mt-px truncate">{notif.message}</div>
                </div>
                <div className="text-xs text-white/40 font-mono self-start flex-shrink-0">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass rounded-[2.5rem] p-12 text-center text-white/50">No notifications yet</div>
        )}
      </div>
    </div>
  );
}
