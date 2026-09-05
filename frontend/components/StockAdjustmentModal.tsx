'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { trackerApi, type TrackerProduct, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: TrackerProduct | null;
  products: TrackerProduct[];
  onAdjusted: () => void;
  preselectedProductId?: string;
}

export default function StockAdjustmentModal({ isOpen, onClose, product, products, onAdjusted, preselectedProductId }: StockAdjustmentModalProps) {
  const [selectedId, setSelectedId] = useState(preselectedProductId || product?.id || '');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentProduct = product || products.find(p => p.id === selectedId);
  const currentStock = currentProduct?.currentStock ?? 0;
  const adjustValue = parseInt(quantity) || 0;
  const newStock = currentStock + adjustValue;
  const isNegative = newStock < 0;

  const filteredProducts = products.filter(p =>
    p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = async () => {
    if (!selectedId || adjustValue === 0) return;
    setSubmitting(true);
    try {
      await trackerApi.adjustStock({ trackerProductId: selectedId, quantity: adjustValue, notes: notes || undefined });
      toast.success('Stock adjusted successfully');
      onAdjusted();
      onClose();
      setQuantity('');
      setNotes('');
      setSearchQuery('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0c0c0c] border border-white/10 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Adjust Stock</h3>
              <p className="text-sm text-white/50">{currentProduct?.product.name || 'Select product'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all"><X className="w-5 h-5 text-white/50" /></button>
        </div>

        {!product && (
          <div className="mb-4 relative">
            <label className="block text-xs font-medium text-white/50 mb-1.5">Product</label>
            <input
              type="text"
              value={showSearch ? searchQuery : currentProduct?.product.name || ''}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              placeholder="Search products..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#7c3aed]/50 focus:outline-none"
            />
            {showSearch && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[#0c0c0c] border border-white/10 rounded-lg max-h-48 overflow-y-auto">
                {filteredProducts.map(p => (
                  <button key={p.id} onClick={() => { setSelectedId(p.id); setShowSearch(false); setSearchQuery(''); }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2">
                    <span className="text-white/50 text-xs">Stock: {p.currentStock}</span>
                    <span>{p.product.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentProduct && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Current Stock</span>
              <span className="text-white font-medium">{currentStock}</span>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Adjustment Amount</label>
            <div className="flex gap-2">
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                placeholder="+ to add, - to remove" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#7c3aed]/50 focus:outline-none" />
            </div>
            {quantity && (
              <div className={`mt-1 text-xs ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
                New stock: {newStock} {isNegative && '( Cannot go below 0 )'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Reason for adjustment..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#7c3aed]/50 focus:outline-none resize-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={!selectedId || adjustValue === 0 || isNegative || submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500/80 text-white text-sm font-medium hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adjusting...</> : 'Adjust Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
