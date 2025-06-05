
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'dirty';

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  currentOrderId?: string;
}

export interface Modifier {
  id: string;
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
