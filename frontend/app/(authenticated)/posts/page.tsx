'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Loader2, Sparkles, Pencil, Copy, Trash2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { usePosts, useCreatePost, useUpdatePost, useDeletePost, useDuplicatePost } from '@/hooks/usePosts';
import api, { type Post, type GeneratePostResponse } from '@/lib/api';
import { toast } from 'sonner';

const platformOptions = ['Instagram', 'LinkedIn', 'Facebook', 'X', 'TikTok'];
const typeOptions = ['Product Promotion', 'Educational', 'Festival', 'Brand Story', 'Tips & Tricks', 'Behind the Scenes'];

export default function PostsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: posts, isLoading, error: postsError, refetch: refetchPosts } = usePosts();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const duplicatePost = useDuplicatePost();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [type, setType] = useState('Product Promotion');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratePostResponse | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editHashtags, setEditHashtags] = useState('');
  const [editPlatforms, setEditPlatforms] = useState<string[]>([]);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editScheduleDate, setEditScheduleDate] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const urlProductId = searchParams.get('productId');
  const urlCreate = searchParams.get('create');
  const urlScheduleDate = searchParams.get('scheduleDate');
  const urlEditId = searchParams.get('edit');

  useEffect(() => {
    if (urlScheduleDate) {
      setScheduleDate(urlScheduleDate);
    }
    if (urlCreate === 'true') {
      setShowModal(true);
      setStep('input');
    }
  }, [urlCreate, urlScheduleDate]);

  useEffect(() => {
    if (urlEditId && posts && posts.length > 0) {
      const post = posts.find(p => p.id === urlEditId);
      if (post) openEdit(post);
    }
  }, [urlEditId, posts]);

  useEffect(() => {
    const active = showModal || !!editPost || !!deleteTarget;
    if (!active) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        resetModal();
        setEditPost(null);
        setDeleteTarget(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal, editPost, deleteTarget]);

  const resetModal = () => {
    setStep('input');
    setPrompt('');
    setGenerated(null);
    setScheduleDate('');
    if (urlCreate || urlScheduleDate) {
      router.replace('/posts');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const payload: Record<string, unknown> = { prompt, platform, type };
      if (urlProductId) {
        payload.productId = urlProductId;
      }
      const res = await api.post<GeneratePostResponse>('/ai/generate-post', payload);
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
      if (urlProductId) {
        payload.productId = urlProductId;
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

  const openEdit = (post: Post) => {
    setEditPost(post);
    setEditTitle(post.title || '');
    setEditCaption(post.caption || '');
    setEditHashtags(post.hashtags?.join(', ') || '');
    setEditPlatforms(post.platforms || []);
    setEditImageUrl(post.imageUrl || '');
    setEditVideoUrl(post.videoUrl || '');
    setEditScheduleDate(post.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : '');
  };

  const handleEditSave = async () => {
    if (!editPost) return;
    try {
      const hashtagsArr = editHashtags
        .split(/[\s,]+/)
        .map(h => h.trim())
        .filter(h => h.length > 0);
      const payload: Record<string, unknown> = {
        caption: editCaption,
        title: editTitle,
        hashtags: hashtagsArr,
        platforms: editPlatforms,
      };
      if (editScheduleDate) {
        payload.scheduledFor = new Date(editScheduleDate).toISOString();
      }
      await updatePost.mutateAsync({
        id: editPost.id,
        data: payload as any,
      });
      toast.success('Post updated!');
      setEditPost(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to update post');
    }
  };

  const handleDuplicate = async (post: Post) => {
    try {
      const newPost = await duplicatePost.mutateAsync(post.id);
      toast.success('Post duplicated!');
      openEdit(newPost);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to duplicate post');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost.mutateAsync(deleteTarget.id);
      toast.success('Post deleted!');
      setDeleteTarget(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to delete post');
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
                  <th className="px-4 sm:px-8 py-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-white/50">Loading posts...</td>
                  </tr>
                ) : postsError ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center">
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                      <div className="text-white/70 mb-2">Failed to load posts</div>
                      <div className="text-white/40 text-sm mb-4">{postsError.message || 'Check your connection and try again.'}</div>
                      <button onClick={() => refetchPosts()} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm text-white/70">
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                      </button>
                    </td>
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
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/posts/${post.id}`} className="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white" title="View">
                            <span className="text-xs font-mono">View</span>
                          </Link>
                          <button onClick={() => openEdit(post)} className="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDuplicate(post)} disabled={duplicatePost.isPending} className="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white disabled:opacity-50" title="Duplicate">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(post)} className="p-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                    {urlProductId && (
                      <div className="mb-2 px-3 py-1.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] text-xs inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" /> Product selected
                      </div>
                    )}
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 h-28 text-sm resize-none"
                      placeholder={urlProductId ? "e.g. Summer sale announcement for this product..." : "e.g. Earth Day campaign for sustainable water bottles, Summer sale announcement, New product launch..."}
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

      {/* Edit Post Modal */}
      {editPost && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 sm:p-6" onClick={() => setEditPost(null)} role="dialog" aria-modal="true">
          <div ref={modalRef} className="glass w-full max-w-lg p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] outline-none max-h-[90vh] overflow-y-auto overflow-x-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-mono text-xs tracking-[3px] text-white/50">EDIT POST</div>
                  <div className="text-xl font-semibold tracking-tight">Edit Post</div>
                </div>
              </div>
              <button onClick={() => setEditPost(null)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">TITLE</label>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"
                  placeholder="Post title..."
                />
              </div>
              <div>
                <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">CAPTION</label>
                <textarea
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 h-32 text-sm resize-none"
                  placeholder="Write your caption..."
                />
              </div>
              <div>
                <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">HASHTAGS (comma separated)</label>
                <input
                  value={editHashtags}
                  onChange={e => setEditHashtags(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"
                  placeholder="#trending, #socialmedia, #marketing"
                />
              </div>
              <div>
                <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">PLATFORMS</label>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map(p => (
                    <button
                      key={p}
                      onClick={() => setEditPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                      className={`px-4 py-2 rounded-full text-xs border transition-colors ${editPlatforms.includes(p) ? 'bg-[#7c3aed]/20 border-[#7c3aed]/50 text-[#7c3aed]' : 'border-white/10 text-white/50 hover:bg-white/5'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">IMAGE URL (optional)</label>
                <input
                  value={editImageUrl}
                  onChange={e => setEditImageUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">VIDEO URL (optional)</label>
                <input
                  value={editVideoUrl}
                  onChange={e => setEditVideoUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">SCHEDULE (OPTIONAL)</label>
                <input
                  type="datetime-local"
                  value={editScheduleDate}
                  onChange={e => setEditScheduleDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditPost(null)} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={updatePost.isPending || !editCaption.trim()} className="neon-button flex-1">
                {updatePost.isPending ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 sm:p-6" onClick={() => setDeleteTarget(null)} role="dialog" aria-modal="true">
          <div className="glass w-full max-w-md p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] outline-none" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">DELETE POST</div>
                <div className="text-xl font-semibold tracking-tight">Are you sure?</div>
              </div>
            </div>

            <p className="text-sm text-white/60 mb-6">
              This will permanently delete <span className="text-white font-medium">{deleteTarget.title || deleteTarget.caption?.slice(0, 50)}</span>. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deletePost.isPending} className="flex-1 py-4 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors font-medium">
                {deletePost.isPending ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</span> : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
