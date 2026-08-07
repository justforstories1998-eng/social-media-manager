'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import MobileNav from '@/components/MobileNav';

export default function PostsPage() {
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

  const posts = [
    { id: 1, title: "Eco Bottle Launch", platform: "Instagram", status: "Published", date: "Jul 28", reach: "48.2k" },
    { id: 2, title: "Earth Day Special", platform: "LinkedIn", status: "Scheduled", date: "Jul 31", reach: "—" },
    { id: 3, title: "How to Choose a Bottle", platform: "Facebook", status: "Draft", date: "Aug 2", reach: "—" },
    { id: 4, title: "Customer Spotlight", platform: "Instagram", status: "Approved", date: "Aug 5", reach: "—" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      <div className="floating-shell mx-auto my-6 ring-1 ring-white/10">
        
        <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="font-semibold text-2xl tracking-tight">WonderMedia</Link>
          <button onClick={() => setShowModal(true)} className="neon-button flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Generate with AI</span>
          </button>
        </div>

        <div className="px-4 sm:px-8 pt-10 pb-6">
          <div className="font-mono text-xs tracking-[3px] text-white/50">CONTENT STUDIO</div>
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">All Posts</div>
        </div>

        <div className="px-4 sm:px-8 pb-12">
          <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10">
            <div className="table-wrapper">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-mono tracking-[2px] text-white/40">
                    <th className="px-4 sm:px-8 py-5 text-left">POST</th>
                    <th className="px-4 sm:px-8 py-5 text-left hidden sm:table-cell">PLATFORM</th>
                    <th className="px-4 sm:px-8 py-5 text-left">STATUS</th>
                    <th className="px-4 sm:px-8 py-5 text-left hidden md:table-cell">SCHEDULED</th>
                    <th className="px-4 sm:px-8 py-5 text-right hidden lg:table-cell">REACH</th>
                    <th className="px-4 sm:px-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id} className="border-b border-white/10 hover:bg-white/5 last:border-none">
                      <td className="px-4 sm:px-8 py-6 font-medium text-lg tracking-tight">
                        {post.title}
                        <div className="sm:hidden text-xs text-white/50 font-mono mt-1">{post.platform}</div>
                      </td>
                      <td className="px-4 sm:px-8 py-6 text-white/70 hidden sm:table-cell">{post.platform}</td>
                      <td className="px-4 sm:px-8 py-6">
                        <span className={`status-badge ${post.status === 'Published' ? 'status-published' : post.status === 'Scheduled' ? 'status-scheduled' : post.status === 'Approved' ? 'status-approved' : 'status-draft'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-6 text-sm text-white/60 font-mono hidden md:table-cell">{post.date}</td>
                      <td className="px-4 sm:px-8 py-6 text-right font-mono text-sm hidden lg:table-cell">{post.reach}</td>
                      <td className="px-4 sm:px-8 py-6 text-right">
                        <Link href={`/posts/${post.id}`} className="text-xs px-4 py-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors inline-block">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6" onClick={() => setShowModal(false)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div ref={modalRef} tabIndex={-1} className="glass max-w-md w-full p-8 rounded-[2.5rem] outline-none" onClick={e => e.stopPropagation()}>
            <div className="font-mono text-xs tracking-[3px] mb-2 text-white/50">AI GENERATOR</div>
            <div id="modal-title" className="text-3xl font-semibold tracking-tight mb-8">Generate new content</div>

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
                  <select value={modalPlatform} onChange={e => setModalPlatform(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"><option>Instagram</option></select>
                </div>
                <div>
                  <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">TYPE</label>
                  <select value={modalType} onChange={e => setModalType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"><option>Product Promotion</option></select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => { setShowModal(false); alert('Content generated! Check Telegram.'); }} className="neon-button flex-1">Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
