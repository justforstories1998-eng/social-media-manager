'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Search, Download, Loader2, ShoppingCart, Package, ArrowLeftRight,
  RotateCcw, FileText, Calendar,
} from 'lucide-react';
import { trackerApi, type TrackerProduct, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';
import DateRangeFilter from '@/components/DateRangeFilter';

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  sale: { label: 'Sale', color: 'text-green-400', bg: 'bg-green-500/10', icon: ShoppingCart },
  restock: { label: 'Restock', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Package },
  adjustment: { label: 'Adjustment', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: ArrowLeftRight },
  return: { label: 'Return', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: RotateCcw },
  initial: { label: 'Initial', color: 'text-white/40', bg: 'bg-white/5', icon: FileText },
  stock_movement: { label: 'Stock', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Package },
};

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<TrackerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (productFilter) params.trackerProductId = productFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const [txRes, prodRes] = await Promise.all([
        trackerApi.getTransactions(Object.keys(params).length ? params : undefined),
        trackerApi.list(),
      ]);
      setTransactions(txRes.data);
      setProducts(prodRes.data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [productFilter, dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = transactions.filter(tx => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const productName = tx.trackerProduct?.product?.name || '';
      const customer = tx.customerName || '';
      const notes = tx.notes || '';
      if (!productName.toLowerCase().includes(q) && !customer.toLowerCase().includes(q) && !notes.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await trackerApi.exportCsv(params);
      const blob = new Blob([res.data as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Exported');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-[#7c3aed] mx-auto mb-4" /><p className="text-white/50 text-sm">Loading transactions...</p></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/tracker')} className="p-2 rounded-lg hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5 text-white/50" />
        </button>
        <div>
          <p className="text-[10px] font-mono text-white/30 tracking-[0.2em] mb-1">TRANSACTION HISTORY</p>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:border-[#7c3aed]/50 focus:outline-none" />
        </div>
        <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.product.name}</option>)}
        </select>
        <DateRangeFilter dateFrom={dateFrom} dateTo={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} />
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 text-sm border border-white/10 transition-all disabled:opacity-50">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export
        </button>
      </div>

      {/* Transaction List */}
      <div className="bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs border-b border-white/5">
                <th className="text-left p-3 font-medium">DATE</th>
                <th className="text-left p-3 font-medium">TYPE</th>
                <th className="text-left p-3 font-medium">PRODUCT</th>
                <th className="text-right p-3 font-medium">QTY</th>
                <th className="text-right p-3 font-medium">AMOUNT</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">CUSTOMER</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">NOTES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => {
                const type = tx.transactionType === 'sale' ? (tx.isReturn ? 'return' : 'sale') : tx.type;
                const config = typeConfig[type] || typeConfig.adjustment;
                const Icon = config.icon;
                const isPositive = type === 'restock' || type === 'return' || type === 'initial' || (type === 'adjustment' && tx.quantity > 0);
                return (
                  <tr key={`${tx.transactionType}-${tx.id}`} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3 text-white/50 text-xs">
                      <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      <div className="text-white/30">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color} ${config.bg}`}>
                        <Icon className="w-3 h-3" /> {config.label}
                      </span>
                    </td>
                    <td className="p-3 text-white/70">{tx.trackerProduct?.product?.name || '-'}</td>
                    <td className={`p-3 text-right font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{tx.quantity}
                    </td>
                    <td className="p-3 text-right text-white/70">
                      {tx.totalPrice ? formatCurrency(Number(tx.totalPrice)) : tx.transactionType === 'stock_movement' ? '-' : '-'}
                    </td>
                    <td className="p-3 text-white/50 hidden md:table-cell">{tx.customerName || '-'}</td>
                    <td className="p-3 text-white/30 text-xs hidden lg:table-cell max-w-[200px] truncate">{tx.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-white/30">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No transactions found</p>
          </div>
        )}
      </div>

      <div className="text-xs text-white/20 text-right">{filtered.length} transactions</div>
    </div>
  );
}
