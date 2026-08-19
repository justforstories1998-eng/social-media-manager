'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { usePosts, useCreatePost } from '@/hooks/usePosts';
import { toast } from 'sonner';

export default function PostsPage() {
  const { data: posts, isLoading } = usePosts();
  const createPost = useCreatePost();
  const [showModal, setShowModal] = useState(false);
  const [modalPrompt, setModalPrompt] = useState('Earth Day campaign for reusable bottles');
  const [modalPlatform, setModalPlatform] = useState('Instagram');
  const [modalType, setModalType] = useState('Product Promotion');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showModal) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  useEffect(() => {
    if (showModal && modalRef.current) {
      modalRef.current.focus();
    }
  }, [showModal]);

  const handleGenerate = async () => {
    try {
      await createPost.mutateAsync({
        title: modalPrompt.slice(0, 50),
        content: modalPrompt,
        platform: modalPlatform,
        type: modalType,
      });
      toast.success('Content generated! Check Telegram.');
      setShowModal(false);
    } catch {
      toast.error('Failed to generate content');
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="font-mono text-xs tracking-[3px] text-white/50">CONTENT STUDIO</div>
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">All Posts</div>
        </div>
        <button onClick={() => setShowModal(true)} className="neon-button flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Generate with AI</span>
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
                        {post.title}
                        <div className="flex items-center gap-2 mt-1 sm:hidden">
                          <span className="text-xs text-white/50 font-mono">{post.platform}</span>
                          <span className={`status-badge text-[10px] px-2 py-0.5 ${post.status === 'Published' ? 'status-published' : post.status === 'Scheduled' ? 'status-scheduled' : post.status === 'Approved' ? 'status-approved' : 'status-draft'}`}>
                            {post.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-white/70 hidden sm:table-cell">{post.platform}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 hidden sm:table-cell">
                        <span className={`status-badge ${post.status === 'Published' ? 'status-published' : post.status === 'Scheduled' ? 'status-scheduled' : post.status === 'Approved' ? 'status-approved' : 'status-draft'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-6 text-sm text-white/60 font-mono hidden md:table-cell">
                        {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 sm:px-8 py-6 text-right font-mono text-sm hidden lg:table-cell">
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
                    <td colSpan={6} className="px-8 py-12 text-center text-white/50">No posts yet. Generate your first one!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowModal(false)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div ref={modalRef} tabIndex={-1} className="glass max-w-md w-full p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] outline-none" onClick={e => e.stopPropagation()}>
            <div className="font-mono text-xs tracking-[3px] mb-2 text-white/50">AI GENERATOR</div>
            <div id="modal-title" className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6 sm:mb-8">Generate new content</div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">PROMPT</label>
                <textarea
                  value={modalPrompt}
                  onChange={e => setModalPrompt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 h-24 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">PLATFORM</label>
                  <select value={modalPlatform} onChange={e => setModalPlatform(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"><option>Instagram</option><option>LinkedIn</option><option>Facebook</option><option>X</option><option>TikTok</option></select>
                </div>
                <div>
                  <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">TYPE</label>
                  <select value={modalType} onChange={e => setModalType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"><option>Product Promotion</option><option>Educational</option><option>Festival</option></select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleGenerate} disabled={createPost.isPending} className="neon-button flex-1">
                {createPost.isPending ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
