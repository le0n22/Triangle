
'use client';

import type { Order, OrderStatus } from '@/types';
import { KdsOrderCard } from '@/components/features/kds/kds-order-card';
import { RefreshCw, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

// Mock data for KDS - using new statuses
const initialMockActiveOrders: Order[] = [
   {
    id: 'ord456',
    tableId: 't6',
    tableNumber: 6,
    items: [
      { id: 'oi3', menuItemId: 'item4', menuItemName: 'Margherita Pizza', quantity: 1, unitPrice: 15.00, selectedModifiers: [{id: 'mod1', name: 'Extra Cheese', priceChange: 1.50}], totalPrice: 16.50, specialRequests: 'Extra crispy base' },
      { id: 'oi4', menuItemId: 'item1', menuItemName: 'Spring Rolls', quantity: 1, unitPrice: 8.99, selectedModifiers: [], totalPrice: 8.99 },
      { id: 'oi9', menuItemId: 'item8', menuItemName: 'Coca-Cola', quantity: 3, unitPrice: 3.00, selectedModifiers: [], totalPrice: 9.00 },
    ],
    status: 'IN_PROGRESS',
    subtotal: 34.49,
    taxRate: 0.08,
    taxAmount: 2.76,
    totalAmount: 37.25,
    createdAt: new Date(Date.now() - 0.15 * 60 * 60 * 1000).toISOString(), // 9 mins ago
    updatedAt: new Date(Date.now() - 0.05 * 60 * 60 * 1000).toISOString(), // 3 mins ago (marked IN_PROGRESS)
  },
  {
    id: 'ord789',
    tableId: 't10',
    tableNumber: 10,
    items: [
      { id: 'oi5', menuItemId: 'item5', menuItemName: 'Chicken Pasta', quantity: 2, unitPrice: 18.50, selectedModifiers: [], totalPrice: 37.00, specialRequests: 'No garlic' },
      { id: 'oi10', menuItemId: 'item6', menuItemName: 'Orange Juice', quantity: 1, unitPrice: 5.00, selectedModifiers: [], totalPrice: 5.00 },
    ],
    status: 'OPEN',
    subtotal: 42.00,
    taxRate: 0.08,
    taxAmount: 3.36,
    totalAmount: 45.36,
    createdAt: new Date(Date.now() - 0.05 * 60 * 60 * 1000).toISOString(), // 3 mins ago
    updatedAt: new Date(Date.now() - 0.05 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ordSpecial',
    tableId: 't1',
    tableNumber: 1,
    items: [
      { id: 'oi11', menuItemId: 'item3', menuItemName: 'Grilled Salmon', quantity: 1, unitPrice: 22.00, selectedModifiers: [], totalPrice: 22.00, specialRequests: 'Allergic to nuts, ensure no cross-contamination.' },
      { id: 'oi12', menuItemId: 'item2', menuItemName: 'Garlic Bread', quantity: 1, unitPrice: 6.50, selectedModifiers: [{id: 'mod2', name: 'No Onions', priceChange: 0.00}], totalPrice: 6.50 },
    ],
    status: 'OPEN',
    subtotal: 28.50,
    taxRate: 0.08,
    taxAmount: 2.28,
    totalAmount: 30.78,
    createdAt: new Date(Date.now() - 0.02 * 60 * 60 * 1000).toISOString(), // ~1 min ago
    updatedAt: new Date(Date.now() - 0.02 * 60 * 60 * 1000).toISOString(),
  },
];


export default function KdsPage() {
  const [activeOrders, setActiveOrders] = useState<Order[]>(initialMockActiveOrders);

  useEffect(() => {
    // Sort orders by oldest first whenever activeOrders change
    setActiveOrders(prevOrders =>
      [...prevOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
  }, []); // Initial sort

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setActiveOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Re-sort after update
    );
    console.log(`Order ${orderId} status updated to ${newStatus}`);
  };
  
  // Filter for KDS: OPEN, IN_PROGRESS, and DONE orders.
  // CANCELLED and PAID orders are filtered out.
  const kdsRelevantOrders = activeOrders.filter(
    order => order.status === 'OPEN' || order.status === 'IN_PROGRESS' || order.status === 'DONE'
  );

  return (
    <div className="container mx-auto py-6 px-2 md:px-4 h-[calc(100vh-var(--header-height,4rem))] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold">Kitchen Display</h1>
        <Button variant="outline" size="icon" onClick={() => window.location.reload()} title="Refresh Orders">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {kdsRelevantOrders.length > 0 ? (
        <div className="flex-grow overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {kdsRelevantOrders.map((order) => (
                <KdsOrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateOrderStatus}
                />
            ))}
            </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <ChefHat className="w-24 h-24 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No active orders for the kitchen.</p>
          <p className="text-sm text-muted-foreground">New orders will appear here automatically.</p>
        </div>
      )}
    </div>
  );
}
