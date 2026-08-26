'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AIImageRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/ai/studio?tab=image'); }, [router]);
  return null;
}
