'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, TrendingUp, DollarSign, ShoppingCart, Layers, AlertTriangle, Edit, Plus, Loader2, X, Trash2 } from 'lucide-react';
import { api, getUploadUrl, formatCurrency, type TrackerProduct, type Sale, type StockMovement } from '@/lib/api';
import { toast } from 'sonner';

export default function TrackerProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<TrackerProduct | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sales' | 'stock'>('sales');

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [saleForm, setSaleForm] = useState({ quantity: 1, unitPrice: 0, customerName: '', notes: '' });
  const [stockForm, setStockForm] = useState({ quantity: 0, notes: '', purchasePrice: 0 });
  const [editForm, setEditForm] = useState({ sellingPrice: 0, purchasePrice: 0, lowStockThreshold: 10, supplierName: '', supplierContact: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [prodRes, salesRes, stockRes] = await Promise.all([
        api.get<TrackerProduct>(`/tracker/${id}`),
        api.get<Sale[]>(`/tracker/${id}/sales`),
        api.get<StockMovement[]>(`/tracker/${id}/stock`),
      ]);
      setProduct(prodRes.data);
      setSales(salesRes.data);
      setStockHistory(stockRes.data);
      setEditForm({
        sellingPrice: prodRes.data.sellingPrice || 0,
        purchasePrice: prodRes.data.purchasePrice || 0,
        lowStockThreshold: prodRes.data.lowStockThreshold || 10,
        supplierName: prodRes.data.supplierName || '',
        supplierContact: prodRes.data.supplierContact || '',
        notes: prodRes.data.notes || '',
      });
    } catch (err) {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRecordSale = async () => {
    if (!product || submitting) return;
    setSubmitting(true);
    try {
      await api.post('/tracker/sale', {
        trackerProductId: product.id,
        quantity: saleForm.quantity,
        unitPrice: saleForm.unitPrice || product.sellingPrice || 0,
        customerName: saleForm.customerName || undefined,
        notes: saleForm.notes || undefined,
      });
      toast.success('Sale recorded!');
      setShowSaleModal(false);
      setSaleForm({ quantity: 1, unitPrice: 0, customerName: '', notes: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStock = async () => {
    if (!product || submitting) return;
    setSubmitting(true);
    try {
      await api.post('/tracker/stock', {
        trackerProductId: product.id,
        type: 'restock',
        quantity: stockForm.quantity,
        notes: stockForm.notes || undefined,
        purchasePrice: stockForm.purchasePrice || undefined,
      });
      toast.success('Stock added!');
      setShowStockModal(false);
      setStockForm({ quantity: 0, notes: '', purchasePrice: 0 });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSettings = async () => {
    if (!product || submitting) return;
    setSubmitting(true);
    try {
      await api.put(`/tracker/${product.id}`, editForm);
      toast.success('Settings updated!');
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!product || submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/tracker/${product.id}/archive`);
      toast.success('Product archived');
      window.location.href = '/tracker';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to archive');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <div className="text-white/50 text-lg">Product not found</div>
        <Link href="/tracker" className="text-[#7c3aed] text-sm mt-4 inline-block hover:underline">Back to Tracker</Link>
      </div>
    );
  }

  const p = product;
  const cur = p.currency || 'USD';
  const profit = p.profit || 0;
  const margin = p.totalRevenue > 0 ? ((profit / p.totalRevenue) * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Current Stock', value: String(p.currentStock), icon: Layers, color: p.currentStock <= 0 ? '#ef4444' : p.currentStock <= (p.lowStockThreshold || 10) ? '#f59e0b' : '#7c3aed' },
    { label: 'Units Sold', value: String(p.totalSold || 0), icon: ShoppingCart, color: '#ec4899' },
    { label: 'Revenue', value: formatCurrency(p.totalRevenue || 0, cur), icon: DollarSign, color: '#7c3aed' },
    { label: 'Total Cost', value: formatCurrency(p.totalCost || 0, cur), icon: TrendingUp, color: '#ec4899' },
    { label: 'Profit', value: formatCurrency(profit, cur), icon: DollarSign, color: profit >= 0 ? '#10b981' : '#ef4444' },
    { label: 'Margin', value: `${margin}%`, icon: TrendingUp, color: parseFloat(margin) >= 0 ? '#10b981' : '#ef4444' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/tracker" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Tracker
      </Link>

      <div className="glass p-6 sm:p-8 rounded-[2rem] border border-white/10 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white/5 shrink-0">
            {p.product?.images?.[0] ? (
              <img src={getUploadUrl(p.product.images[0])} alt={p.product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">{p.product?.emoji || '📦'}</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-semibold text-xl sm:text-2xl text-white tracking-tight">{p.product?.name || 'Unknown Product'}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-white/50">
                  {p.sku && <span className="px-2 py-0.5 rounded bg-white/5 text-xs">SKU: {p.sku}</span>}
                  {p.product?.category && <span className="px-2 py-0.5 rounded bg-white/5 text-xs">{p.product.category}</span>}
                  <span className="px-2 py-0.5 rounded bg-white/5 text-xs">{cur}</span>
                </div>
              </div>

              <span
                className="px-3 py-1 rounded-full text-xs font-medium shrink-0"
                style={{
                  background: p.status === 'in_stock' ? 'rgba(16,185,129,.15)' : p.status === 'low_stock' ? 'rgba(245,158,11,.15)' : 'rgba(239,68,68,.15)',
                  color: p.status === 'in_stock' ? '#10b981' : p.status === 'low_stock' ? '#f59e0b' : '#ef4444',
                }}
              >
                {p.status === 'in_stock' ? 'In Stock' : p.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="mt-4 text-sm text-white/50">
              <span>Selling: {formatCurrency(p.sellingPrice || 0, cur)}</span>
              <span className="mx-2">·</span>
              <span>Purchase: {formatCurrency(p.purchasePrice || 0, cur)}</span>
              {p.supplierName && <><span className="mx-2">·</span><span>Supplier: {p.supplierName}</span></>}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => { setSaleForm({ ...saleForm, unitPrice: p.sellingPrice || 0 }); setShowSaleModal(true); }}
                className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{ background: 'rgba(124,58,237,.15)', color: '#7c3aed' }}
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Record Sale
              </button>
              <button
                onClick={() => setShowStockModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{ background: 'rgba(16,185,129,.15)', color: '#10b981' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Stock
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)' }}
              >
                <Edit className="w-3.5 h-3.5" /> Settings
              </button>
              <button
                onClick={() => setShowArchiveConfirm(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Archive
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="glass p-4 rounded-2xl border border-white/10">
            <s.icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
            <div className="text-lg font-semibold text-white">{s.value}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,.04)' }}>
        {(['sales', 'stock'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: activeTab === tab ? 'rgba(124,58,237,.15)' : 'transparent',
              color: activeTab === tab ? '#7c3aed' : 'rgba(255,255,255,.5)',
            }}
          >
            {tab === 'sales' ? `Sales History (${sales.length})` : `Stock Movements (${stockHistory.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'sales' && (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {sales.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">No sales recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Date</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Qty</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Unit Price</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Total</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Customer</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/[.02]">
                      <td className="px-4 py-3 text-white/70">{new Date(s.saleDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-white/70">{s.quantity}</td>
                      <td className="px-4 py-3 text-white/70">{formatCurrency(Number(s.unitPrice), cur)}</td>
                      <td className="px-4 py-3 text-white font-medium">{formatCurrency(Number(s.totalPrice), cur)}</td>
                      <td className="px-4 py-3 text-white/50">{s.customerName || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: s.isReturn ? 'rgba(239,68,68,.15)' : 'rgba(124,58,237,.15)',
                            color: s.isReturn ? '#ef4444' : '#7c3aed',
                          }}
                        >
                          {s.isReturn ? 'Return' : 'Sale'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {stockHistory.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">No stock movements yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Date</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Type</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Quantity</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map((m) => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/[.02]">
                      <td className="px-4 py-3 text-white/70">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{
                            background: m.quantity > 0 ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
                            color: m.quantity > 0 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: m.quantity > 0 ? '#10b981' : '#ef4444' }}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </td>
                      <td className="px-4 py-3 text-white/50">{m.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)' }}>
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Record Sale — {p.product?.name}</h3>
              <button onClick={() => setShowSaleModal(false)} className="p-1 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Quantity</label>
                <input type="number" min={1} value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: parseInt(e.target.value) || 1 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Unit Price ({cur})</label>
                <input type="number" step={0.01} min={0} value={saleForm.unitPrice} onChange={(e) => setSaleForm({ ...saleForm, unitPrice: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Customer Name (optional)</label>
                <input type="text" value={saleForm.customerName} onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" placeholder="Customer name" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Notes (optional)</label>
                <input type="text" value={saleForm.notes} onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" placeholder="Notes" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowSaleModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleRecordSale} disabled={submitting || saleForm.quantity < 1} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Record Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)' }}>
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Add Stock — {p.product?.name}</h3>
              <button onClick={() => setShowStockModal(false)} className="p-1 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Quantity to Add</label>
                <input type="number" min={1} value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Purchase Price per Unit ({cur})</label>
                <input type="number" step={0.01} min={0} value={stockForm.purchasePrice} onChange={(e) => setStockForm({ ...stockForm, purchasePrice: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Notes (optional)</label>
                <input type="text" value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" placeholder="Notes" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowStockModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleAddStock} disabled={submitting || stockForm.quantity < 1} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Settings Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)' }}>
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Tracker Settings — {p.product?.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Selling Price ({cur})</label>
                  <input type="number" step={0.01} min={0} value={editForm.sellingPrice} onChange={(e) => setEditForm({ ...editForm, sellingPrice: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Purchase Price ({cur})</label>
                  <input type="number" step={0.01} min={0} value={editForm.purchasePrice} onChange={(e) => setEditForm({ ...editForm, purchasePrice: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Low Stock Threshold</label>
                <input type="number" min={0} value={editForm.lowStockThreshold} onChange={(e) => setEditForm({ ...editForm, lowStockThreshold: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Supplier Name</label>
                  <input type="text" value={editForm.supplierName} onChange={(e) => setEditForm({ ...editForm, supplierName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" placeholder="Supplier name" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Supplier Contact</label>
                  <input type="text" value={editForm.supplierContact} onChange={(e) => setEditForm({ ...editForm, supplierContact: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" placeholder="Phone or email" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Notes</label>
                <input type="text" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm" placeholder="Notes" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleEditSettings} disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)' }}>
          <div className="glass w-full max-w-sm p-6 rounded-2xl border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <div className="text-xl font-semibold mb-2">Archive Product</div>
            <div className="text-white/50 text-sm mb-1">Are you sure you want to archive</div>
            <div className="font-medium mb-4">&quot;{p.product?.name}&quot;?</div>
            <div className="text-white/40 text-xs mb-6">This will remove it from your tracker. You can re-add it later from Products.</div>
            <div className="flex gap-3">
              <button onClick={() => setShowArchiveConfirm(false)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button onClick={handleArchive} disabled={submitting} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium">
                {submitting ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
