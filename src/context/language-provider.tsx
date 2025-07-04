
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
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
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
    restaurantSettings: 'Restaurant',
    restaurantDetails: 'Restaurant Details',
    manageRestaurantNameLogo: "Manage your restaurant's name and logo.",
    saveChanges: 'Save Changes',
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
    printers: 'Printers', // Retained for Printer Roles tab label
    printerName: 'Printer Name',
    connectionType: 'Connection Type',
    connectionInfo: 'Connection Info',
    printerRoles: 'Printer Roles', // Used for new settings tab
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
    noDefaultRole: 'No Default Role',
    localPrintServerSettings: 'Local Print Server Settings',
    printServerURL: 'Print Server URL',
    configurePrintServerUrl: 'Configure the URL for your local print server (e.g., Electron app).',
    settingsSaved: 'Settings Saved',
    printServerUrlUpdated: 'Print server URL has been updated.',
    restaurantDetailsUpdated: 'Restaurant details have been updated.',
    saveSettings: 'Save Settings',
    yourRestaurantNamePlaceholder: 'Your Restaurant Name',
    logoUrlPlaceholder: 'https://example.com/logo.png',
    restaurantLogoPreviewAlt: 'Restaurant Logo Preview',
    fetchRolesErrorDetailed: 'Failed to fetch printer roles from {url}. Status: {status}. Message: {message}',
    fetchRolesErrorGeneric: 'Could not connect to print server to fetch roles. Using fallback.',
    fetchRolesErrorTitle: 'Print Server Role Error',
    rolesFetchedTitle: 'Printer Roles Loaded',
    rolesFetchedDesc: '{count} roles loaded from print server: {url}',
    fetchCategoriesError: 'Failed to fetch categories.',
    categoryNameRequired: 'Category name is required.',
    addCategoryErrorTitle: 'Error Adding Category',
    categoryAddedTitle: 'Category Added',
    categoryAddedDesc: 'Category "{name}" has been added.',
    unexpectedErrorTitle: 'Unexpected Error',
    addCategoryErrorDesc: 'Could not add category.',
    updateCategoryErrorTitle: 'Error Updating Category',
    categoryUpdatedTitle: 'Category Updated',
    categoryUpdatedDesc: 'Category "{name}" has been updated.',
    updateCategoryErrorDesc: 'Could not update category.',
    categoryDeletedTitle: 'Category Deleted',
    categoryDeletedDesc: 'Category "{name}" has been deleted.',
    deleteCategoryErrorTitle: 'Error Deleting Category',
    deleteCategoryErrorDesc: 'Failed to delete category.',
    fetchingRoles: 'Fetching roles',
    rolesFetchErrorWarning: 'Using fallback roles due to error fetching from print server',
    manageCategoriesDesc: 'Manage your menu categories and their default printer roles.',
    refreshing: 'Refreshing...',
    addCategoryButton: 'Add Category',
    addNewCategoryTitle: 'Add New Category',
    addNewCategoryDesc: 'Enter details for the new menu category.',
    cancelButton: 'Cancel',
    addingButton: 'Adding...',
    loadingCategories: 'Loading categories...',
    categoryListCaption: 'A list of your menu categories from the database.',
    nameColumn: 'Name',
    iconNameColumn: 'Icon Name',
    actionsColumn: 'Actions',
    noneAbbreviation: 'N/A',
    confirmDeleteTitle: 'Are you sure?',
    confirmDeleteCategoryDesc: 'This action will permanently delete the category "{name}". Menu items in this category may also be affected.',
    deleteButton: 'Delete',
    deletingButton: 'Deleting...',
    editCategoryTitle: 'Edit Category: {name}',
    editCategoryDesc: 'Update the details for this category.',
    savingButton: 'Saving...',
    // New keys for PrinterRoleManagement
    managePrinterRolesDesc: 'Define and manage printer roles for your system.',
    addPrinterRoleButton: 'Add Printer Role',
    addNewPrinterRoleTitle: 'Add New Printer Role',
    editPrinterRoleTitle: 'Edit Printer Role',
    addNewPrinterRoleDesc: 'Define a new key and display name for a printer role.',
    editPrinterRoleDesc: 'Update the display name for printer role "{name}".',
    roleKeyLabel: 'Role Key',
    displayNameLabel: 'Display Name',
    roleKeyEditWarning: 'Role Key cannot be changed after creation.',
    roleKeyFormatHint: 'Use UPPERCASE_SNAKE_CASE (e.g., KITCHEN_MAIN). This key is used by the print server.',
    loadingPrinterRoles: 'Loading printer roles...',
    printerRoleListCaption: 'A list of defined printer roles.',
    noPrinterRolesFound: 'No printer roles defined. Add some to assign to categories or menu items.',
    confirmDeletePrinterRoleDesc: 'This action will permanently delete the printer role "{name}" (Key: {key}). Ensure it\'s not critical for print server operations.',
    // Menu Item Management
    manageMenuItemsDesc: 'Manage your menu items, their categories, and modifiers.',
    addMenuItemButton: 'Add Menu Item',
    addNewMenuItemTitle: 'Add New Menu Item',
    editMenuItemTitle: 'Edit Menu Item',
    addNewMenuItemDesc: 'Enter details for the new menu item.',
    editMenuItemDesc: 'Update details for "{name}".',
    loadingMenuItems: 'Loading menu items...',
    menuItemListCaption: 'A list of your menu items.',
    priceColumn: 'Price',
    imageColumn: 'Image',
    categoryColumn: 'Category',
    modifiersColumn: 'Modifiers',
    noMenuItemsFound: 'No menu items found. Add some!',
    confirmDeleteMenuItemDesc: 'This action will permanently delete "{name}". This might affect past order records if not handled carefully.',
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
    restaurantSettings: 'Restoran',
    restaurantDetails: 'Restoran Detayları',
    manageRestaurantNameLogo: "Restoranınızın adını ve logosunu yönetin.",
    saveChanges: 'Değişiklikleri Kaydet',
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
    printers: 'Yazıcılar', // Yazıcı Rolleri sekme başlığı için korunur
    printerName: 'Yazıcı Adı',
    connectionType: 'Bağlantı Türü',
    connectionInfo: 'Bağlantı Bilgisi',
    printerRoles: 'Yazıcı Rolleri', // Yeni ayar sekmesi için
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
    noDefaultRole: 'Varsayılan Rol Yok',
    localPrintServerSettings: 'Yerel Yazdırma Sunucusu Ayarları',
    printServerURL: 'Yazdırma Sunucusu Adresi',
    configurePrintServerUrl: 'Yerel yazdırma sunucusu uygulamanızın (örn: Electron) adresini yapılandırın.',
    settingsSaved: 'Ayarlar Kaydedildi',
    printServerUrlUpdated: 'Yazdırma sunucusu adresi güncellendi.',
    restaurantDetailsUpdated: 'Restoran detayları güncellendi.',
    saveSettings: 'Ayarları Kaydet',
    yourRestaurantNamePlaceholder: 'Restoran Adınız',
    logoUrlPlaceholder: 'https://ornek.com/logo.png',
    restaurantLogoPreviewAlt: 'Restoran Logo Önizlemesi',
    fetchRolesErrorDetailed: 'Yazıcı rolleri {url} adresinden alınamadı. Durum: {status}. Mesaj: {message}',
    fetchRolesErrorGeneric: 'Yazıcı sunucusuna bağlanıp roller alınamadı. Yedek roller kullanılıyor.',
    fetchRolesErrorTitle: 'Yazıcı Sunucusu Rol Hatası',
    rolesFetchedTitle: 'Yazıcı Rolleri Yüklendi',
    rolesFetchedDesc: 'Yazıcı sunucusundan {count} rol yüklendi: {url}',
    fetchCategoriesError: 'Kategoriler getirilemedi.',
    categoryNameRequired: 'Kategori adı zorunludur.',
    addCategoryErrorTitle: 'Kategori Ekleme Hatası',
    categoryAddedTitle: 'Kategori Eklendi',
    categoryAddedDesc: '"{name}" kategorisi eklendi.',
    unexpectedErrorTitle: 'Beklenmedik Hata',
    addCategoryErrorDesc: 'Kategori eklenemedi.',
    updateCategoryErrorTitle: 'Kategori Güncelleme Hatası',
    categoryUpdatedTitle: 'Kategori Güncellendi',
    categoryUpdatedDesc: '"{name}" kategorisi güncellendi.',
    updateCategoryErrorDesc: 'Kategori güncellenemedi.',
    categoryDeletedTitle: 'Kategori Silindi',
    categoryDeletedDesc: '"{name}" kategorisi silindi.',
    deleteCategoryErrorTitle: 'Kategori Silme Hatası',
    deleteCategoryErrorDesc: 'Kategori silinemedi.',
    fetchingRoles: 'Roller getiriliyor',
    rolesFetchErrorWarning: 'Yazıcı sunucusundan roller alınamadığı için yedek roller kullanılıyor',
    manageCategoriesDesc: 'Menü kategorilerinizi ve varsayılan yazıcı rollerini yönetin.',
    refreshing: 'Yenileniyor...',
    addCategoryButton: 'Kategori Ekle',
    addNewCategoryTitle: 'Yeni Kategori Ekle',
    addNewCategoryDesc: 'Yeni menü kategorisi için detayları girin.',
    cancelButton: 'İptal',
    addingButton: 'Ekleniyor...',
    loadingCategories: 'Kategoriler yükleniyor...',
    categoryListCaption: 'Veritabanındaki menü kategorilerinizin listesi.',
    nameColumn: 'Ad',
    iconNameColumn: 'İkon Adı',
    actionsColumn: 'Eylemler',
    noneAbbreviation: 'Yok',
    confirmDeleteTitle: 'Emin misiniz?',
    confirmDeleteCategoryDesc: 'Bu işlem "{name}" kategorisini kalıcı olarak silecektir. Bu kategorideki menü öğeleri de etkilenebilir.',
    deleteButton: 'Sil',
    deletingButton: 'Siliniyor...',
    editCategoryTitle: 'Kategoriyi Düzenle: {name}',
    editCategoryDesc: 'Bu kategorinin detaylarını güncelleyin.',
    savingButton: 'Kaydediliyor...',
    // PrinterRoleManagement için yeni çeviriler
    managePrinterRolesDesc: 'Sisteminiz için yazıcı rollerini tanımlayın ve yönetin.',
    addPrinterRoleButton: 'Yazıcı Rolü Ekle',
    addNewPrinterRoleTitle: 'Yeni Yazıcı Rolü Ekle',
    editPrinterRoleTitle: 'Yazıcı Rolünü Düzenle',
    addNewPrinterRoleDesc: 'Yeni bir yazıcı rolü için anahtar ve görünen ad tanımlayın.',
    editPrinterRoleDesc: '"{name}" yazıcı rolünün görünen adını güncelleyin.',
    roleKeyLabel: 'Rol Anahtarı',
    displayNameLabel: 'Görünen Ad',
    roleKeyEditWarning: 'Rol Anahtarı oluşturulduktan sonra değiştirilemez.',
    roleKeyFormatHint: 'BÜYÜK_HARF_YILAN_VAKA kullanın (örn: MUTFAK_ANA). Bu anahtar yazdırma sunucusu tarafından kullanılır.',
    loadingPrinterRoles: 'Yazıcı rolleri yükleniyor...',
    printerRoleListCaption: 'Tanımlanmış yazıcı rollerinin listesi.',
    noPrinterRolesFound: 'Tanımlı yazıcı rolü bulunamadı. Kategori veya menü öğelerine atamak için ekleyin.',
    confirmDeletePrinterRoleDesc: 'Bu işlem "{name}" (Anahtar: {key}) yazıcı rolünü kalıcı olarak silecektir. Yazdırma sunucusu işlemlerinde kritik olmadığından emin olun.',
    // Menu Item Management için yeni/güncellenmiş çeviriler
    manageMenuItemsDesc: 'Menü öğelerinizi, kategorilerini ve ek malzemelerini yönetin.',
    addMenuItemButton: 'Menü Öğesi Ekle',
    addNewMenuItemTitle: 'Yeni Menü Öğesi Ekle',
    editMenuItemTitle: 'Menü Öğesini Düzenle',
    addNewMenuItemDesc: 'Yeni menü öğesi için detayları girin.',
    editMenuItemDesc: '"{name}" detaylarını güncelleyin.',
    loadingMenuItems: 'Menü öğeleri yükleniyor...',
    menuItemListCaption: 'Menü öğelerinizin listesi.',
    priceColumn: 'Fiyat',
    imageColumn: 'Görsel',
    categoryColumn: 'Kategori',
    modifiersColumn: 'Ek Malzemeler',
    noMenuItemsFound: 'Menü öğesi bulunamadı. Ekleyin!',
    confirmDeleteMenuItemDesc: 'Bu işlem "{name}" öğesini kalıcı olarak silecektir. Dikkatli bir şekilde ele alınmazsa geçmiş sipariş kayıtlarını etkileyebilir.',
  },
};

const initialState: LanguageProviderState = {
  locale: 'en',
  setLocale: () => null,
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => {
    let translation = translations.en[key] || key.toString();
    if (replacements) {
      Object.keys(replacements).forEach((placeholder) => {
        translation = translation.replace(new RegExp(`{${placeholder}}`, 'g'), String(replacements[placeholder]));
      });
    }
    return translation;
  },
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

  const t = useCallback((key: TranslationKey, replacements?: Record<string, string | number>): string => {
    let translation = translations[locale]?.[key] || translations.en[key] || key.toString();
    if (replacements) {
      Object.keys(replacements).forEach((placeholder) => {
        translation = translation.replace(new RegExp(`{${placeholder}}`, 'g'), String(replacements[placeholder]));
      });
    }
    return translation;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: setLocaleHandler, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
