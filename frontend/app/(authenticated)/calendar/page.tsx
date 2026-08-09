'use client';

import React from 'react';
import { usePosts } from '@/hooks/usePosts';

export default function CalendarPage() {
  const { data: posts } = usePosts();

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDayIndex = 3;

  const scheduled = posts
    ?.filter(p => p.scheduledAt)
    .map(p => {
      const d = new Date(p.scheduledAt!);
      return { day: d.getDate(), title: p.title, platform: p.platform };
    }) || [];

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-8 pb-6">
        <div className="font-mono text-xs tracking-[3px] text-white/50">CONTENT CALENDAR</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">July 2026</div>
      </div>

      <div className="px-4 sm:px-8 pb-10">
        <div className="glass p-4 sm:p-8 rounded-[2.5rem]">
          <div className="grid grid-cols-7 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/10">
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <div key={d} className="bg-[#0c0c0c] py-3 text-center text-[10px] font-mono tracking-[2px] text-white/40">{d}</div>
            ))}
            {Array.from({ length: startDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[110px] bg-[#0c0c0c] border-r border-b border-white/10 last:border-r-0" />
            ))}
            {days.map(day => {
              const post = scheduled.find(p => p.day === day);
              const isToday = day === 31;
              return (
                <div key={day} className={`min-h-[60px] sm:min-h-[110px] bg-[#0c0c0c] p-2 sm:p-3 text-sm border-r border-b border-white/10 ${isToday ? 'bg-[#7c3aed]/10' : ''}`}>
                  <div className={`font-medium mb-1 ${isToday ? 'text-[#7c3aed]' : ''}`}>{day}</div>
                  {post && (
                    <div className="text-[10px] p-1.5 sm:p-2 mt-1 rounded-xl bg-white/5 border border-white/10 hidden sm:block">
                      <div className="font-medium truncate">{post.title}</div>
                      <div className="text-white/40 text-[9px]">{post.platform}</div>
                    </div>
                  )}
                  {post && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] sm:hidden mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
