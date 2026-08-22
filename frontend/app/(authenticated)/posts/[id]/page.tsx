'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Globe, Hash, Clock, CheckCircle, Loader2, Pencil, Copy, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useUpdatePost, useDeletePost, useDuplicatePost } from '@/hooks/usePosts';
import { toast } from 'sonner';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const duplicatePost = useDuplicatePost();

  const { data: post, isLoading, error: postError, refetch: refetchPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const res = await api.get(`/posts/${postId}`);
      return res.data;
    },
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="floating-shell mx-auto ring-1 ring-white/10 p-12 text-center">
        <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin mx-auto" />
        <div className="text-white/50 mt-4">Loading post...</div>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="floating-shell mx-auto ring-1 ring-white/10 p-12 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <div className="text-xl font-semibold mb-2">Failed to load post</div>
        <div className="text-white/40 text-sm mb-4">{postError.message || 'Check your connection and try again.'}</div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => refetchPost()} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm text-white/70">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
          <Link href="/posts" className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm text-white/70">Back to Posts</Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="floating-shell mx-auto ring-1 ring-white/10 p-12 text-center">
        <div className="text-4xl mb-4">📝</div>
        <div className="text-xl font-semibold mb-2">Post not found</div>
        <Link href="/posts" className="text-[#7c3aed] text-sm hover:underline">Back to Posts</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PUBLISHED: 'status-published',
    SCHEDULED: 'status-scheduled',
    APPROVED: 'status-approved',
    PENDING_APPROVAL: 'status-ready',
    DRAFT: 'status-draft',
  };

  const handleDuplicate = async () => {
    if (!post) return;
    try {
      const newPost = await duplicatePost.mutateAsync(post.id);
      toast.success('Post duplicated!');
      router.push(`/posts/${newPost.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to duplicate post');
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm(`Delete "${post.title || post.caption?.slice(0, 50)}"? This cannot be undone.`)) return;
    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Post deleted!');
      router.push('/posts');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to delete post');
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-8 pb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Posts
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="font-mono text-xs tracking-[3px] text-white/50">POST DETAILS</div>
            <div className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1">{post.title || 'Untitled Post'}</div>
          </div>
          <span className={`status-badge text-sm px-4 py-2 ${statusColors[post.status] || 'status-draft'}`}>
            {post.status}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 sm:p-8 rounded-[2rem]">
              <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">CAPTION</div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{post.caption}</div>
            </div>

            {post.hashtags && post.hashtags.length > 0 && (
              <div className="glass p-6 sm:p-8 rounded-[2rem]">
                <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">HASHTAGS</div>
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-[#ec4899]/10 text-[#ec4899] text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {post.imageUrl && (
              <div className="glass p-6 sm:p-8 rounded-[2rem]">
                <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">IMAGE</div>
                <img src={post.imageUrl} alt="Post" className="w-full rounded-2xl max-h-96 object-cover" />
              </div>
            )}

            {post.videoUrl && (
              <div className="glass p-6 sm:p-8 rounded-[2rem]">
                <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">VIDEO</div>
                <video src={post.videoUrl} controls className="w-full rounded-2xl max-h-96" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-[2rem]">
              <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">DETAILS</div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-white/40" />
                  <div>
                    <div className="text-white/50 text-xs">Platform</div>
                    <div>{post.platforms?.join(', ') || post.platformContent || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <div>
                    <div className="text-white/50 text-xs">Created</div>
                    <div>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                {post.scheduledFor && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-white/40" />
                    <div>
                      <div className="text-white/50 text-xs">Scheduled For</div>
                      <div>{new Date(post.scheduledFor).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {post.publishedAt && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-white/50 text-xs">Published</div>
                      <div>{new Date(post.publishedAt).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {post.reach && (
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-white/40" />
                    <div>
                      <div className="text-white/50 text-xs">Reach</div>
                      <div>{post.reach}k</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {post.product && (
              <div className="glass p-6 rounded-[2rem]">
                <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">LINKED PRODUCT</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                    {post.product.emoji || '📦'}
                  </div>
                  <div>
                    <div className="font-medium">{post.product.name}</div>
                    <div className="text-white/50 text-xs">{post.product.category}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="glass p-6 rounded-[2rem]">
              <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">ACTIONS</div>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/posts')}
                  className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" /> Edit Post
                </button>
                <button
                  onClick={handleDuplicate}
                  disabled={duplicatePost.isPending}
                  className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {duplicatePost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  {duplicatePost.isPending ? 'Duplicating...' : 'Duplicate'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                  className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deletePost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deletePost.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
