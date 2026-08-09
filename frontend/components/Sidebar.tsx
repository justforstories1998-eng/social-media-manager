'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Package,
  Calendar,
  BarChart3,
  Sparkles,
  Bell,
  Download,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/ai/generate', label: 'AI Generate', icon: Sparkles },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/exports', label: 'Exports', icon: Download },
  { href: '/settings/business', label: 'Settings', icon: Settings },
];

const adminItems = [
  { href: '/admin', label: 'Admin Dashboard', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const allItems = [
    ...navItems,
    ...(user?.role === 'admin' ? adminItems : []),
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-[#0c0c0c] border-r border-white/10 z-40">
        <div className="p-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="WonderMedia" className="w-9 h-9 rounded-2xl object-cover" />
            <div>
              <div className="font-semibold text-lg tracking-tight">WonderMedia</div>
              <div className="text-[10px] font-mono text-white/40 -mt-0.5">AI Social Media</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {allItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#7c3aed]/15 text-[#7c3aed]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0c0c0c]/95 backdrop-blur-xl border-t border-white/10 z-40 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#7c3aed]' : 'text-white/40'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label.slice(0, 6)}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
