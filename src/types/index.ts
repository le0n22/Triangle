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

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // Category name, might change to categoryId if needed for filtering
  imageUrl?: string;
  dataAiHint?: string; // For placeholder images
  availableModifiers?: Modifier[]; // Modifiers that can be applied to this item
  categoryId: string;
  defaultPrinterRole?: PrinterRole | null; // Added field
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

export interface MenuCategory {
  id: string;
  name: string;
  iconName?: string; // Key for a lucide icon or custom SVG
  items: MenuItem[];
  defaultPrinterRole?: PrinterRole | null;
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
  // Printer related keys are removed as settings page is removed
  // | 'printers'
  // | 'printerName'
  // | 'connectionType'
  // | 'connectionInfo'
  // | 'printerRoles'
  // | 'network'
  // | 'bluetooth'
  // | 'usb'
  // | 'other_connection'
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
  | 'savingButton';


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

export type PrinterRole = 'KITCHEN_KOT' | 'BAR_KOT' | 'RECEIPT' | 'REPORT';
export const printerRoles: PrinterRole[] = ['KITCHEN_KOT', 'BAR_KOT', 'RECEIPT', 'REPORT'];

export interface ElectronKotItem {
  name: string;
  quantity: number;
  modifiers?: string[];
  specialRequests?: string;
}

export interface ElectronKotPayload {
  printerRole: PrinterRole | 'NO_ROLE_DEFINED';
  orderId: string;
  tableNumber: number;
  items: ElectronKotItem[];
  timestamp: string; // ISO Date string
}