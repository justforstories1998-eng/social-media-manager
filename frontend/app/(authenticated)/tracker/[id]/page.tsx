'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Package, TrendingUp, DollarSign, Percent, ShoppingCart,
  Plus, Loader2, X, RefreshCw, AlertTriangle, Edit3,
} from 'lucide-react';
import { trackerApi, type TrackerProduct, type Sale, type StockMovement } from '@/lib/api';
import { getUploadUrl } from '@/lib/api';
import { toast } from 'sonner';

export default function TrackerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<TrackerProduct | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saleForm, setSaleForm] = useState({ quantity: '1', unitPrice: '', customerName: '', notes: '' });
  const [stockForm, setStockForm] = useState({ quantity: '', notes: '', purchasePrice: '' });
  const [editForm, setEditForm] = useState({ sellingPrice: '', lowStockThreshold: '', supplierName: '', notes: '' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prodRes, salesRes, stockRes] = await Promise.all([
        trackerApi.getOne(id),
        trackerApi.getSales(id),
        trackerApi.getStockHistory(id),
      ]);
      setProduct(prodRes.data);
      setSales(salesRes.data);
      setStockHistory(stockRes.data);
      setEditForm({
        sellingPrice: String(prodRes.data.sellingPrice || ''),
        lowStockThreshold: String(prodRes.data.lowStockThreshold || 10),
        supplierName: prodRes.data.supplierName || '',
        notes: prodRes.data.notes || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product data');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRecordSale = async () => {
    if (!product || !saleForm.quantity) return;
    setSubmitting(true);
    try {
      await trackerApi.recordSale({
        trackerProductId: product.id,
        quantity: parseInt(saleForm.quantity),
        unitPrice: parseFloat(saleForm.unitPrice) || product.sellingPrice || 0,
        customerName: saleForm.customerName || undefined,
        notes: saleForm.notes || undefined,
      });
      toast.success('Sale recorded!');
      setShowSaleModal(false);
      setSaleForm({ quantity: '1', unitPrice: '', customerName: '', notes: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStock = async () => {
    if (!product || !stockForm.quantity) return;
    setSubmitting(true);
    try {
      await trackerApi.addStock({
        trackerProductId: product.id,
        quantity: parseInt(stockForm.quantity),
        notes: stockForm.notes || undefined,
        purchasePrice: parseFloat(stockForm.purchasePrice) || undefined,
      });
      toast.success('Stock added!');
      setShowStockModal(false);
      setStockForm({ quantity: '', notes: '', purchasePrice: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!product) return;
    setSubmitting(true);
    try {
      await trackerApi.update(product.id, {
        sellingPrice: parseFloat(editForm.sellingPrice) || undefined,
        lowStockThreshold: parseInt(editForm.lowStockThreshold) || 10,
        supplierName: editForm.supplierName || undefined,
        notes: editForm.notes || undefined,
      } as any);
      toast.success('Settings updated!');
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'low_stock': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'out_of_stock': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-white/50 bg-white/5 border-white/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return status;
    }
  };

  const profitMargin = product && product.totalRevenue > 0
    ? ((product.profit / product.totalRevenue) * 100).toFixed(1)
    : '0.0';

  if (isLoading) {
    return (
      <div className="floating-shell mx-auto ring-1 ring-white/10">
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin mb-4" />
          <div className="text-white/50">Loading product data...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="floating-shell mx-auto ring-1 ring-white/10">
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <AlertTriangle className="w-8 h-8 text-red-400 mb-4" />
          <div className="text-white/70 mb-2">{error || 'Product not found'}</div>
          <button onClick={() => router.push('/tracker')} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm text-white/70">
            <ArrowLeft className="w-4 h-4" /> Back to Tracker
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
        <button onClick={() => router.push('/tracker')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Tracker
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm">
            <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Edit</span>
          </button>
          <button onClick={() => { setSaleForm({ ...saleForm, unitPrice: String(product.sellingPrice || '') }); setShowSaleModal(true); }} className="neon-button flex items-center gap-2 text-sm">
            <ShoppingCart className="w-4 h-4" /> <span className="hidden sm:inline">Record Sale</span>
          </button>
          <button onClick={() => setShowStockModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Stock</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 pt-8 pb-6 flex flex-col sm:flex-row items-start gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
          {product.product.images?.[0] || product.product.imageUrl ? (
            <img src={getUploadUrl(product.product.images?.[0] || product.product.imageUrl || '')} alt={product.product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-4xl">{product.product.emoji || '📦'}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl sm:text-4xl font-semibold tracking-[-1px]">{product.product.name}</div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
              {getStatusLabel(product.status)}
            </span>
          </div>
          <div className="text-white/50 text-sm">{product.product.category}{product.sku ? ` • SKU: ${product.sku}` : ''}</div>
          {product.supplierName && <div className="text-white/40 text-xs mt-1">Supplier: {product.supplierName}</div>}
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'CURRENT STOCK', value: product.currentStock, color: product.status === 'out_of_stock' ? 'text-red-400' : '' },
          { label: 'UNITS SOLD', value: product.totalSold, color: '' },
          { label: 'TOTAL REVENUE', value: `$${product.totalRevenue.toLocaleString()}`, color: '' },
          { label: 'TOTAL COST', value: `$${product.totalCost.toLocaleString()}`, color: '' },
          { label: 'PROFIT', value: `$${product.profit.toLocaleString()}`, color: product.profit >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'PROFIT MARGIN', value: `${profitMargin}%`, color: parseFloat(profitMargin) >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="glass p-4 rounded-2xl border border-white/10">
            <div className="text-[10px] font-mono tracking-[1.5px] text-white/50 mb-2">{stat.label}</div>
            <div className={`text-xl sm:text-2xl font-semibold tracking-tight ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="px-4 sm:px-8 pb-8">
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <div className="font-mono text-xs tracking-[2px] text-white/50">SALES HISTORY</div>
          </div>
          {sales.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">No sales recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">DATE</th>
                    <th className="text-right p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">QTY</th>
                    <th className="text-right p-4 font-mono text-[10px] tracking-[1.5px] text-white/50 hidden sm:table-cell">UNIT PRICE</th>
                    <th className="text-right p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">TOTAL</th>
                    <th className="text-left p-4 font-mono text-[10px] tracking-[1.5px] text-white/50 hidden md:table-cell">CUSTOMER</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-white/60">{new Date(sale.saleDate).toLocaleDateString()}</td>
                      <td className="p-4 text-right font-medium">{sale.quantity}</td>
                      <td className="p-4 text-right text-white/60 hidden sm:table-cell">${sale.unitPrice.toFixed(2)}</td>
                      <td className="p-4 text-right font-medium">${sale.totalPrice.toLocaleString()}</td>
                      <td className="p-4 text-white/50 hidden md:table-cell">{sale.customerName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-12">
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <div className="font-mono text-xs tracking-[2px] text-white/50">STOCK MOVEMENTS</div>
          </div>
          {stockHistory.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">No stock movements recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">DATE</th>
                    <th className="text-left p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">TYPE</th>
                    <th className="text-right p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">QUANTITY</th>
                    <th className="text-left p-4 font-mono text-[10px] tracking-[1.5px] text-white/50 hidden md:table-cell">NOTES</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map((movement) => (
                    <tr key={movement.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-white/60">{new Date(movement.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                          movement.type === 'sale' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        }`}>
                          {movement.type === 'sale' ? 'Sale' : 'Added'}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-medium ${movement.type === 'sale' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {movement.type === 'sale' ? '-' : '+'}{movement.quantity}
                      </td>
                      <td className="p-4 text-white/50 hidden md:table-cell">{movement.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showSaleModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowSaleModal(false)}>
          <div className="bg-[#0c0c0c] p-6 sm:p-8 rounded-[2rem] max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">RECORD SALE</div>
                <div className="text-2xl font-semibold tracking-tight mt-1">{product.product.name}</div>
              </div>
              <button onClick={() => setShowSaleModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">QUANTITY</label>
                <input
                  value={saleForm.quantity}
                  onChange={e => setSaleForm({ ...saleForm, quantity: e.target.value })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">UNIT PRICE ($)</label>
                <input
                  value={saleForm.unitPrice}
                  onChange={e => setSaleForm({ ...saleForm, unitPrice: e.target.value })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">CUSTOMER NAME</label>
                <input
                  value={saleForm.customerName}
                  onChange={e => setSaleForm({ ...saleForm, customerName: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">NOTES</label>
                <textarea
                  value={saleForm.notes}
                  onChange={e => setSaleForm({ ...saleForm, notes: e.target.value })}
                  placeholder="Optional"
                  className="w-full h-20 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowSaleModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleRecordSale}
                disabled={submitting || !saleForm.quantity}
                className="neon-button flex-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Record Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStockModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowStockModal(false)}>
          <div className="bg-[#0c0c0c] p-6 sm:p-8 rounded-[2rem] max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">ADD STOCK</div>
                <div className="text-2xl font-semibold tracking-tight mt-1">{product.product.name}</div>
              </div>
              <button onClick={() => setShowStockModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">QUANTITY</label>
                <input
                  value={stockForm.quantity}
                  onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PURCHASE PRICE ($)</label>
                <input
                  value={stockForm.purchasePrice}
                  onChange={e => setStockForm({ ...stockForm, purchasePrice: e.target.value })}
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">NOTES</label>
                <textarea
                  value={stockForm.notes}
                  onChange={e => setStockForm({ ...stockForm, notes: e.target.value })}
                  placeholder="Optional"
                  className="w-full h-20 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowStockModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleAddStock}
                disabled={submitting || !stockForm.quantity}
                className="neon-button flex-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowEditModal(false)}>
          <div className="bg-[#0c0c0c] p-6 sm:p-8 rounded-[2rem] max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">TRACKER SETTINGS</div>
                <div className="text-2xl font-semibold tracking-tight mt-1">{product.product.name}</div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">SELLING PRICE ($)</label>
                <input
                  value={editForm.sellingPrice}
                  onChange={e => setEditForm({ ...editForm, sellingPrice: e.target.value })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">LOW STOCK THRESHOLD</label>
                <input
                  value={editForm.lowStockThreshold}
                  onChange={e => setEditForm({ ...editForm, lowStockThreshold: e.target.value })}
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">SUPPLIER NAME</label>
                <input
                  value={editForm.supplierName}
                  onChange={e => setEditForm({ ...editForm, supplierName: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">NOTES</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Optional"
                  className="w-full h-20 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button onClick={handleUpdateSettings} disabled={submitting} className="neon-button flex-1">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
