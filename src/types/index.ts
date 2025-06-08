
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'dirty';

export interface Table {
  id: string;
  name?: string; // Optional name for the table
  number: number;
  status: TableStatus;
  capacity: number;
  currentOrderId?: string;
  currentOrderTotal?: number; // Optional total for the current order
}

export interface Modifier {
  id:string;
  name: string;
  priceChange: number; // Can be positive or negative
}

// For frontend components like MenuBrowser, OrderPanel
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // Category name
  imageUrl?: string;
  dataAiHint?: string;
  availableModifiers?: Modifier[];
  categoryId: string; // To find the category for fallback printer role
  defaultPrinterRole?: { roleKey: string; displayName: string } | null;
}

export interface OrderItem {
  id: string; // Unique ID for this line item in the order
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  selectedModifiers: Modifier[];
  specialRequests?: string;
  totalPrice: number;
}

export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'PAID' | 'CANCELLED';

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number; // Denormalized for convenience
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  taxRate: number; // e.g., 0.08 for 8%
  taxAmount: number;
  totalAmount: number;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface KOT {
  id: string;
  orderId: string;
  tableNumber: number;
  items: {
    name: string;
    quantity: number;
    modifiers?: string[]; // Names of selected modifiers
    specialRequests?: string
  }[];
  createdAt: string; // ISO Date string
}

// For frontend components like MenuBrowser, OrderPanel
export interface MenuCategory {
  id: string;
  name: string;
  iconName?: string;
  items: MenuItem[];
  defaultPrinterRole?: { roleKey: string; displayName: string } | null;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile';

export type ExternalOrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED_BY_RESTAURANT'
  | 'CANCELLED_BY_USER';

export interface ExternalOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  modifiers?: { name: string; price: number }[];
}

export interface ExternalOrder {
  id: string;
  platform: string;
  platformOrderId: string;
  customerName: string;
  customerAddress: string;
  customerPhoneNumber?: string;
  items: ExternalOrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee?: number;
  totalAmount: number;
  restaurantPayout?: number;
  status: ExternalOrderStatus;
  placedAt: string;
  estimatedDeliveryTime?: string;
  notes?: string;
  paymentServiceType?: string;
  shortCode?: string;
  platformIcon?: React.ElementType;
}

export interface DeliveryPlatform {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  isEnabled: boolean;
  icon?: React.ElementType;
}

export type Locale = 'en' | 'tr';

