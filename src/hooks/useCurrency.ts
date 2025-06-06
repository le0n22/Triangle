
"use client"

import { useContext } from 'react';
import { CurrencyContext } from '@/context/CurrencyProvider';
import type { CurrencyProviderState } from '@/types';

export function useCurrency(): CurrencyProviderState {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
