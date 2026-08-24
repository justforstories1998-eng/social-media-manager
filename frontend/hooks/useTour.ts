'use client';
import { useContext } from 'react';
import { TourContext } from '../components/tour/TourProvider';

export function useTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error('useTour must be used within TourProvider');
  return context;
}
