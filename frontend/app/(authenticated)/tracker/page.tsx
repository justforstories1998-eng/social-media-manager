'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Layers, TrendingUp, DollarSign, Wallet, PiggyBank, AlertTriangle,
  XCircle, Search, Download, Plus, Loader2, X, RefreshCw, BarChart3,
  ShoppingCart, ArrowUpDown, Grid3X3, List, Activity, ChevronDown, Users,
  UserCheck, Repeat, ArrowLeftRight, CheckSquare, Square, Trash2, FileDown,
  Settings,
} from 'lucide-react';
import api, { trackerApi, type TrackerProduct, type TrackerDashboard, type Sale, formatCurrency, CURRENCY_OPTIONS, type FxRate, convertCurrency, updateDisplayCurrency } from '@/lib/api';
import { toast } from 'sonner';
import { getUploadUrl } from '@/lib/api';
import DateRangeFilter from '@/components/DateRangeFilter';
import StockAdjustmentModal from '@/components/StockAdjustmentModal';
import FxRatesModal from '@/components/FxRatesModal';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const statusFilters = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Best Sellers', 'Slow Moving'];
const sortOptions = ['Name', 'Stock', 'Sales', 'Revenue', 'Profit'];
const COLORS = ['#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

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
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TrackerProduct | null>(null);
  const [saleForm, setSaleForm] = useState({ quantity: '1', unitPrice: '', customerName: '', notes: '' });
  const [stockForm, setStockForm] = useState({ quantity: '', notes: '', purchasePrice: '' });
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkBar, setShowBulkBar] = useState(false);
  const [customers, setCustomers] = useState<any>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [fxRates, setFxRates] = useState<FxRate[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [showFxModal, setShowFxModal] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const [dashRes, prodRes] = await Promise.all([
        trackerApi.dashboard(Object.keys(params).length ? params : undefined),
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
  }, [dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    trackerApi.getFxRates().then(res => setFxRates(res.data)).catch(() => {});
    api.get('/users/me').then((res: any) => {
      const code = res.data?.displayCurrency || 'USD';
      setDisplayCurrency(code);
      localStorage.setItem('tracker-display-currency', code);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let result = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.product.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || (p.product.category && p.product.category.toLowerCase().includes(q)));
    }
    if (statusFilter !== 'All') {
      const statusMap: Record<string, string> = { 'In Stock': 'in_stock', 'Low Stock': 'low_stock', 'Out of Stock': 'out_of_stock' };
      if (statusMap[statusFilter]) {
        result = result.filter(p => p.status === statusMap[statusFilter]);
      } else if (statusFilter === 'Best Sellers') {
        result = [...result].sort((a, b) => b.totalSold - a.totalSold).slice(0, 10);
      } else if (statusFilter === 'Slow Moving') {
        result = result.filter(p => p.totalSold < 5);
      }
    }
    if (sortBy) {
      const sortMap: Record<string, string> = { Name: 'product.name', Stock: 'currentStock', Sales: 'totalSold', Revenue: 'totalRevenue', Profit: 'profit' };
      const key = sortMap[sortBy];
      if (key) {
        result.sort((a: any, b: any) => {
          const aVal = key.includes('.') ? key.split('.').reduce((o: any, k) => o?.[k], a) : a[key];
          const bVal = key.includes('.') ? key.split('.').reduce((o: any, k) => o?.[k], b) : b[key];
          if (typeof aVal === 'string') return aVal.localeCompare(bVal);
          return (aVal || 0) - (bVal || 0);
        });
      }
    }
    setFilteredProducts(result);
  }, [products, searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    setShowBulkBar(selectedIds.size > 0);
  }, [selectedIds]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await trackerApi.getCustomers();
      setCustomers(res.data);
    } catch {}
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  useEffect(() => {
    const data = filteredProducts.map(p => ({
      name: p.product.name.length > 12 ? p.product.name.substring(0, 12) + '...' : p.product.name,
      revenue: convertCurrency(p.totalRevenue, p.currency, displayCurrency, fxRates),
      profit: convertCurrency(p.profit, p.currency, displayCurrency, fxRates),
      sold: p.totalSold,
      stock: p.currentStock,
      margin: p.totalRevenue > 0 ? ((p.profit / p.totalRevenue) * 100) : 0,
      cost: convertCurrency(p.totalCost, p.currency, displayCurrency, fxRates),
    }));
    setChartData(data);
  }, [filteredProducts, displayCurrency, fxRates]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleExportSelected = async () => {
    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (selectedIds.size > 0) params.trackerProductIds = Array.from(selectedIds).join(',');
    try {
      const res = await trackerApi.exportCsv(params);
      const blob = new Blob([res.data as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
  };

  const handleBulkArchive = async () => {
    if (!confirm(`Archive ${selectedIds.size} products?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => trackerApi.archive(id)));
      toast.success(`${selectedIds.size} products archived`);
      setSelectedIds(new Set());
      loadData();
    } catch { toast.error('Failed to archive products'); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await trackerApi.sync();
      setProducts(res.data);
      setFilteredProducts(res.data);
      toast.success(`Synced ${res.data.length} products`);
    } catch { toast.error('Sync failed'); }
    finally { setSyncing(false); }
  };

  const handleRecordSale = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await trackerApi.recordSale({
        trackerProductId: selectedProduct.id,
        quantity: parseInt(saleForm.quantity),
        unitPrice: parseFloat(saleForm.unitPrice),
        customerName: saleForm.customerName || undefined,
        notes: saleForm.notes || undefined,
      });
      toast.success('Sale recorded');
      setShowSaleModal(false);
      setSaleForm({ quantity: '1', unitPrice: '', customerName: '', notes: '' });
      loadData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to record sale'); }
    finally { setSubmitting(false); }
  };

  const handleAddStock = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await trackerApi.addStock({
        trackerProductId: selectedProduct.id,
        type: 'restock',
        quantity: parseInt(stockForm.quantity),
        notes: stockForm.notes || undefined,
        purchasePrice: stockForm.purchasePrice ? parseFloat(stockForm.purchasePrice) : undefined,
      });
      toast.success('Stock added');
      setShowStockModal(false);
      setStockForm({ quantity: '', notes: '', purchasePrice: '' });
      loadData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to add stock'); }
    finally { setSubmitting(false); }
  };

  const lowStockProducts = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');
  const reorderProducts = products.filter(p => p.currentStock <= p.lowStockThreshold && p.currentStock > 0);

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-[#7c3aed] mx-auto mb-4" /><p className="text-white/50 text-sm">Loading tracker...</p></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={loadData} className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-white/30 tracking-[0.2em] mb-1">INVENTORY TRACKER</p>
          <h1 className="text-3xl font-bold text-white">Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={displayCurrency} onChange={e => {
            const v = e.target.value;
            setDisplayCurrency(v);
            localStorage.setItem('tracker-display-currency', v);
            updateDisplayCurrency(v).catch(() => {});
          }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
            {CURRENCY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button onClick={() => setShowFxModal(true)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 border border-white/10 transition-all" title="Edit FX Rates">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 text-sm border border-white/10 transition-all disabled:opacity-50">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync
          </button>
          <button onClick={handleExportSelected}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 text-sm border border-white/10 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => { setSelectedProduct(null); setShowAdjustModal(true); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm border border-amber-500/20 transition-all">
            <ArrowLeftRight className="w-4 h-4" /> Adjust
          </button>
          <button onClick={() => { setSelectedProduct(null); setShowStockModal(true); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 text-sm border border-white/10 transition-all">
            <Plus className="w-4 h-4" /> Add Stock
          </button>
          <button onClick={() => { setSelectedProduct(null); setShowSaleModal(true); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#7c3aed] text-white text-sm hover:bg-[#6d28d9] transition-all">
            <ShoppingCart className="w-4 h-4" /> Record Sale
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'TOTAL PRODUCTS', value: dashboard.totalProducts, icon: Package, color: 'text-[#7c3aed]' },
            { label: 'TOTAL STOCK', value: dashboard.totalStock, icon: Layers, color: 'text-[#ec4899]' },
            { label: 'UNITS SOLD', value: dashboard.totalUnitsSold, icon: TrendingUp, color: 'text-green-400' },
            { label: 'SALES REVENUE', value: formatCurrency(convertCurrency(dashboard.totalSalesRevenue, 'USD', displayCurrency, fxRates)), icon: DollarSign, color: 'text-[#7c3aed]' },
            { label: 'INVENTORY VALUE', value: formatCurrency(convertCurrency(dashboard.totalInventoryValue, 'USD', displayCurrency, fxRates)), icon: Wallet, color: 'text-[#ec4899]' },
            { label: 'EST. PROFIT', value: formatCurrency(convertCurrency(dashboard.estimatedProfit, 'USD', displayCurrency, fxRates)), icon: PiggyBank, color: 'text-green-400' },
            { label: 'LOW STOCK', value: dashboard.lowStockItems, icon: AlertTriangle, color: 'text-amber-400' },
            { label: 'OUT OF STOCK', value: dashboard.outOfStockItems, icon: XCircle, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0c0c0c] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-white/30 tracking-wider">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
      {displayCurrency !== 'USD' && fxRates.length > 0 && (
        <p className="text-[10px] text-white/30 font-mono">shown in {displayCurrency}</p>
      )}

      {/* Date Range + Charts Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <DateRangeFilter dateFrom={dateFrom} dateTo={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} />
        <button onClick={() => setShowCharts(!showCharts)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs border border-white/10 transition-all">
          <BarChart3 className="w-3.5 h-3.5" /> {showCharts ? 'Hide' : 'Show'} Charts
        </button>
      </div>

      {/* Charts */}
      {showCharts && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/70 mb-4">Revenue by Product</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/70 mb-4">Profit by Product</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/70 mb-4">Profit Margin by Product</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} width={90} />
                <Tooltip contentStyle={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Bar dataKey="margin" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.margin >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/70 mb-4">Cost vs Revenue</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Bar dataKey="cost" fill="#ec4899" name="Cost" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="#7c3aed" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Reorder Alerts */}
      {reorderProducts.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Reorder Suggestions ({reorderProducts.length} products low)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs">
                  <th className="text-left pb-2 font-medium">Product</th>
                  <th className="text-right pb-2 font-medium">Stock</th>
                  <th className="text-right pb-2 font-medium">Threshold</th>
                  <th className="text-right pb-2 font-medium">Reorder Qty</th>
                  <th className="text-right pb-2 font-medium">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {reorderProducts.map(p => (
                  <tr key={p.id} className="border-t border-amber-500/10">
                    <td className="py-2 text-white/70">{p.product.name}</td>
                    <td className="py-2 text-right text-amber-400">{p.currentStock}</td>
                    <td className="py-2 text-right text-white/50">{p.lowStockThreshold}</td>
                    <td className="py-2 text-right text-white/70">{p.reorderQuantity || '-'}</td>
                    <td className="py-2 text-right text-white/50">{p.supplierName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Analytics */}
      {customers && customers.customers.length > 0 && (
        <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#7c3aed]" /> Customer Analytics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/40">Unique Customers</p>
              <p className="text-lg font-bold text-white">{customers.summary.uniqueCustomers}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/40">Repeat Rate</p>
              <p className="text-lg font-bold text-white">{customers.summary.repeatCustomerRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/40">Avg Order Value</p>
              <p className="text-lg font-bold text-white">{formatCurrency(convertCurrency(customers.summary.avgOrderValue, 'USD', displayCurrency, fxRates))}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/40">Total Revenue</p>
              <p className="text-lg font-bold text-white">{formatCurrency(convertCurrency(customers.summary.totalRevenue, 'USD', displayCurrency, fxRates))}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-xs text-white/40 mb-3">Top Customers</h4>
              <div className="space-y-2">
                {customers.customers.slice(0, 5).map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[10px] text-[#7c3aed] font-bold">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white/70">{c.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white/90 font-medium">{formatCurrency(convertCurrency(c.totalSpent, 'USD', displayCurrency, fxRates))}</span>
                      <span className="text-white/30 text-xs ml-2">{c.totalOrders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-xs text-white/40 mb-3">Sales by Customer</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={customers.customers.slice(0, 8).map((c: any) => ({ name: c.name.length > 10 ? c.name.substring(0, 10) + '...' : c.name, revenue: c.totalSpent }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:border-[#7c3aed]/50 focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          {statusFilters.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          {sortOptions.map(o => <option key={o} value={o}>Sort: {o}</option>)}
        </select>
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40'}`}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40'}`}><Grid3X3 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {showBulkBar && (
        <div className="flex items-center gap-3 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-xl p-3">
          <span className="text-sm text-[#7c3aed] font-medium">{selectedIds.size} selected</span>
          <button onClick={toggleSelectAll} className="text-xs text-white/50 hover:text-white/80">
            {selectedIds.size === filteredProducts.length ? 'Deselect All' : 'Select All'}
          </button>
          <div className="flex-1" />
          <button onClick={() => { setSelectedProduct(null); setShowSaleModal(true); }}
            className="px-3 py-1.5 rounded-lg bg-[#7c3aed] text-white text-xs hover:bg-[#6d28d9] transition-all">Bulk Sale</button>
          <button onClick={handleExportSelected}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs hover:bg-white/20 transition-all flex items-center gap-1"><FileDown className="w-3 h-3" /> Export</button>
          <button onClick={handleBulkArchive}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-all flex items-center gap-1"><Trash2 className="w-3 h-3" /> Archive</button>
          <button onClick={() => setSelectedIds(new Set())} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Product List */}
      {viewMode === 'list' ? (
        <div className="bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs border-b border-white/5">
                  <th className="w-10 p-3"><button onClick={toggleSelectAll}>
                    {selectedIds.size === filteredProducts.length && filteredProducts.length > 0
                      ? <CheckSquare className="w-4 h-4 text-[#7c3aed]" />
                      : <Square className="w-4 h-4" />}
                  </button></th>
                  <th className="text-left p-3 font-medium">PRODUCT</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">SKU</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">CATEGORY</th>
                  <th className="text-right p-3 font-medium">STOCK</th>
                  <th className="text-right p-3 font-medium hidden sm:table-cell">SOLD</th>
                  <th className="text-right p-3 font-medium hidden lg:table-cell">REVENUE</th>
                  <th className="text-right p-3 font-medium hidden lg:table-cell">PROFIT</th>
                  <th className="text-center p-3 font-medium">STATUS</th>
                  <th className="text-right p-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => router.push(`/tracker/${p.id}`)}>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(p.id)}>
                        {selectedIds.has(p.id) ? <CheckSquare className="w-4 h-4 text-[#7c3aed]" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p.product.images?.[0] ? (
                          <img src={getUploadUrl(p.product.images[0])} alt="" className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-lg">{p.product.emoji || '📦'}</div>
                        )}
                        <div>
                          <p className="text-white font-medium text-sm">{p.product.name}</p>
                          <p className="text-white/30 text-xs">{p.product.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-white/40 hidden md:table-cell">{p.sku || '-'}</td>
                    <td className="p-3 text-white/40 hidden lg:table-cell">{p.product.category || '-'}</td>
                    <td className="p-3 text-right text-white/70">{p.currentStock}</td>
                    <td className="p-3 text-right text-white/70 hidden sm:table-cell">{p.totalSold}</td>
                    <td className="p-3 text-right text-white/70 hidden lg:table-cell">{formatCurrency(p.totalRevenue, p.currency)}</td>
                    <td className={`p-3 text-right hidden lg:table-cell ${p.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(p.profit, p.currency)}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        p.status === 'in_stock' ? 'bg-green-500/10 text-green-400' :
                        p.status === 'low_stock' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{p.status === 'in_stock' ? 'In Stock' : p.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}</span>
                    </td>
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedProduct(p); setShowSaleModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-all" title="Record Sale">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setSelectedProduct(p); setShowStockModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 transition-all" title="Add Stock">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-white/30">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-[#0c0c0c] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer relative"
              onClick={() => router.push(`/tracker/${p.id}`)}>
              <button onClick={(e) => { e.stopPropagation(); toggleSelect(p.id); }}
                className="absolute top-3 left-3 z-10">
                {selectedIds.has(p.id) ? <CheckSquare className="w-4 h-4 text-[#7c3aed]" /> : <Square className="w-4 h-4 text-white/20" />}
              </button>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {p.product.images?.[0] ? (
                    <img src={getUploadUrl(p.product.images[0])} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">{p.product.emoji || '📦'}</div>
                  )}
                  <div>
                    <p className="text-white font-medium text-sm">{p.product.name}</p>
                    <p className="text-white/30 text-xs">{p.product.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  p.status === 'in_stock' ? 'bg-green-500/10 text-green-400' :
                  p.status === 'low_stock' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{p.status === 'in_stock' ? 'In Stock' : p.status === 'low_stock' ? 'Low' : 'Out'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'STOCK', value: p.currentStock },
                  { label: 'SOLD', value: p.totalSold },
                  { label: 'REVENUE', value: formatCurrency(p.totalRevenue, p.currency) },
                  { label: 'PROFIT', value: formatCurrency(p.profit, p.currency), color: p.profit >= 0 ? 'text-green-400' : 'text-red-400' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-[10px] text-white/30 font-mono">{s.label}</p>
                    <p className={`text-sm font-medium ${s.color || 'text-white/70'}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setSelectedProduct(p); setShowSaleModal(true); }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-medium hover:bg-[#7c3aed]/20 transition-all">Sale</button>
                <button onClick={() => { setSelectedProduct(p); setShowStockModal(true); }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs font-medium hover:bg-white/10 transition-all">Stock</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowSaleModal(false)}>
          <div className="bg-[#0c0c0c] border border-white/10 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Record Sale</h3>
                <p className="text-sm text-white/50">{selectedProduct?.product.name || 'Select product'}</p>
              </div>
              <button onClick={() => setShowSaleModal(false)} className="p-2 rounded-lg hover:bg-white/10"><X className="w-5 h-5 text-white/50" /></button>
            </div>
            {!selectedProduct && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-white/50 mb-1.5">Product</label>
                <select value="" onChange={e => {
                  const p = products.find(pr => pr.id === e.target.value);
                  if (p) { setSelectedProduct(p); setSaleForm(f => ({ ...f, unitPrice: p.sellingPrice?.toString() || '' })); }
                }} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.product.name} (Stock: {p.currentStock})</option>)}
                </select>
              </div>
            )}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Quantity</label>
                  <input type="number" min="1" value={saleForm.quantity} onChange={e => setSaleForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#7c3aed]/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Unit Price</label>
                  <input type="number" step="0.01" value={saleForm.unitPrice} onChange={e => setSaleForm(f => ({ ...f, unitPrice: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#7c3aed]/50 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Customer Name (optional)</label>
                <input type="text" value={saleForm.customerName} onChange={e => setSaleForm(f => ({ ...f, customerName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#7c3aed]/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Notes (optional)</label>
                <textarea value={saleForm.notes} onChange={e => setSaleForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#7c3aed]/50 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSaleModal(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium">Cancel</button>
              <button onClick={handleRecordSale} disabled={!selectedProduct || !saleForm.quantity || !saleForm.unitPrice || submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Record Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowStockModal(false)}>
          <div className="bg-[#0c0c0c] border border-white/10 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Add Stock</h3>
                <p className="text-sm text-white/50">{selectedProduct?.product.name || 'Select product'}</p>
              </div>
              <button onClick={() => setShowStockModal(false)} className="p-2 rounded-lg hover:bg-white/10"><X className="w-5 h-5 text-white/50" /></button>
            </div>
            {!selectedProduct && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-white/50 mb-1.5">Product</label>
                <select value="" onChange={e => {
                  const p = products.find(pr => pr.id === e.target.value);
                  if (p) setSelectedProduct(p);
                }} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.product.name}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Quantity to Add</label>
                <input type="number" min="1" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#7c3aed]/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Purchase Price per Unit (optional)</label>
                <input type="number" step="0.01" value={stockForm.purchasePrice} onChange={e => setStockForm(f => ({ ...f, purchasePrice: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#7c3aed]/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Notes (optional)</label>
                <textarea value={stockForm.notes} onChange={e => setStockForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#7c3aed]/50 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowStockModal(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium">Cancel</button>
              <button onClick={handleAddStock} disabled={!selectedProduct || !stockForm.quantity || submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-green-500/80 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        product={selectedProduct}
        products={products}
        onAdjusted={loadData}
        preselectedProductId={selectedProduct?.id}
      />
      <FxRatesModal isOpen={showFxModal} onClose={() => setShowFxModal(false)} onSaved={(rows) => { setFxRates(rows); setShowFxModal(false); }} />
    </div>
  );
}
