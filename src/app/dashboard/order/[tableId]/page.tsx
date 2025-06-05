import type { MenuCategory, Order, MenuItem, Modifier } from '@/types';
import { OrderPanel } from '@/components/features/order-entry/order-panel';

// Mock data for menu items and categories (can be moved to a shared file)
const mockModifiers: Modifier[] = [
  { id: 'mod1', name: 'Extra Cheese', priceChange: 1.50 },
  { id: 'mod2', name: 'No Onions', priceChange: 0.00 },
  { id: 'mod3', name: 'Spicy', priceChange: 0.50 },
  { id: 'mod4', name: 'Large Size', priceChange: 2.00 },
];

const mockMenuCategories: MenuCategory[] = [
  {
    id: 'cat1', name: 'Appetizers', items: [
      { id: 'item1', name: 'Spring Rolls', description: 'Crispy veggie rolls.', price: 8.99, category: 'Appetizers', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'spring rolls', availableModifiers: [mockModifiers[1]] },
      { id: 'item2', name: 'Garlic Bread', description: 'Toasted with garlic butter.', price: 6.50, category: 'Appetizers', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'garlic bread', availableModifiers: [mockModifiers[0]] },
    ]
  },
  {
    id: 'cat2', name: 'Main Courses', items: [
      { id: 'item3', name: 'Grilled Salmon', description: 'Salmon with vegetables.', price: 22.00, category: 'Main Courses', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'grilled salmon', availableModifiers: [mockModifiers[2]] },
      { id: 'item4', name: 'Margherita Pizza', description: 'Classic tomato and mozzarella.', price: 15.00, category: 'Main Courses', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'pizza food', availableModifiers: [mockModifiers[0], mockModifiers[2]] },
    ]
  },
   {
    id: 'cat3', name: 'Beverages', items: [
      { id: 'item5', name: 'Coca-Cola', description: 'Refreshing Coke.', price: 3.00, category: 'Beverages', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'soda drink', availableModifiers: [mockModifiers[3]] },
      { id: 'item6', name: 'Orange Juice', description: 'Freshly squeezed OJ.', price: 5.00, category: 'Beverages', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'orange juice', availableModifiers: [] },
    ]
  },
];

// Mock function to fetch or create an order for a table
async function getOrderForTable(tableId: string): Promise<Order | null> {
  // Simulate fetching existing order or creating a new one
  if (tableId === 't2') { // Assume table t2 has an existing order
    return {
      id: 'ord456',
      tableId: 't2',
      tableNumber: 2,
      items: [
        { 
          id: 'oi1',
          menuItemId: 'item3', 
          menuItemName: 'Grilled Salmon', 
          quantity: 1, 
          unitPrice: 22.00, 
          selectedModifiers: [], 
          totalPrice: 22.00,
          specialRequests: 'Extra crispy skin'
        },
      ],
      status: 'pending',
      subtotal: 22.00,
      taxRate: 0.08,
      taxAmount: 1.76,
      totalAmount: 23.76,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  // For other tables, or if 'new' is part of the logic, return null to indicate a new order
  return null; 
}

interface OrderPageProps {
  params: {
    tableId: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { tableId } = params;
  // In a real app, fetch initial order and menu categories data
  const initialOrder = await getOrderForTable(tableId);
  const menuItems = mockMenuCategories;

  return (
    // The OrderPanel itself handles heights via flex, so ensure its parent allows it to fill.
    // The DashboardLayout already sets up a main area.
    <OrderPanel tableId={tableId} initialOrder={initialOrder} menuCategories={menuItems} />
  );
}

export async function generateStaticParams() {
  // For ISR/SSG, pre-render some table order pages. Not strictly necessary for this POS.
  // Example: return [{ tableId: 't1' }, { tableId: 't2' }];
  return [];
}