export type TranslationKey =
  | 'dashboard'
  | 'tables'
  | 'menu'
  | 'orders'
  | 'tracking'
  | 'kds'
  | 'reports'
  | 'settings'
  | 'language'
  | 'selectLanguage'
  | 'english'
  | 'turkish'
  | 'myAccount'
  | 'profile'
  | 'logout'
  | 'restaurantSettings'
  | 'restaurantDetails'
  | 'manageRestaurantNameLogo'
  | 'saveChanges'
  | 'appearanceSettings'
  | 'tableManagementSettings'
  | 'categoryManagementSettings'
  | 'menuItemManagementSettings'
  | 'modifierManagementSettings'
  | 'orderPlatformSettings'
  | 'restaurant'
  | 'appearance'
  | 'categories'
  | 'menu_items'
  | 'modifiers'
  | 'order_platforms'
  | 'currency'
  | 'selectCurrency'
  | 'turkish_lira'
  | 'us_dollar'
  | 'euro'
  | 'customCurrency'
  | 'currencySymbol'
  | 'currencyName'
  | 'printers'
  | 'printerName'
  | 'connectionType'
  | 'connectionInfo'
  | 'printerRoles'
  | 'network'
  | 'bluetooth'
  | 'usb'
  | 'other_connection'
  | 'kitchenKOT'
  | 'barKOT'
  | 'receiptPrinting'
  | 'reportPrinting'
  | 'refresh'
  | 'error'
  | 'defaultPrinterRole'
  | 'selectDefaultPrinterRole'
  | 'noDefaultRole'
  | 'localPrintServerSettings'
  | 'printServerURL'
  | 'configurePrintServerUrl'
  | 'settingsSaved'
  | 'printServerUrlUpdated'
  | 'restaurantDetailsUpdated'
  | 'saveSettings'
  | 'restaurantName'
  | 'yourRestaurantNamePlaceholder'
  | 'logoUrl'
  | 'logoUrlPlaceholder'
  | 'restaurantLogoPreviewAlt'
  | 'fetchRolesErrorDetailed'
  | 'fetchRolesErrorGeneric'
  | 'fetchRolesErrorTitle'
  | 'rolesFetchedTitle'
  | 'rolesFetchedDesc'
  | 'fetchCategoriesError'
  | 'categoryNameRequired'
  | 'addCategoryErrorTitle'
  | 'categoryAddedTitle'
  | 'categoryAddedDesc'
  | 'unexpectedErrorTitle'
  | 'addCategoryErrorDesc'
  | 'updateCategoryErrorTitle'
  | 'categoryUpdatedTitle'
  | 'categoryUpdatedDesc'
  | 'updateCategoryErrorDesc'
  | 'categoryDeletedTitle'
  | 'categoryDeletedDesc'
  | 'deleteCategoryErrorTitle'
  | 'deleteCategoryErrorDesc'
  | 'fetchingRoles'
  | 'rolesFetchErrorWarning'
  | 'manageCategoriesDesc'
  | 'refreshing'
  | 'addCategoryButton'
  | 'addNewCategoryTitle'
  | 'addNewCategoryDesc'
  | 'cancelButton'
  | 'addingButton'
  | 'loadingCategories'
  | 'categoryListCaption'
  | 'nameColumn'
  | 'iconNameColumn'
  | 'actionsColumn'
  | 'noneAbbreviation'
  | 'confirmDeleteTitle'
  | 'confirmDeleteCategoryDesc'
  | 'deleteButton'
  | 'deletingButton'
  | 'editCategoryTitle'
  | 'editCategoryDesc'
  | 'savingButton'
  | 'managePrinterRolesDesc'
  | 'addPrinterRoleButton'
  | 'addNewPrinterRoleTitle'
  | 'editPrinterRoleTitle'
  | 'addNewPrinterRoleDesc'
  | 'editPrinterRoleDesc'
  | 'roleKeyLabel'
  | 'displayNameLabel'
  | 'roleKeyEditWarning'
  | 'roleKeyFormatHint'
  | 'loadingPrinterRoles'
  | 'printerRoleListCaption'
  | 'noPrinterRolesFound'
  | 'confirmDeletePrinterRoleDesc'
  | 'manageMenuItemsDesc'
  | 'addMenuItemButton'
  | 'addNewMenuItemTitle'
  | 'editMenuItemTitle'
  | 'addNewMenuItemDesc'
  | 'editMenuItemDesc'
  | 'loadingMenuItems'
  | 'menuItemListCaption'
  | 'priceColumn'
  | 'imageColumn'
  | 'categoryColumn'
  | 'modifiersColumn'
  | 'noMenuItemsFound'
  | 'confirmDeleteMenuItemDesc';


export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
}

export interface CurrencyProviderState {
  currency: CurrencyConfig;
  setCurrency: (currency: CurrencyConfig) => void;
  formatCurrency: (amount: number) => string;
}

// Representing what's stored in the DB and used in backend actions
export interface AppPrinterRoleDefinition {
  id: string;
  roleKey: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

// For backend actions and data retrieval
export interface AppMenuCategory {
  id: string;
  name: string;
  iconName?: string;
  defaultPrinterRoleId?: string; // Foreign key to PrinterRoleDefinition
  defaultPrinterRoleKey?: string; // Denormalized for convenience
  defaultPrinterRoleDisplayName?: string; // Denormalized for convenience
}

export interface AppMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  dataAiHint: string | null;
  categoryId: string;
  categoryName: string; // Denormalized
  availableModifiers: { id: string; name: string; priceChange: number }[];
  defaultPrinterRoleId?: string; // Foreign key to PrinterRoleDefinition
  defaultPrinterRoleKey?: string; // Denormalized for convenience
  defaultPrinterRoleDisplayName?: string; // Denormalized for convenience
  createdAt: Date;
  updatedAt: Date;
}


export interface ElectronKotItem {
  name: string;
  quantity: number;
  modifiers?: string[];
  specialRequests?: string;
}

export interface ElectronKotPayload {
  printerRole: string; // This will now be the roleKey (e.g., "KITCHEN_KOT") or "NO_ROLE_DEFINED"
  orderId: string;
  tableNumber: number;
  items: ElectronKotItem[];
  timestamp: string; // ISO Date string
}

    