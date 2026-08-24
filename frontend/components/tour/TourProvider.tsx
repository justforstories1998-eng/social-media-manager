'use client';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { globalTourConfig, moduleTourConfigs, TourStep } from '../../lib/tourConfigs';
import { TourSpotlight } from './TourSpotlight';

const STORAGE_KEY = 'wondermedia_tour_state';

interface TourState {
  completedModules: string[];
  skippedModules: string[];
}

interface TourContextValue {
  startTour: (moduleId: string) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
  isTourActive: boolean;
  activeModule: string | null;
  currentStep: number;
  totalSteps: number;
  steps: TourStep[];
  shouldStartGlobalTour: () => boolean;
}

export const TourContext = createContext<TourContextValue | null>(null);

function loadTourState(): TourState {
  if (typeof window === 'undefined') return { completedModules: [], skippedModules: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completedModules: [], skippedModules: [] };
}

function saveTourState(state: TourState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [tourState, setTourState] = useState<TourState>({ completedModules: [], skippedModules: [] });
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setTourState(loadTourState());
  }, []);

  const steps = useMemo(() => {
    if (!activeModule) return [];
    if (activeModule === 'global') return globalTourConfig.steps;
    return moduleTourConfigs[activeModule]?.steps ?? [];
  }, [activeModule]);

  const totalSteps = steps.length;

  const shouldStartGlobalTour = useCallback(() => {
    const state = loadTourState();
    return !state.completedModules.includes('global') && !state.skippedModules.includes('global');
  }, []);

  const stopTour = useCallback(() => {
    setActiveModule(null);
    setCurrentStep(0);
  }, []);

  const skipTour = useCallback(() => {
    setTourState(prev => {
      const next = { ...prev, skippedModules: [...new Set([...prev.skippedModules, activeModule ?? ''])] };
      saveTourState(next);
      return next;
    });
    stopTour();
  }, [activeModule, stopTour]);

  const finishTour = useCallback(() => {
    setTourState(prev => {
      const next = { ...prev, completedModules: [...new Set([...prev.completedModules, activeModule ?? ''])] };
      saveTourState(next);
      return next;
    });
    stopTour();
  }, [activeModule, stopTour]);

  const startTour = useCallback((moduleId: string) => {
    setCurrentStep(0);
    setActiveModule(moduleId);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev >= totalSteps - 1) {
        finishTour();
        return 0;
      }
      return prev + 1;
    });
  }, [totalSteps, finishTour]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const value = useMemo<TourContextValue>(() => ({
    startTour,
    stopTour,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    isTourActive: activeModule !== null,
    activeModule,
    currentStep,
    totalSteps,
    steps,
    shouldStartGlobalTour,
  }), [startTour, stopTour, nextStep, prevStep, skipTour, finishTour, activeModule, currentStep, totalSteps, steps, shouldStartGlobalTour]);

  return (
    <TourContext.Provider value={value}>
      {children}
      {activeModule && steps.length > 0 && (
        <TourSpotlight
          steps={steps}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          onFinish={finishTour}
          onClose={stopTour}
        />
      )}
    </TourContext.Provider>
  );
}
