'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Sparkles, Calendar, Send } from 'lucide-react';
import { usePosts, useCreatePost } from '@/hooks/usePosts';
import api, { type GeneratePostResponse } from '@/lib/api';
import { toast } from 'sonner';

const platformOptions = ['Instagram', 'LinkedIn', 'Facebook', 'X', 'TikTok'];
const typeOptions = ['Product Promotion', 'Educational', 'Festival', 'Brand Story', 'Tips & Tricks', 'Behind the Scenes'];

export default function PostsPage() {
  const { data: posts, isLoading } = usePosts();
  const createPost = useCreatePost();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [type, setType] = useState('Product Promotion');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratePostResponse | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showModal) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowModal(false); resetModal(); }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const resetModal = () => {
    setStep('input');
    setPrompt('');
    setGenerated(null);
    setScheduleDate('');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await api.post<GeneratePostResponse>('/ai/generate-post', {
        prompt,
        platform,
        type,
      });
      setGenerated(res.data);
      setStep('preview');
    } catch {
      toast.error('AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generated) return;
    try {
      let hashtagsArr: string[] = [];
      if (generated.hashtags) {
        if (Array.isArray(generated.hashtags)) {
          hashtagsArr = generated.hashtags.filter((h: string) => h.startsWith('#'));
        } else if (typeof generated.hashtags === 'string') {
          hashtagsArr = generated.hashtags.split(/[\s,]+/).filter((h: string) => h.startsWith('#'));
        }
      }
      const payload: Record<string, unknown> = {
        caption: generated.caption,
        title: generated.caption.slice(0, 80),
        hashtags: hashtagsArr,
        platforms: [platform],
      };
      if (scheduleDate) {
        payload.scheduledFor = scheduleDate;
      }
      await createPost.mutateAsync(payload as any);
      toast.success(scheduleDate ? 'Post scheduled!' : 'Post created!');
      setShowModal(false);
      resetModal();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to create post';
      console.error('Post creation error:', axiosErr?.response?.data || axiosErr);
      toast.error(msg);
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="font-mono text-xs tracking-[3px] text-white/50">CONTENT STUDIO</div>
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">All Posts</div>
        </div>
        <button onClick={() => { setShowModal(true); resetModal(); }} className="neon-button flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Generate with AI</span>
          <span className="sm:hidden">New Post</span>
        </button>
      </div>

      <div className="px-4 sm:px-8 pb-12">
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10">
          <div className="table-wrapper">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono tracking-[2px] text-white/40">
                  <th className="px-4 sm:px-8 py-5 text-left">POST</th>
                  <th className="px-4 sm:px-8 py-5 text-left hidden sm:table-cell">PLATFORM</th>
                  <th className="px-4 sm:px-8 py-5 text-left hidden sm:table-cell">STATUS</th>
                  <th className="px-4 sm:px-8 py-5 text-left hidden md:table-cell">SCHEDULED</th>
                  <th className="px-4 sm:px-8 py-5 text-right hidden lg:table-cell">REACH</th>
                  <th className="px-4 sm:px-8"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-white/50">Loading posts...</td>
                  </tr>
                ) : posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-white/10 hover:bg-white/5 last:border-none">
                      <td className="px-4 sm:px-8 py-4 sm:py-6 font-medium text-base sm:text-lg tracking-tight">
                        {post.title || post.caption?.slice(0, 60)}
                        <div className="flex items-center gap-2 mt-1 sm:hidden">
                          <span className="text-xs text-white/50 font-mono">{post.platforms?.[0] || post.platformContent}</span>
                          <span className={`status-badge text-[10px] px-2 py-0.5 ${post.status === 'PUBLISHED' ? 'status-published' : post.status === 'SCHEDULED' ? 'status-scheduled' : post.status === 'APPROVED' ? 'status-approved' : 'status-draft'}`}>
                            {post.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-white/70 hidden sm:table-cell">{post.platforms?.[0] || post.platformContent || '—'}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 hidden sm:table-cell">
                        <span className={`status-badge ${post.status === 'PUBLISHED' ? 'status-published' : post.status === 'SCHEDULED' ? 'status-scheduled' : post.status === 'APPROVED' ? 'status-approved' : 'status-draft'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-sm text-white/60 font-mono hidden md:table-cell">
                        {post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-right font-mono text-sm hidden lg:table-cell">
                        {post.reach ? `${post.reach}k` : '—'}
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-right hidden md:table-cell">
                        <Link href={`/posts/${post.id}`} className="text-xs px-4 py-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors inline-block">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-white/50">
                      <div className="text-4xl mb-3">✨</div>
                      No posts yet. Click &quot;Generate with AI&quot; to create your first post!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Post Generator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 sm:p-6" onClick={() => { setShowModal(false); resetModal(); }} role="dialog" aria-modal="true">
          <div ref={modalRef} className="glass w-full max-w-lg p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] outline-none max-h-[90vh] overflow-y-auto overflow-x-hidden" onClick={e => e.stopPropagation()}>
            {step === 'input' ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-mono text-xs tracking-[3px] text-white/50">AI POST GENERATOR</div>
                    <div className="text-xl font-semibold tracking-tight">Create with AI</div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">WHAT DO YOU WANT TO POST ABOUT?</label>
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 h-28 text-sm resize-none"
                      placeholder="e.g. Earth Day campaign for sustainable water bottles, Summer sale announcement, New product launch..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">PLATFORM</label>
                      <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm">
                        {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">CONTENT TYPE</label>
                      <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm">
                        {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => { setShowModal(false); resetModal(); }} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
                  <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="neon-button flex-1">
                    {isGenerating ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating...</span> : 'Generate Post'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-mono text-xs tracking-[3px] text-white/50">PREVIEW</div>
                    <div className="text-xl font-semibold tracking-tight">Your AI Post</div>
                  </div>
                </div>

                {generated && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="font-mono text-[10px] text-white/40 mb-2">CAPTION</div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{generated.caption}</div>
                    </div>

                    {generated.hashtags && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="font-mono text-[10px] text-white/40 mb-2">HASHTAGS</div>
                        <div className="text-sm text-[#ec4899] break-words">{generated.hashtags}</div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="font-mono text-[10px] text-white/40 mb-2">PLATFORM</div>
                      <div className="text-sm">{platform} • {type}</div>
                    </div>

                    <div>
                      <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">SCHEDULE (OPTIONAL)</label>
                      <input
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep('input')} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Regenerate
                  </button>
                  <button onClick={handlePublish} disabled={createPost.isPending} className="neon-button flex-1">
                    {createPost.isPending ? 'Publishing...' : scheduleDate ? 'Schedule Post' : 'Publish Now'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
