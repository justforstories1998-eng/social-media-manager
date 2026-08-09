'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomDropdown({ options, value, onChange, placeholder = 'Select...' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-sm text-left flex items-center justify-between hover:border-white/20 transition-colors"
      >
        <span className={selected ? 'text-white' : 'text-white/40'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-5 py-3 text-left text-sm transition-colors flex flex-col ${
                option.value === value
                  ? 'bg-[#7c3aed]/20 text-[#7c3aed]'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{option.label}</span>
              {option.description && (
                <span className="text-xs text-white/40 mt-0.5">{option.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
