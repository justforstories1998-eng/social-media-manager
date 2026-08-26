'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TourStep } from '../../lib/tourConfigs';

interface TourSpotlightProps {
  steps: TourStep[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onClose: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export function TourSpotlight({
  steps,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  onClose,
}: TourSpotlightProps) {
  const step = steps[currentStep];
  const [rect, setRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      return;
    }

    const r = el.getBoundingClientRect();
    setRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      right: r.right,
      bottom: r.bottom,
    });

    if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step.target]);

  useEffect(() => {
    calculatePosition();
  }, [calculatePosition]);

  useEffect(() => {
    if (!rect) return;
    const pad = 16;
    const tooltipWidth = 380;
    const tooltipHeight = 200;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = rect.bottom + pad;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    if (top + tooltipHeight > vh - pad) {
      top = rect.top - pad - tooltipHeight;
    }
    if (top < pad) {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
    }
    if (left < pad) left = pad;
    if (left + tooltipWidth > vw - pad) left = vw - pad - tooltipWidth;

    setTooltipPos({ top, left });
  }, [rect]);

  useEffect(() => {
    const recalc = () => calculatePosition();
    window.addEventListener('resize', recalc);
    window.addEventListener('scroll', recalc, true);
    return () => {
      window.removeEventListener('resize', recalc);
      window.removeEventListener('scroll', recalc, true);
    };
  }, [calculatePosition]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNext, onPrev]);

  const isLastStep = currentStep === steps.length - 1;

  if (!rect) return null;

  const padding = 8;

  const clipPath = `polygon(
    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
    ${rect.left - padding}px ${rect.top - padding}px,
    ${rect.left - padding}px ${rect.bottom + padding}px,
    ${rect.right + padding}px ${rect.bottom + padding}px,
    ${rect.right + padding}px ${rect.top - padding}px
  )`;

  return (
    <div className="fixed inset-0 z-[9998]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[1px]"
        style={{ clipPath, pointerEvents: 'auto' }}
      />
      <div
        className="fixed z-[9999] border-2 border-[#7c3aed] rounded-xl pointer-events-none"
        style={{
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          boxShadow: '0 0 20px rgba(124, 58, 237, 0.5), inset 0 0 20px rgba(124, 58, 237, 0.1)',
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed z-[10000] rounded-2xl p-6 max-w-sm border border-[#7c3aed]/30 shadow-2xl"
          style={{ top: tooltipPos.top, left: tooltipPos.left, backgroundColor: '#0c0c0c' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <span className="font-mono text-xs text-white/40">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-5">{step.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={onPrev}
                  className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={onSkip}
                className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Skip Tour
              </button>
            </div>
            <button onClick={isLastStep ? onFinish : onNext} className="neon-button text-sm">
              {isLastStep ? 'Finish' : 'Next →'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
