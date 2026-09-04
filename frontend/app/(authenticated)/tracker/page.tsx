'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Layers, TrendingUp, DollarSign, Wallet, PiggyBank, AlertTriangle,
  XCircle, Search, Download, Plus, Loader2, X, RefreshCw, BarChart3,
  ShoppingCart, ArrowUpDown, Grid3X3, List, Activity, ChevronDown,
} from 'lucide-react';
import { trackerApi, type TrackerProduct, type TrackerDashboard, type Sale, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';
import { getUploadUrl } from '@/lib/api';

const statusFilters = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Best Sellers', 'Slow Moving'];
const sortOptions = ['Name', 'Stock', 'Sales', 'Revenue', 'Profit'];
const dateRanges = ['Today', 'This Week', 'This Month', 'This Year'];

export default function TrackerPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<TrackerDashboard | null>(null);
  const [products, setProducts] = useState<TrackerProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<TrackerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TrackerProduct | null>(null);
  const [saleForm, setSaleForm] = useState({ quantity: '1', unitPrice: '', customerName: '', notes: '' });
  const [stockForm, setStockForm] = useState({ quantity: '', notes: '', purchasePrice: '' });
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashRes, prodRes] = await Promise.all([
        trackerApi.dashboard(),
        trackerApi.list(),
      ]);
      setDashboard(dashRes.data);
      setProducts(prodRes.data);
      setFilteredProducts(prodRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tracker data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    let result = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.product.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.product.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'Best Sellers') {
        result.sort((a, b) => b.totalSold - a.totalSold);
        result = result.slice(0, 10);
      } else if (statusFilter === 'Slow Moving') {
        result = result.filter(p => p.totalSold < 5);
      } else {
        const statusMap: Record<string, string> = {
          'In Stock': 'in_stock',
          'Low Stock': 'low_stock',
          'Out of Stock': 'out_of_stock',
        };
        result = result.filter(p => p.status === statusMap[statusFilter]);
      }
    }
    if (sortBy === 'Stock') result.sort((a, b) => b.currentStock - a.currentStock);
    else if (sortBy === 'Sales') result.sort((a, b) => b.totalSold - a.totalSold);
    else if (sortBy === 'Revenue') result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    else if (sortBy === 'Profit') result.sort((a, b) => b.profit - a.profit);
    else result.sort((a, b) => a.product.name.localeCompare(b.product.name));
    setFilteredProducts(result);
  }, [products, searchQuery, statusFilter, sortBy]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await trackerApi.sync();
      const count = res.data.length;
      toast.success(`Synced ${count} product${count !== 1 ? 's' : ''}`);
      loadData();
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleRecordSale = async () => {
    if (!selectedProduct || !saleForm.quantity) return;
    setSubmitting(true);
    try {
      await trackerApi.recordSale({
        trackerProductId: selectedProduct.id,
        quantity: parseInt(saleForm.quantity),
        unitPrice: parseFloat(saleForm.unitPrice) || selectedProduct.sellingPrice || 0,
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
    if (!selectedProduct || !stockForm.quantity) return;
    setSubmitting(true);
    try {
      await trackerApi.addStock({
        trackerProductId: selectedProduct.id,
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

  const handleExportCsv = async () => {
    try {
      const res = await trackerApi.exportCsv();
      const blob = new Blob([res.data as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
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

  const statCards = dashboard ? [
    { label: 'TOTAL PRODUCTS', value: dashboard.totalProducts, icon: Package, color: 'text-[#7c3aed]' },
    { label: 'TOTAL STOCK', value: dashboard.totalStock, icon: Layers, color: 'text-[#ec4899]' },
    { label: 'UNITS SOLD', value: dashboard.totalUnitsSold, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'SALES REVENUE', value: formatCurrency(dashboard.totalSalesRevenue), icon: DollarSign, color: 'text-[#7c3aed]' },
    { label: 'INVENTORY VALUE', value: formatCurrency(dashboard.totalInventoryValue), icon: Wallet, color: 'text-[#ec4899]' },
    { label: 'EST. PROFIT', value: formatCurrency(dashboard.estimatedProfit), icon: PiggyBank, color: 'text-emerald-400' },
    { label: 'LOW STOCK', value: dashboard.lowStockItems, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'OUT OF STOCK', value: dashboard.outOfStockItems, icon: XCircle, color: 'text-red-400' },
  ] : [];

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
        <div className="font-mono text-xs tracking-[3px] text-white/50">INVENTORY TRACKER</div>
        <div className="flex items-center gap-3">
          <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <button onClick={handleExportCsv} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Tracker</div>
      </div>

      {error && (
        <div className="mx-4 sm:mx-8 mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1 text-sm text-white/70">{error}</div>
          <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-xs text-white/70">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      <div className="px-4 sm:px-8 pb-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass p-4 rounded-2xl border border-white/10 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-16 mb-2" />
              <div className="h-6 bg-white/10 rounded w-12" />
            </div>
          ))
        ) : statCards.map((card, i) => (
          <div key={i} className="glass p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] font-mono tracking-[1.5px] text-white/50 leading-tight">{card.label}</div>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-xl sm:text-2xl font-semibold tracking-tight">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="px-4 sm:px-8 pb-6 glass mx-4 sm:mx-8 rounded-2xl border border-white/10 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm appearance-none cursor-pointer min-w-[140px]"
          >
            {statusFilters.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm appearance-none cursor-pointer min-w-[120px]"
          >
            {sortOptions.map(s => <option key={s} value={s}>Sort: {s}</option>)}
          </select>
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-[#7c3aed]/20 text-[#7c3aed]' : 'text-white/50 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-[#7c3aed]/20 text-[#7c3aed]' : 'text-white/50 hover:text-white'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedProduct(null); setShowSaleModal(true); }}
              className="neon-button flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4" /> <span className="hidden sm:inline">Record Sale</span>
            </button>
            <button
              onClick={() => { setSelectedProduct(null); setShowStockModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Stock</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-12 pt-6">
        {isLoading ? (
          viewMode === 'list' ? (
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="h-4 bg-white/10 rounded w-48 animate-pulse" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-white/5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-20" />
                    </div>
                    <div className="h-6 w-16 bg-white/10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass p-5 rounded-2xl border border-white/10 animate-pulse">
                  <div className="w-full h-32 bg-white/10 rounded-xl mb-4" />
                  <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                </div>
              ))}
            </div>
          )
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-white/50">
            <div className="text-4xl mb-3">📦</div>
            {products.length === 0 ? 'No tracked products. Click Sync to import from Products.' : 'No products match your filters.'}
          </div>
        ) : viewMode === 'list' ? (
          <div className="glass rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">PRODUCT</th>
                  <th className="text-left p-4 font-mono text-[10px] tracking-[1.5px] text-white/50 hidden md:table-cell">SKU</th>
                  <th className="text-left p-4 font-mono text-[10px] tracking-[1.5px] text-white/50 hidden lg:table-cell">CATEGORY</th>
                  <th className="text-right p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">STOCK</th>
                  <th className="text-right p-4 font-mono text-[10px] tracking-[1.5px] text-white/50 hidden sm:table-cell">SOLD</th>
                  <th className="text-right p-4 font-mono text-[10px] tracking-[1.5px] text-white/50 hidden lg:table-cell">REVENUE</th>
                  <th className="text-right p-4 font-mono text-[10px] tracking-[1.5px] text-white/50 hidden lg:table-cell">PROFIT</th>
                  <th className="text-center p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">STATUS</th>
                  <th className="text-center p-4 font-mono text-[10px] tracking-[1.5px] text-white/50">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((tp) => (
                  <tr
                    key={tp.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => router.push(`/tracker/${tp.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                          {tp.product.images?.[0] || tp.product.imageUrl ? (
                            <img src={getUploadUrl(tp.product.images?.[0] || tp.product.imageUrl || '')} alt={tp.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-lg">{tp.product.emoji || '📦'}</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{tp.product.name}</div>
                          <div className="text-xs text-white/40">{tp.product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white/50 hidden md:table-cell font-mono text-xs">{tp.sku || '—'}</td>
                    <td className="p-4 text-white/50 hidden lg:table-cell">{tp.product.category}</td>
                    <td className="p-4 text-right font-medium">{tp.currentStock}</td>
                    <td className="p-4 text-right text-white/60 hidden sm:table-cell">{tp.totalSold}</td>
                    <td className="p-4 text-right text-white/60 hidden lg:table-cell">{formatCurrency(tp.totalRevenue, tp.currency)}</td>
                    <td className={`p-4 text-right hidden lg:table-cell font-medium ${tp.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(tp.profit, tp.currency)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(tp.status)}`}>
                        {getStatusLabel(tp.status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { setSelectedProduct(tp); setSaleForm({ ...saleForm, unitPrice: String(tp.sellingPrice || '') }); setShowSaleModal(true); }}
                          className="p-2 rounded-lg hover:bg-[#7c3aed]/15 text-[#7c3aed] transition-colors"
                          title="Record Sale"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedProduct(tp); setShowStockModal(true); }}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/50 transition-colors"
                          title="Add Stock"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((tp) => (
              <div
                key={tp.id}
                className="glass p-5 rounded-2xl border border-white/10 hover:border-[#7c3aed]/40 transition-colors cursor-pointer"
                onClick={() => router.push(`/tracker/${tp.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                    {tp.product.images?.[0] || tp.product.imageUrl ? (
                      <img src={getUploadUrl(tp.product.images?.[0] || tp.product.imageUrl || '')} alt={tp.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-2xl">{tp.product.emoji || '📦'}</div>
                    )}
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(tp.status)}`}>
                    {getStatusLabel(tp.status)}
                  </span>
                </div>
                <div className="font-semibold text-lg mb-1">{tp.product.name}</div>
                <div className="text-xs text-white/40 mb-4">{tp.product.category}{tp.sku ? ` • ${tp.sku}` : ''}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="text-[10px] font-mono text-white/40">STOCK</div>
                    <div className="text-lg font-semibold">{tp.currentStock}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="text-[10px] font-mono text-white/40">SOLD</div>
                    <div className="text-lg font-semibold">{tp.totalSold}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="text-[10px] font-mono text-white/40">REVENUE</div>
                    <div className="text-lg font-semibold">{formatCurrency(tp.totalRevenue, tp.currency)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="text-[10px] font-mono text-white/40">PROFIT</div>
                    <div className={`text-lg font-semibold ${tp.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(tp.profit, tp.currency)}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setSelectedProduct(tp); setSaleForm({ ...saleForm, unitPrice: String(tp.sellingPrice || '') }); setShowSaleModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] text-xs font-medium hover:bg-[#7c3aed]/25 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Sale
                  </button>
                  <button
                    onClick={() => { setSelectedProduct(tp); setShowStockModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 text-white/60 text-xs font-medium hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSaleModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowSaleModal(false)}>
          <div className="bg-[#0c0c0c] p-6 sm:p-8 rounded-[2rem] max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">RECORD SALE</div>
                <div className="text-2xl font-semibold tracking-tight mt-1">{selectedProduct?.product.name || 'Select Product'}</div>
              </div>
              <button onClick={() => setShowSaleModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {!selectedProduct && (
                <select
                  value=""
                  onChange={e => {
                    const tp = products.find(p => p.id === e.target.value);
                    if (tp) { setSelectedProduct(tp); setSaleForm({ ...saleForm, unitPrice: String(tp.sellingPrice || '') }); }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.product.name} (Stock: {p.currentStock})</option>
                  ))}
                </select>
              )}
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
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">UNIT PRICE</label>
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
                disabled={submitting || !selectedProduct || !saleForm.quantity}
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
                <div className="text-2xl font-semibold tracking-tight mt-1">{selectedProduct?.product.name || 'Select Product'}</div>
              </div>
              <button onClick={() => setShowStockModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {!selectedProduct && (
                <select
                  value=""
                  onChange={e => {
                    const tp = products.find(p => p.id === e.target.value);
                    if (tp) setSelectedProduct(tp);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors text-sm"
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.product.name}</option>
                  ))}
                </select>
              )}
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
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PURCHASE PRICE</label>
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
                disabled={submitting || !selectedProduct || !stockForm.quantity}
                className="neon-button flex-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
