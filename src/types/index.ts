
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
  defaultPrinterRole?: PrinterRole; 
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

// Updated OrderStatus
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
  defaultPrinterRole?: PrinterRole; 
}

export type PaymentMethod = 'cash' | 'card' | 'mobile';

// For Order Tracking System
export type ExternalOrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED_BY_RESTAURANT'
  | 'CANCELLED_BY_USER';

export interface ExternalOrderItem {
  id: string; // Could be platform's item ID or an internal one
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  modifiers?: { name: string; price: number }[]; // Simplified modifiers
}

export interface ExternalOrder {
  id: string; // Internal unique ID for this tracked order
  platform: string; // e.g., "Trendyol GO", "Yemeksepeti"
  platformOrderId: string; // The ID from the external platform
  customerName: string;
  customerAddress: string; // Simplified for now
  customerPhoneNumber?: string;
  items: ExternalOrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee?: number; // Optional fee charged by the platform
  totalAmount: number; // Amount paid by customer
  restaurantPayout?: number; // Amount restaurant receives
  status: ExternalOrderStatus;
  placedAt: string; // ISO Date string
  estimatedDeliveryTime?: string; // ISO Date string
  notes?: string; // Customer notes or special instructions
  paymentServiceType?: string; // e.g., "Card - Delivery", "Nakit - Paket Servis"
  shortCode?: string; // e.g., "P-9" / platform order ID fragment
  platformIcon?: React.ElementType; // Component for platform icon
}

export interface DeliveryPlatform {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  isEnabled: boolean;
  icon?: React.ElementType; // Optional: for displaying platform logo
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
  | 'restaurantSettings' // This key means "Restaurant" tab title or general settings page title
  | 'restaurantDetails' // New: For the card title "Restaurant Details"
  | 'manageRestaurantNameLogo' // New: For the description of the restaurant details card
  | 'saveChanges' // New: For the button in the restaurant details card
  | 'appearanceSettings'
  | 'tableManagementSettings'
  | 'categoryManagementSettings'
  | 'menuItemManagementSettings'
  | 'modifierManagementSettings'
  | 'orderPlatformSettings'
  | 'restaurant' // This is often used as a tab title
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
  | 'localPrintServerSettings' // New or re-affirmed
  | 'printServerURL' // New or re-affirmed
  | 'configurePrintServerUrl' // New or re-affirmed
  | 'settingsSaved' // New or re-affirmed (toast title)
  | 'printServerUrlUpdated' // New or re-affirmed (toast description)
  | 'restaurantDetailsUpdated' // New (toast description for restaurant details)
  | 'saveSettings'; // New or re-affirmed (generic save button, or specifically for print server)


export interface CurrencyConfig {
  symbol: string;
  code: string; // e.g., 'TRY', 'USD', 'EUR', 'CUSTOM'
  name: string; // e.g., 'Turkish Lira', 'US Dollar'
}

export interface CurrencyProviderState {
  currency: CurrencyConfig;
  setCurrency: (currency: CurrencyConfig) => void;
  formatCurrency: (amount: number) => string;
}

// Printer Configuration Types
export type PrinterConnectionType = 'NETWORK' | 'BLUETOOTH' | 'USB' | 'OTHER';
export const printerConnectionTypes: PrinterConnectionType[] = ['NETWORK', 'BLUETOOTH', 'USB', 'OTHER'];

export type PrinterRole = 'KITCHEN_KOT' | 'BAR_KOT' | 'RECEIPT' | 'REPORT';
export const printerRoles: PrinterRole[] = ['KITCHEN_KOT', 'BAR_KOT', 'RECEIPT', 'REPORT'];

export interface PrinterConfiguration {
  id: string;
  name: string;
  connectionType: PrinterConnectionType;
  connectionInfo: string;
  roles: PrinterRole[];
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}
