
"use client"

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import type { Locale, TranslationKey } from '@/types';

interface LanguageProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
  storageKey?: string;
}

interface LanguageProviderState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

// Export translations so it can be used for initial render matching server render
export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    dashboard: 'Dashboard',
    tables: 'Tables',
    menu: 'Menu',
    orders: 'Orders',
    tracking: 'Tracking',
    kds: 'KDS',
    reports: 'Reports',
    settings: 'Settings',
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    turkish: 'Turkish',
    myAccount: 'My Account',
    profile: 'Profile',
    logout: 'Logout',
    restaurantSettings: 'Restaurant Details',
    appearanceSettings: 'Appearance Settings',
    tableManagementSettings: 'Table Management',
    categoryManagementSettings: 'Category Management',
    menuItemManagementSettings: 'Menu Item Management',
    modifierManagementSettings: 'Modifier Management',
    orderPlatformSettings: 'Order Platform Integrations',
    restaurant: 'Restaurant',
    appearance: 'Appearance',
    categories: 'Categories',
    menu_items: 'Menu Items',
    modifiers: 'Modifiers',
    order_platforms: 'Order Platforms',
  },
  tr: {
    dashboard: 'Kontrol Paneli',
    tables: 'Masalar',
    menu: 'Menü',
    orders: 'Siparişler',
    tracking: 'Takip',
    kds: 'Mutfak Ekranı',
    reports: 'Raporlar',
    settings: 'Ayarlar',
    language: 'Dil',
    selectLanguage: 'Dil Seçin',
    english: 'İngilizce',
    turkish: 'Türkçe',
    myAccount: 'Hesabım',
    profile: 'Profil',
    logout: 'Çıkış Yap',
    restaurantSettings: 'Restoran Detayları',
    appearanceSettings: 'Görünüm Ayarları',
    tableManagementSettings: 'Masa Yönetimi',
    categoryManagementSettings: 'Kategori Yönetimi',
    menuItemManagementSettings: 'Menü Öğesi Yönetimi',
    modifierManagementSettings: 'Ek Malzeme Yönetimi',
    orderPlatformSettings: 'Sipariş Platform Entegrasyonları',
    restaurant: 'Restoran',
    appearance: 'Görünüm',
    categories: 'Kategoriler',
    menu_items: 'Menü Öğeleri',
    modifiers: 'Ek Malzemeler',
    order_platforms: 'Platform Entegrasyonları',
  },
};

const initialState: LanguageProviderState = {
  locale: 'en', // This is the key: server and initial client render will use this default
  setLocale: () => null,
  t: (key: TranslationKey) => translations.en[key] || key.toString(), // Default t function
};

export const LanguageContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLocale = 'en',
  storageKey = 'orderflow-locale',
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const storedLocale = localStorage.getItem(storageKey) as Locale;
      return storedLocale && translations[storedLocale] ? storedLocale : defaultLocale;
    }
    return defaultLocale;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocaleHandler = (newLocale: Locale) => {
    if (translations[newLocale]) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newLocale);
      }
      setLocaleState(newLocale);
    }
  };

  const t = useCallback((key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key.toString();
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: setLocaleHandler, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
