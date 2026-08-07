'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import MobileNav from '@/components/MobileNav';

export default function ProductsPage() {
  const [showUpload, setShowUpload] = useState(false);

  const products = [
    { id: 1, name: "Eco Stainless Bottle", category: "Drinkware", price: 29.99, status: "Active", emoji: "🥤" },
    { id: 2, name: "Reusable Tote Bag", category: "Accessories", price: 14.99, status: "Active", emoji: "👜" },
    { id: 3, name: "Bamboo Coffee Mug", category: "Drinkware", price: 22.50, status: "Draft", emoji: "☕" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      <div className="floating-shell mx-auto my-6 ring-1 ring-white/10">
        <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="font-semibold text-2xl tracking-tight">WonderMedia</Link>
          <div className="flex gap-3">
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors">
              <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Bulk Upload</span>
            </button>
            <button onClick={() => alert('Product creation coming soon!')} className="neon-button flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-8 pt-9 pb-6">
          <div className="font-mono text-xs tracking-[3px] text-white/50">PRODUCT LIBRARY</div>
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Products</div>
        </div>

        <div className="px-4 sm:px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="glass p-6 sm:p-7 rounded-[2.5rem] border border-white/10 hover:border-[#7c3aed]/40 transition-colors">
              <div className="text-5xl sm:text-6xl mb-6 opacity-80">{product.emoji}</div>
              <div className="font-semibold text-xl tracking-tight">{product.name}</div>
              <div className="text-white/50 text-sm mt-1">{product.category}</div>
              <div className="flex justify-between items-end mt-6">
                <div className="font-mono text-xl font-semibold">${product.price.toFixed(2)}</div>
                <div className={`status-badge ${product.status === 'Active' ? 'status-published' : 'status-draft'}`}>
                  {product.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6" onClick={() => setShowUpload(false)} role="dialog" aria-modal="true" aria-labelledby="upload-title">
          <div className="glass p-8 sm:p-10 rounded-[2.5rem] max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div id="upload-title" className="text-3xl font-semibold tracking-tight mb-7">Bulk Upload</div>
            <div className="border border-dashed border-white/20 p-8 sm:p-12 text-center rounded-3xl">
              <Upload className="w-9 h-9 mx-auto mb-4 text-white/40" />
              <div>Drop CSV, Excel or ZIP here</div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowUpload(false)} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button className="neon-button flex-1">Upload &amp; Process</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
