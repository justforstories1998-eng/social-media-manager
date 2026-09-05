'use client';

import React from 'react';
import { Calendar, X } from 'lucide-react';

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onChange: (from: string, to: string) => void;
  className?: string;
}

const quickRanges = [
  { label: 'All Time', from: '', to: '' },
  { label: 'This Month', from: () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; }, to: () => new Date().toISOString().split('T')[0] },
  { label: 'Last 30 Days', from: () => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().split('T')[0]; }, to: () => new Date().toISOString().split('T')[0] },
  { label: 'Last 90 Days', from: () => { const d = new Date(); d.setDate(d.getDate()-90); return d.toISOString().split('T')[0]; }, to: () => new Date().toISOString().split('T')[0] },
];

export default function DateRangeFilter({ dateFrom, dateTo, onChange, className = '' }: DateRangeFilterProps) {
  const isActive = dateFrom || dateTo;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <Calendar className="w-4 h-4 text-white/40" />
      {quickRanges.map((range) => {
        const from = typeof range.from === 'function' ? range.from() : range.from;
        const to = typeof range.to === 'function' ? range.to() : range.to;
        const isCurrentRange = dateFrom === from && dateTo === to;
        return (
          <button
            key={range.label}
            onClick={() => onChange(from, to)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isCurrentRange
                ? 'bg-[#7c3aed] text-white'
                : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            {range.label}
          </button>
        );
      })}
      <div className="flex items-center gap-1 ml-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onChange(e.target.value, dateTo)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 focus:border-[#7c3aed]/50 focus:outline-none [color-scheme:dark]"
        />
        <span className="text-white/30 text-xs">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onChange(dateFrom, e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 focus:border-[#7c3aed]/50 focus:outline-none [color-scheme:dark]"
        />
        {isActive && (
          <button
            onClick={() => onChange('', '')}
            className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
