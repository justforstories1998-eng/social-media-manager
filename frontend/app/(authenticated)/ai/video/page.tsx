'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AIVideoRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/ai/studio?tab=video'); }, [router]);
  return null;
}
