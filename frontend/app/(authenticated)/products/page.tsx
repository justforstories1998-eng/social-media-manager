'use client';

import React, { useState } from 'react';
import { Plus, Upload, Trash2, Sparkles, Download, X, Loader2 } from 'lucide-react';
import { useProducts, useCreateProduct, useDeleteProduct } from '@/hooks/useProducts';
import api, { type AdConcept, type AdImageResponse } from '@/lib/api';
import { toast } from 'sonner';
import CustomDropdown from '@/components/CustomDropdown';

const currencyOptions = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'INR', label: '₹ INR' },
  { value: 'JPY', label: '¥ JPY' },
  { value: 'AUD', label: 'A$ AUD' },
  { value: 'CAD', label: 'C$ CAD' },
];

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$',
};

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const [showUpload, setShowUpload] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adConcepts, setAdConcepts] = useState<AdConcept[]>([]);
  const [generatedImage, setGeneratedImage] = useState<AdImageResponse | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null);
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', price: '', currency: 'USD', description: '', emoji: '' });

  const handleAdd = async () => {
    try {
      await createProduct.mutateAsync({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price) || 0,
        currency: form.currency,
        description: form.description || undefined,
        emoji: form.emoji || undefined,
      });
      toast.success('Product added!');
      setShowAdd(false);
      setForm({ name: '', category: '', price: '', currency: 'USD', description: '', emoji: '' });
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

  const handleGenerateAdConcepts = async (product: any) => {
    setSelectedProduct(product);
    setShowAdModal(true);
    setIsGeneratingConcepts(true);
    setAdConcepts([]);
    setGeneratedImage(null);
    setSelectedConcept(null);
    try {
      const res = await api.post<AdConcept[]>('/ai/generate-ad-concepts', {
        productName: product.name,
        category: product.category,
        description: product.description || '',
        imageUrl: product.images?.[0] || product.imageUrl,
      });
      setAdConcepts(res.data);
    } catch {
      toast.error('Failed to generate ad concepts');
    } finally {
      setIsGeneratingConcepts(false);
    }
  };

  const handleGenerateImage = async (concept: AdConcept, index: number) => {
    setSelectedConcept(index);
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const res = await api.post<AdImageResponse>('/ai/generate-ad-image', {
        prompt: concept.prompt,
        width: 1024,
        height: 1024,
      });
      setGeneratedImage(res.data);
      toast.success('Image generated!');
    } catch {
      toast.error('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${name.replace(/\s+/g, '_')}_ad.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <div className="w-full h-40 bg-white/10 rounded-2xl mb-6" />
              <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
            </div>
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="glass p-6 sm:p-7 rounded-[2.5rem] border border-white/10 hover:border-[#7c3aed]/40 transition-colors relative group">
              {/* Product Image */}
              <div className="w-full h-40 rounded-2xl mb-6 overflow-hidden bg-white/5 flex items-center justify-center">
                {product.images?.[0] || product.imageUrl ? (
                  <img src={product.images?.[0] || product.imageUrl || ''} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-5xl sm:text-6xl opacity-80">{product.emoji || '📦'}</div>
                )}
              </div>

              <div className="font-semibold text-xl tracking-tight">{product.name}</div>
              <div className="text-white/50 text-sm mt-1">{product.category}</div>

              <div className="flex justify-between items-end mt-6">
                <div className="font-mono text-xl font-semibold">
                  {currencySymbols[product.currency] || '$'}{Number(product.price || 0).toFixed(2)}
                  <span className="text-xs text-white/40 ml-1">{product.currency}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleGenerateAdConcepts(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] text-xs font-medium hover:bg-[#7c3aed]/25 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate AI Ad
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price" type="number" className="w-full" />
                </div>
                <div>
                  <CustomDropdown options={currencyOptions} value={form.currency} onChange={v => setForm({...form, currency: v})} />
                </div>
              </div>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (optional)" className="w-full h-20" />
              <input value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} placeholder="Emoji fallback (e.g. 🧴)" className="w-full" />
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

      {/* AI Ad Generator Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6" onClick={() => setShowAdModal(false)}>
          <div className="glass p-6 sm:p-8 rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">AI AD GENERATOR</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">{selectedProduct?.name}</div>
              </div>
              <button onClick={() => setShowAdModal(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isGeneratingConcepts ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin mb-4" />
                <div className="text-white/50">Analyzing product and generating ad concepts...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adConcepts.map((concept, index) => (
                  <div
                    key={index}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      selectedConcept === index
                        ? 'border-[#7c3aed] bg-[#7c3aed]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                    onClick={() => handleGenerateImage(concept, index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{concept.name}</div>
                      {selectedConcept === index && isGeneratingImage && (
                        <Loader2 className="w-4 h-4 text-[#7c3aed] animate-spin" />
                      )}
                    </div>
                    <div className="text-white/50 text-sm">{concept.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Generated Image Preview */}
            {generatedImage && (
              <div className="mt-6 p-5 rounded-2xl border border-[#7c3aed]/40 bg-[#7c3aed]/5">
                <div className="font-mono text-xs text-white/50 mb-3">GENERATED IMAGE</div>
                <img
                  src={generatedImage.imageUrl}
                  alt="Generated ad"
                  className="w-full max-h-96 object-contain rounded-xl mb-4"
                  loading="lazy"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownloadImage(generatedImage.imageUrl, selectedProduct?.name || 'ad')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 hover:bg-white/5 text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={() => handleGenerateImage(adConcepts[selectedConcept!], selectedConcept!)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] text-sm font-medium hover:bg-[#7c3aed]/25 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" /> Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
