
import type { Order } from '@/types';
import { PaymentInterface } from '@/components/features/payment-processing/payment-interface';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


// Mock function to fetch order details
async function getOrderDetails(orderId: string): Promise<Order | null> {
  // Simulate API call
  // Example: order 'ord456' is used in KDS and leads here
  if (orderId === 'ord456' || orderId.startsWith('ord-') || orderId === 'ord101') { 
    const baseOrder: Omit<Order, 'items' | 'subtotal' | 'taxAmount' | 'totalAmount'> = {
      id: orderId,
      tableId: 't6', 
      tableNumber: 6,
      status: 'DONE', // Status before payment
      taxRate: 0.08,
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), 
      updatedAt: new Date().toISOString(),
    };

    let items: Order['items'] = [];
    if (orderId === 'ord456') {
      items = [
        { id: 'oi3', menuItemId: 'item4', menuItemName: 'Margherita Pizza', quantity: 1, unitPrice: 15.00, selectedModifiers: [{id: 'mod1', name: 'Extra Cheese', priceChange: 1.50}], totalPrice: 16.50 },
        { id: 'oi4', menuItemId: 'item1', menuItemName: 'Spring Rolls', quantity: 1, unitPrice: 8.99, selectedModifiers: [], totalPrice: 8.99 },
      ];
      baseOrder.tableId = 't6';
      baseOrder.tableNumber = 6;
    } else if (orderId === 'ord101') { // Another example order
      items = [
        { id: 'oi6', menuItemId: 'item7', menuItemName: 'Tiramisu', quantity: 1, unitPrice: 8.50, selectedModifiers: [], totalPrice: 8.50 },
      ];
      baseOrder.tableId = 't1';
      baseOrder.tableNumber = 1;
    } else { // Default for generic ord-
       items = [
        { id: 'oi1', menuItemId: 'item3', menuItemName: 'Grilled Salmon', quantity: 1, unitPrice: 22.00, selectedModifiers: [], totalPrice: 22.00, specialRequests: '' },
        { id: 'oi2', menuItemId: 'item5', menuItemName: 'Coca-Cola', quantity: 2, unitPrice: 3.00, selectedModifiers: [], totalPrice: 6.00, specialRequests: '' },
      ];
      baseOrder.tableId = 't2';
      baseOrder.tableNumber = 2;
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * baseOrder.taxRate;
    const totalAmount = subtotal + taxAmount;

    return {
      ...baseOrder,
      items,
      subtotal,
      taxAmount,
      totalAmount,
    };
  }
  return null;
}

interface PaymentPageProps {
  params: {
    orderId: string;
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { orderId } = params;
  const order = await getOrderDetails(orderId);

  if (!order) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-destructive">Order Not Found</h1>
        <p className="text-muted-foreground">The order with ID "{orderId}" could not be found.</p>
        <Link href="/dashboard/tables">
          <Button className="mt-4">Go to Tables</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <PaymentInterface order={order} />
    </div>
  );
}
