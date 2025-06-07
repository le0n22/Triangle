
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
    currency: 'Currency',
    selectCurrency: 'Select your display currency',
    turkish_lira: 'Turkish Lira',
    us_dollar: 'US Dollar',
    euro: 'Euro',
    customCurrency: 'Custom Currency',
    currencySymbol: 'Currency Symbol',
    currencyName: 'Currency Name',
    printers: 'Printers',
    printerName: 'Printer Name',
    connectionType: 'Connection Type',
    connectionInfo: 'Connection Info',
    printerRoles: 'Printer Roles',
    network: 'Network',
    bluetooth: 'Bluetooth',
    usb: 'USB',
    other_connection: 'Other',
    kitchenKOT: 'Kitchen KOT',
    barKOT: 'Bar KOT',
    receiptPrinting: 'Receipt Printing',
    reportPrinting: 'Report Printing',
    refresh: 'Refresh',
    error: 'Error',
    defaultPrinterRole: 'Default Printer Role',
    selectDefaultPrinterRole: 'Select Default Printer Role',
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
    currency: 'Para Birimi',
    selectCurrency: 'Görüntülenecek para biriminizi seçin',
    turkish_lira: 'Türk Lirası',
    us_dollar: 'ABD Doları',
    euro: 'Euro',
    customCurrency: 'Özel Para Birimi',
    currencySymbol: 'Para Birimi Sembolü',
    currencyName: 'Para Birimi Adı',
    printers: 'Yazıcılar',
    printerName: 'Yazıcı Adı',
    connectionType: 'Bağlantı Türü',
    connectionInfo: 'Bağlantı Bilgisi',
    printerRoles: 'Yazıcı Rolleri',
    network: 'Ağ (IP)',
    bluetooth: 'Bluetooth',
    usb: 'USB',
    other_connection: 'Diğer',
    kitchenKOT: 'Mutfak KOT',
    barKOT: 'Bar KOT',
    receiptPrinting: 'Fiş Yazdırma',
    reportPrinting: 'Rapor Yazdırma',
    refresh: 'Yenile',
    error: 'Hata',
    defaultPrinterRole: 'Varsayılan Yazıcı Rolü',
    selectDefaultPrinterRole: 'Varsayılan Yazıcı Rolü Seçin',
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
