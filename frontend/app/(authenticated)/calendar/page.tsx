'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sparkles, X, Loader2, Calendar as CalendarIcon, Plus, FileText, Lightbulb, AlertTriangle, TrendingUp, Zap, Clock } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { festivals, getFestivalsForDate, getFestivalsForMonth, monthNames, categoryColors, type Festival } from '@/lib/festivals';
import api, { type Post } from '@/lib/api';
import { toast } from 'sonner';

interface Recommendation {
  product: string;
  contentType: string;
  reason: string;
  concept: string;
  suggestedCaption: string;
  platform: string;
  priority: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const { data: posts } = usePosts();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<{ month: number; day: number } | null>(null);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedDatePosts, setSelectedDatePosts] = useState<Post[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const postsByDate = new Map<string, Post[]>();
  posts?.forEach(p => {
    if (p.scheduledFor) {
      const d = new Date(p.scheduledFor);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = postsByDate.get(key) || [];
      arr.push(p);
      postsByDate.set(key, arr);
    }
  });

  const getPostsForDay = (day: number): Post[] => {
    const key = `${year}-${month}-${day}`;
    return postsByDate.get(key) || [];
  };

  const scheduled = posts
    ?.filter(p => p.scheduledFor)
    .map(p => {
      const d = new Date(p.scheduledFor!);
      return { day: d.getDate(), month: d.getMonth(), title: p.title || p.caption?.slice(0, 40), platform: p.platforms?.[0] };
    }) || [];

  const monthFestivals = getFestivalsForMonth(month + 1);
  const festivalDays = new Set(monthFestivals.map(f => f.day));

  const productFrequency = useMemo(() => {
    if (!posts) return { recent: [] as { name: string; lastPosted: Date }[], overdue: [] as { name: string; daysSince: number }[] };
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const productMap = new Map<string, { name: string; lastPosted: Date }>();
    posts.forEach(p => {
      if (p.product) {
        const existing = productMap.get(p.product.id);
        const postDate = new Date(p.createdAt);
        if (!existing || postDate > existing.lastPosted) {
          productMap.set(p.product.id, { name: p.product.name, lastPosted: postDate });
        }
      }
    });

    const recent: { name: string; lastPosted: Date }[] = [];
    const overdue: { name: string; daysSince: number }[] = [];

    productMap.forEach(({ name, lastPosted }) => {
      if (lastPosted >= sevenDaysAgo) {
        recent.push({ name, lastPosted });
      } else {
        const daysSince = Math.floor((Date.now() - lastPosted.getTime()) / (1000 * 60 * 60 * 24));
        overdue.push({ name, daysSince });
      }
    });

    return { recent, overdue };
  }, [posts]);

  const getRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const res = await api.post('/ai/recommendations');
      setRecommendations(res.data.recommendations || []);
      setShowRecommendations(true);
    } catch {
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

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
    const dayPosts = getPostsForDay(day);

    if (dayFestivals.length > 0) {
      setSelectedFestival(dayFestivals[0]);
      setShowFestivalModal(true);
      setGeneratedPost(null);
    } else if (dayPosts.length > 0) {
      setSelectedDatePosts(dayPosts);
      setShowPostModal(true);
    } else {
      setShowDateModal(true);
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
              const dayPosts = getPostsForDay(day);
              const hasPosts = dayPosts.length > 0;
              const dayFestivals = getFestivalsForDate(month + 1, day);

              const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const showGap = !hasPosts && !hasFestival && !isPast;

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[60px] sm:min-h-[110px] bg-[#0c0c0c] p-2 sm:p-3 text-sm border-r border-b border-white/10 cursor-pointer transition-colors hover:bg-white/5 ${isToday ? 'bg-[#7c3aed]/10' : ''} ${hasFestival ? 'ring-1 ring-[#ec4899]/30' : ''} ${hasPosts ? 'ring-1 ring-[#7c3aed]/30' : ''} ${showGap ? 'opacity-60' : ''}`}
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
                  {hasPosts && (
                    <div className="hidden sm:block">
                      {dayPosts.slice(0, 2).map((p, pi) => (
                        <div key={pi} className="text-[10px] p-1 mt-1 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 truncate">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${p.status === 'SCHEDULED' ? 'bg-[#7c3aed]' : p.status === 'PUBLISHED' ? 'bg-green-400' : p.status === 'DRAFT' ? 'bg-yellow-400' : 'bg-white/40'}`} />
                          {p.title || p.caption?.slice(0, 30) || 'Post'}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-[10px] text-[#7c3aed] mt-0.5">+{dayPosts.length - 2} more</div>
                      )}
                    </div>
                  )}
                  {showGap && (
                    <div className="hidden sm:block text-[10px] text-white/30 mt-1 italic">no content</div>
                  )}
                  {hasFestival && <div className="w-1.5 h-1.5 rounded-full bg-[#ec4899] sm:hidden mt-1" />}
                  {hasPosts && (
                    <div className="flex gap-0.5 mt-1 sm:hidden">
                      {dayPosts.slice(0, 3).map((p, pi) => (
                        <div key={pi} className={`w-1.5 h-1.5 rounded-full ${p.status === 'SCHEDULED' ? 'bg-[#7c3aed]' : p.status === 'PUBLISHED' ? 'bg-green-400' : p.status === 'DRAFT' ? 'bg-yellow-400' : 'bg-white/40'}`} />
                      ))}
                    </div>
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

        {/* Content Opportunities Panel */}
        <div className="mt-6">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">CONTENT OPPORTUNITIES</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Products Needing Content */}
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-[#ec4899]" />
                <span className="text-sm font-medium">Products Needing Content</span>
              </div>
              {productFrequency.overdue.length > 0 ? (
                <div className="space-y-2">
                  {productFrequency.overdue.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ec4899]/20 text-[#ec4899]">{p.daysSince}d ago</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/40 text-sm">All products have recent content</div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Recently Active</span>
              </div>
              {productFrequency.recent.length > 0 ? (
                <div className="space-y-2">
                  {productFrequency.recent.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">active</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/40 text-sm">No recent product posts</div>
              )}
            </div>
          </div>

          <button
            onClick={getRecommendations}
            disabled={isLoadingRecommendations}
            className="w-full mt-4 py-3 rounded-xl border border-[#7c3aed]/30 hover:bg-[#7c3aed]/10 transition-colors text-sm flex items-center justify-center gap-2 text-[#7c3aed] disabled:opacity-50"
          >
            {isLoadingRecommendations ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Get AI Content Recommendations
          </button>
        </div>
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

      {/* Post List Modal */}
      {showPostModal && selectedDate && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowPostModal(false)}>
          <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">SCHEDULED POSTS</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {monthNames[selectedDate.month - 1]} {selectedDate.day}
                </div>
                <div className="text-white/50 text-sm mt-1">{selectedDatePosts.length} post{selectedDatePosts.length !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => setShowPostModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              {selectedDatePosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => { setShowPostModal(false); router.push(`/posts/${post.id}`); }}
                  className="w-full text-left p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate max-w-[240px]">{post.title || post.caption?.slice(0, 40) || 'Untitled Post'}</div>
                    </div>
                    <FileText className="w-4 h-4 text-white/30 group-hover:text-[#7c3aed] shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#7c3aed]">{post.platforms?.[0] || post.platform || '—'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : post.status === 'SCHEDULED' ? 'bg-[#7c3aed]/20 text-[#7c3aed]' : post.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'}`}>
                      {post.status}
                    </span>
                    {post.scheduledFor && (
                      <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPostModal(false);
                const dateStr = `${year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}T10:00`;
                router.push(`/posts?create=true&scheduleDate=${dateStr}`);
              }}
              className="w-full mt-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/5 transition-all text-sm flex items-center justify-center gap-2 text-white/60 hover:text-[#7c3aed]"
            >
              <Plus className="w-4 h-4" /> Create New Post for This Date
            </button>
          </div>
        </div>
      )}

      {/* Date Modal (no posts, no festivals) */}
      {showDateModal && selectedDate && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowDateModal(false)}>
          <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl font-semibold tracking-tight">
                  {monthNames[selectedDate.month - 1]} {selectedDate.day}
                </div>
                <div className="text-white/50 text-sm mt-1">No posts scheduled</div>
              </div>
              <button onClick={() => setShowDateModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowDateModal(false);
                  const dateStr = `${year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}T10:00`;
                  router.push(`/posts?create=true&scheduleDate=${dateStr}`);
                }}
                className="neon-button w-full"
              >
                <span className="flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Create Post for This Date</span>
              </button>

              <button
                onClick={async () => {
                  setIsLoadingRecommendations(true);
                  try {
                    const res = await api.post('/ai/recommendations');
                    setRecommendations(res.data.recommendations || []);
                    setShowDateModal(false);
                    setShowRecommendations(true);
                  } catch {
                    toast.error('Failed to load recommendations');
                  } finally {
                    setIsLoadingRecommendations(false);
                  }
                }}
                disabled={isLoadingRecommendations}
                className="w-full py-3 rounded-xl border border-[#ec4899]/30 hover:bg-[#ec4899]/10 transition-colors text-sm flex items-center justify-center gap-2 text-[#ec4899] disabled:opacity-50"
              >
                {isLoadingRecommendations ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
                Get AI Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecommendations && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowRecommendations(false)}>
          <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">AI RECOMMENDATIONS</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">Content Ideas</div>
                <div className="text-white/50 text-sm mt-1">{recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => setShowRecommendations(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'}`}>
                        {rec.priority}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#7c3aed]">{rec.contentType}</span>
                    </div>
                    <span className="text-[10px] text-white/40">{rec.platform}</span>
                  </div>
                  <div className="font-medium text-sm mb-1">{rec.product}</div>
                  <div className="text-white/60 text-xs mb-3">{rec.reason}</div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-3">
                    <div className="font-mono text-[10px] text-white/40 mb-1">CONCEPT</div>
                    <div className="text-xs text-white/70">{rec.concept}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-3">
                    <div className="font-mono text-[10px] text-white/40 mb-1">SUGGESTED CAPTION</div>
                    <div className="text-xs text-white/70 italic">"{rec.suggestedCaption}"</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowRecommendations(false);
                      const dateStr = selectedDate
                        ? `${year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}T10:00`
                        : `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T10:00`;
                      router.push(`/posts?create=true&scheduleDate=${dateStr}&prompt=${encodeURIComponent(rec.concept)}`);
                    }}
                    className="w-full py-2 rounded-xl border border-[#7c3aed]/30 hover:bg-[#7c3aed]/10 transition-colors text-xs flex items-center justify-center gap-2 text-[#7c3aed]"
                  >
                    <Sparkles className="w-3 h-3" /> Generate This Post
                  </button>
                </div>
              ))}
            </div>

            {recommendations.length === 0 && (
              <div className="text-center py-8 text-white/40 text-sm">
                No recommendations available. Try adding more products or posts first.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
