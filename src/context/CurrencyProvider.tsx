
"use client"

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import type { CurrencyConfig, CurrencyProviderState } from '@/types';

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrencyCode?: string; // e.g., 'TRY'
  storageKey?: string;
}

export const PREDEFINED_CURRENCIES: Record<string, CurrencyConfig> = {
  TRY: { symbol: '₺', code: 'TRY', name: 'Turkish Lira' },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
};

const initialCurrency = PREDEFINED_CURRENCIES.TRY; // Default to TRY

const initialState: CurrencyProviderState = {
  currency: initialCurrency,
  setCurrency: () => null,
  formatCurrency: (amount: number) => `${initialCurrency.symbol}${amount.toFixed(2)}`,
};

export const CurrencyContext = createContext<CurrencyProviderState>(initialState);

export function CurrencyProvider({
  children,
  defaultCurrencyCode = 'TRY',
  storageKey = 'orderflow-currency',
}: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedValue = localStorage.getItem(storageKey);
        if (storedValue) {
          const parsed = JSON.parse(storedValue) as CurrencyConfig;
          // Ensure parsed value is a valid known currency or a custom one
          if (PREDEFINED_CURRENCIES[parsed.code] || parsed.code === 'CUSTOM') {
            return parsed;
          }
        }
      } catch (error) {
        console.error("Failed to parse currency from localStorage", error);
      }
    }
    return PREDEFINED_CURRENCIES[defaultCurrencyCode] || PREDEFINED_CURRENCIES.TRY;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(currency));
    }
  }, [currency, storageKey]);

  const setCurrencyHandler = (newCurrency: CurrencyConfig) => {
    setCurrencyState(newCurrency);
  };

  const formatCurrency = useCallback((amount: number): string => {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }, [currency.symbol]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: setCurrencyHandler, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}
