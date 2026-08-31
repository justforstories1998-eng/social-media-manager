'use client';

import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import { TourProvider } from '@/components/tour/TourProvider';
import ChatBot from '@/components/ChatBot';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <TourProvider>
        <div className="min-h-screen bg-[#000000] text-white font-sans">
          <Sidebar />
          <main className="md:ml-60 pb-20 md:pb-0">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
          <ChatBot />
        </div>
      </TourProvider>
    </AuthGuard>
  );
}
