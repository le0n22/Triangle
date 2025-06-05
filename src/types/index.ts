

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'dirty';

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  currentOrderId?: string;
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
  category: string;
  imageUrl?: string;
  dataAiHint?: string; // For placeholder images
  availableModifiers?: Modifier[]; // Modifiers that can be applied to this item
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

