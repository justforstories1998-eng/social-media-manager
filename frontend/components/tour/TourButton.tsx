'use client';
import { Sparkles } from 'lucide-react';
import { useTour } from '../../hooks/useTour';

export function TourButton({ moduleId }: { moduleId: string }) {
  const { startTour } = useTour();

  return (
    <button
      onClick={() => startTour(moduleId)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
    >
      <Sparkles className="w-4 h-4" />
      Tour
    </button>
  );
}
