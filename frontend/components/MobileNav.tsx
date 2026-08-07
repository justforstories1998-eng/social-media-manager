'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, FileText, Package, Calendar, BarChart3, Sparkles, Settings, Bell, Shield } from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/posts', label: 'Posts', icon: FileText },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/ai/generate', label: 'AI Studio', icon: Sparkles },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const secondaryLinks = [
    { href: '/admin', label: 'Admin', icon: Shield },
    { href: '/settings/business', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="glass p-3 rounded-2xl hover:bg-white/10 transition-colors"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 z-40 md:hidden pt-20 px-6" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="glass rounded-[2rem] p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <nav className="space-y-1">
              {links.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-3 px-4 text-lg font-medium hover:bg-white/5 rounded-2xl transition-colors"
                >
                  <link.icon className="w-5 h-5 text-white/60" />
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <nav className="space-y-1">
                {secondaryLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 text-lg font-medium hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    <link.icon className="w-5 h-5 text-white/60" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Link 
                href="/auth/login" 
                onClick={() => setIsOpen(false)}
                className="block text-center py-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
