import type { Order } from '@/types';
import { PaymentInterface } from '@/components/features/payment-processing/payment-interface';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Added import for Button

// Mock function to fetch order details
async function getOrderDetails(orderId: string): Promise<Order | null> {
  // Simulate API call
  if (orderId === 'ord456' || orderId.startsWith('ord-')) { // Example valid order IDs
    return {
      id: orderId,
      tableId: 't2', // Example
      tableNumber: 2,
      items: [
        { id: 'oi1', menuItemId: 'item3', menuItemName: 'Grilled Salmon', quantity: 1, unitPrice: 22.00, selectedModifiers: [], totalPrice: 22.00, specialRequests: '' },
        { id: 'oi2', menuItemId: 'item5', menuItemName: 'Coca-Cola', quantity: 2, unitPrice: 3.00, selectedModifiers: [], totalPrice: 6.00, specialRequests: '' },
      ],
      status: 'pending', // Status before payment
      subtotal: 28.00,
      taxRate: 0.08,
      taxAmount: 2.24,
      totalAmount: 30.24,
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
      updatedAt: new Date().toISOString(),
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
    // redirect('/dashboard/tables'); // Or show a "Order not found" message
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
