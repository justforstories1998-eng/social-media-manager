'use client';

import React, { useState } from 'react';
import { Plus, Upload, Trash2 } from 'lucide-react';
import { useProducts, useCreateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const [showUpload, setShowUpload] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', price: '', description: '', emoji: '' });

  const handleAdd = async () => {
    try {
      await createProduct.mutateAsync({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price) || 0,
        description: form.description || undefined,
        emoji: form.emoji || undefined,
      });
      toast.success('Product added!');
      setShowAdd(false);
      setForm({ name: '', category: '', price: '', description: '', emoji: '' });
    } catch {
      toast.error('Failed to add product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
        <div className="font-mono text-xs tracking-[3px] text-white/50">PRODUCT LIBRARY</div>
        <div className="flex gap-3">
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors">
            <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Bulk Upload</span>
          </button>
          <button onClick={() => setShowAdd(true)} className="neon-button flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Products</div>
      </div>

      <div className="px-4 sm:px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass p-7 rounded-[2.5rem] border border-white/10 animate-pulse">
              <div className="w-14 h-14 bg-white/10 rounded-2xl mb-6" />
              <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
            </div>
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="glass p-6 sm:p-7 rounded-[2.5rem] border border-white/10 hover:border-[#7c3aed]/40 transition-colors relative group">
              <div className="text-5xl sm:text-6xl mb-6 opacity-80">{product.emoji || '📦'}</div>
              <div className="font-semibold text-xl tracking-tight">{product.name}</div>
              <div className="text-white/50 text-sm mt-1">{product.category}</div>
              <div className="flex justify-between items-end mt-6">
                <div className="font-mono text-xl font-semibold">${Number(product.price || 0).toFixed(2)}</div>
                <div className={`status-badge ${product.status === 'Active' ? 'status-published' : 'status-draft'}`}>
                  {product.status}
                </div>
              </div>
              <button
                onClick={() => handleDelete(product.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-white/50">No products yet. Add your first one!</div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6" onClick={() => setShowAdd(false)}>
          <div className="glass p-8 rounded-[2.5rem] max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-3xl font-semibold tracking-tight mb-7">Add Product</div>
            <div className="space-y-4">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" className="w-full" />
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category" className="w-full" />
              <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price" type="number" className="w-full" />
              <input value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} placeholder="Emoji (e.g. 🧴)" className="w-full" />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={createProduct.isPending} className="neon-button flex-1">
                {createProduct.isPending ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6" onClick={() => setShowUpload(false)}>
          <div className="glass p-8 sm:p-10 rounded-[2.5rem] max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-3xl font-semibold tracking-tight mb-7">Bulk Upload</div>
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
