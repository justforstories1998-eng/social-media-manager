'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Loader2 } from 'lucide-react';
import { trackerApi, type FxRate, CURRENCY_OPTIONS } from '@/lib/api';
import { toast } from 'sonner';

interface FxRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (rows: FxRate[]) => void;
}

export default function FxRatesModal({ isOpen, onClose, onSaved }: FxRatesModalProps) {
  const [rates, setRates] = useState<FxRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    trackerApi.getFxRates()
      .then(res => {
        setRates(res.data);
        setErrors({});
      })
      .catch(() => toast.error('Failed to load FX rates'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const updateRate = (currency: string, value: string) => {
    setRates(prev => prev.map(r => r.currency === currency ? { ...r, rateToUSD: parseFloat(value) || 0 } : r));
    const num = parseFloat(value);
    setErrors(prev => {
      const next = { ...prev };
      if (isNaN(num) || num <= 0) next[currency] = 'Rate must be > 0';
      else delete next[currency];
      return next;
    });
  };

  const hasErrors = Object.keys(errors).length > 0 || rates.some(r => !r.rateToUSD || r.rateToUSD <= 0 || isNaN(r.rateToUSD));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = rates.map(r => ({ currency: r.currency, rateToUSD: r.rateToUSD }));
      const res = await trackerApi.updateFxRates(payload);
      toast.success('FX rates updated');
      onSaved(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update rates');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const displayCurrencies = CURRENCY_OPTIONS.filter(c => c.value !== 'USD');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0c0c0c] border border-white/10 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">FX Rates</h3>
              <p className="text-sm text-white/50">1 unit of currency = X USD</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all"><X className="w-5 h-5 text-white/50" /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#7c3aed]" />
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {rates.filter(r => r.currency !== 'USD').map(r => {
              const label = displayCurrencies.find(c => c.value === r.currency)?.label || r.currency;
              return (
                <div key={r.currency}>
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm text-white/70 font-medium">{label}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.000001"
                      value={r.rateToUSD || ''}
                      onChange={e => updateRate(r.currency, e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#7c3aed]/50 focus:outline-none"
                    />
                    <span className="text-xs text-white/40 w-36 text-right">{new Date(r.updatedAt).toLocaleString()}</span>
                  </div>
                  {errors[r.currency] && (
                    <p className="text-xs text-red-400 mt-1 ml-28">{errors[r.currency]}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving || hasErrors || loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#7c3aed]/80 text-white text-sm font-medium hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Rates'}
          </button>
        </div>
      </div>
    </div>
  );
}
