'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, X, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { festivals, getFestivalsForDate, getFestivalsForMonth, monthNames, categoryColors, type Festival } from '@/lib/festivals';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CalendarPage() {
  const { data: posts } = usePosts();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<{ month: number; day: number } | null>(null);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<any>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const scheduled = posts
    ?.filter(p => p.scheduledFor)
    .map(p => {
      const d = new Date(p.scheduledFor!);
      return { day: d.getDate(), month: d.getMonth(), title: p.title || p.caption?.slice(0, 40), platform: p.platforms?.[0] };
    }) || [];

  const monthFestivals = getFestivalsForMonth(month + 1);
  const festivalDays = new Set(monthFestivals.map(f => f.day));

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDate({ month: month + 1, day });
    const dayFestivals = getFestivalsForDate(month + 1, day);
    if (dayFestivals.length > 0) {
      setSelectedFestival(dayFestivals[0]);
      setShowFestivalModal(true);
      setGeneratedPost(null);
    }
  };

  const handleGeneratePost = async (festival: Festival) => {
    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate-post', {
        prompt: `${festival.promptSuggestion}. Create an engaging social media post for ${festival.name}.`,
        platform: 'Instagram',
        type: 'Festival',
      });
      setGeneratedPost(res.data);
    } catch {
      toast.error('Failed to generate post');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-8 pb-6">
        <div className="font-mono text-xs tracking-[3px] text-white/50">CONTENT CALENDAR</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">{monthNames[month]} {year}</div>
        {monthFestivals.length > 0 && (
          <div className="text-white/50 text-sm mt-2">{monthFestivals.length} special day{monthFestivals.length > 1 ? 's' : ''} this month</div>
        )}
      </div>

      <div className="px-4 sm:px-8 pb-10">
        <div className="glass p-4 sm:p-8 rounded-[2.5rem]">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrevMonth} className="p-2 rounded-xl hover:bg-white/5 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleNextMonth} className="p-2 rounded-xl hover:bg-white/5 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/10">
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <div key={d} className="bg-[#0c0c0c] py-3 text-center text-[10px] font-mono tracking-[2px] text-white/40">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[110px] bg-[#0c0c0c] border-r border-b border-white/10 last:border-r-0" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = isCurrentMonth && day === today.getDate();
              const hasFestival = festivalDays.has(day);
              const post = scheduled.find(p => p.day === day && p.month === month);
              const dayFestivals = getFestivalsForDate(month + 1, day);

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[60px] sm:min-h-[110px] bg-[#0c0c0c] p-2 sm:p-3 text-sm border-r border-b border-white/10 cursor-pointer transition-colors hover:bg-white/5 ${isToday ? 'bg-[#7c3aed]/10' : ''} ${hasFestival ? 'ring-1 ring-[#ec4899]/30' : ''}`}
                >
                  <div className={`font-medium mb-1 ${isToday ? 'text-[#7c3aed]' : ''} ${hasFestival ? 'text-[#ec4899]' : ''}`}>{day}</div>
                  {hasFestival && (
                    <div className="hidden sm:block">
                      {dayFestivals.slice(0, 2).map((f, fi) => (
                        <div key={fi} className="text-[10px] p-1 mt-1 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20 truncate">
                          {f.emoji} {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {hasFestival && <div className="w-1.5 h-1.5 rounded-full bg-[#ec4899] sm:hidden mt-1" />}
                  {post && (
                    <div className="text-[10px] p-1.5 mt-1 rounded-xl bg-white/5 border border-white/10 hidden sm:block">
                      <div className="font-medium truncate">{post.title}</div>
                      <div className="text-white/40 text-[9px]">{post.platform}</div>
                    </div>
                  )}
                  {post && !hasFestival && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] sm:hidden mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Festivals */}
        {monthFestivals.length > 0 && (
          <div className="mt-6">
            <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">UPCOMING SPECIAL DAYS</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {monthFestivals.map((f, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedFestival(f); setShowFestivalModal(true); setGeneratedPost(null); }}
                  className="text-left p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#ec4899]/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{f.emoji}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[f.category]}`}>{f.category}</span>
                  </div>
                  <div className="font-medium text-sm">{f.name}</div>
                  <div className="text-white/50 text-xs mt-0.5">{monthNames[f.month - 1]} {f.day}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Festival Detail Modal */}
      {showFestivalModal && selectedFestival && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowFestivalModal(false)}>
          <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-4xl mb-2">{selectedFestival.emoji}</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">{selectedFestival.name}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-3 py-1 rounded-full ${categoryColors[selectedFestival.category]}`}>{selectedFestival.category}</span>
                  <span className="text-white/50 text-sm">{monthNames[selectedFestival.month - 1]} {selectedFestival.day}</span>
                </div>
              </div>
              <button onClick={() => setShowFestivalModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <div className="font-mono text-[10px] text-white/40 mb-2">POST IDEA</div>
              <div className="text-sm text-white/70">{selectedFestival.promptSuggestion}</div>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin mb-4" />
                <div className="text-white/50 text-sm">Generating post with AI...</div>
              </div>
            ) : generatedPost ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="font-mono text-[10px] text-white/40 mb-2">CAPTION</div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{generatedPost.caption}</div>
                </div>
                {generatedPost.hashtags && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-mono text-[10px] text-white/40 mb-2">HASHTAGS</div>
                    <div className="text-sm text-[#ec4899]">{generatedPost.hashtags}</div>
                  </div>
                )}
                <button onClick={() => handleGeneratePost(selectedFestival)} className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Regenerate
                </button>
              </div>
            ) : (
              <button onClick={() => handleGeneratePost(selectedFestival)} className="neon-button w-full">
                <span className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> Generate Post for {selectedFestival.name}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
