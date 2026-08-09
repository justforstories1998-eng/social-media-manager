'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
