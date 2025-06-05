
import type { Order, OrderItem, Modifier, OrderStatus } from '@/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for orders (replace with actual data fetching in a real app)
const mockOrders: Order[] = [
  {
    id: 'ord123',
    tableId: 't2',
    tableNumber: 2,
    items: [
      { id: 'oi1', menuItemId: 'item3', menuItemName: 'Grilled Salmon', quantity: 1, unitPrice: 22.00, selectedModifiers: [], totalPrice: 22.00, specialRequests: 'Well done' },
      { id: 'oi2', menuItemId: 'item8', menuItemName: 'Coca-Cola', quantity: 2, unitPrice: 3.00, selectedModifiers: [], totalPrice: 6.00 },
    ],
    status: 'PAID',
    subtotal: 28.00,
    taxRate: 0.08,
    taxAmount: 2.24,
    totalAmount: 30.24,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord456',
    tableId: 't6',
    tableNumber: 6,
    items: [
      { id: 'oi3', menuItemId: 'item4', menuItemName: 'Margherita Pizza', quantity: 1, unitPrice: 15.00, selectedModifiers: [{id: 'mod1', name: 'Extra Cheese', priceChange: 1.50}], totalPrice: 16.50 },
      { id: 'oi4', menuItemId: 'item1', menuItemName: 'Spring Rolls', quantity: 1, unitPrice: 8.99, selectedModifiers: [], totalPrice: 8.99 },
    ],
    status: 'IN_PROGRESS',
    subtotal: 25.49,
    taxRate: 0.08,
    taxAmount: 2.04,
    totalAmount: 27.53,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord789',
    tableId: 't10',
    tableNumber: 10,
    items: [
      { id: 'oi5', menuItemId: 'item5', menuItemName: 'Chicken Pasta', quantity: 2, unitPrice: 18.50, selectedModifiers: [], totalPrice: 37.00 },
    ],
    status: 'OPEN',
    subtotal: 37.00,
    taxRate: 0.08,
    taxAmount: 2.96,
    totalAmount: 39.96,
    createdAt: new Date(Date.now() - 0.25 * 60 * 60 * 1000).toISOString(), // 15 mins ago
    updatedAt: new Date(Date.now() - 0.25 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord101',
    tableId: 't1',
    tableNumber: 1,
    items: [
      { id: 'oi6', menuItemId: 'item7', menuItemName: 'Tiramisu', quantity: 1, unitPrice: 8.50, selectedModifiers: [], totalPrice: 8.50 },
    ],
    status: 'DONE',
    subtotal: 8.50,
    taxRate: 0.08,
    taxAmount: 0.68,
    totalAmount: 9.18,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  },
   {
    id: 'ord112',
    tableId: 't3',
    tableNumber: 3,
    items: [
      { id: 'oi7', menuItemId: 'item2', menuItemName: 'Garlic Bread', quantity: 1, unitPrice: 6.50, selectedModifiers: [], totalPrice: 6.50 },
      { id: 'oi8', menuItemId: 'item9', menuItemName: 'Fresh Orange Juice', quantity: 2, unitPrice: 5.00, selectedModifiers: [], totalPrice: 10.00 },
    ],
    status: 'CANCELLED',
    subtotal: 16.50,
    taxRate: 0.08,
    taxAmount: 1.32,
    totalAmount: 17.82,
    createdAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 0.4 * 60 * 60 * 1000).toISOString(),
  },
];

const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" | "accent" => {
  switch (status) {
    case 'OPEN':
      return 'secondary'; // Cool Dark Gray for pending-like state
    case 'IN_PROGRESS':
      return 'default';   // Vibrant Electric Blue for active state
    case 'DONE':
      return 'outline';   // Card background with foreground text for completed pre-payment
    case 'PAID':
      return 'accent';    // Cool Teal for final success state
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusBadgeTextClass = (status: OrderStatus): string => {
  switch (status) {
    case 'OPEN':
      return 'text-secondary-foreground';
    case 'IN_PROGRESS':
      return 'text-primary-foreground';
    case 'DONE':
      return 'text-foreground'; // Default text on outline badge
    case 'PAID':
      return 'text-accent-foreground';
    case 'CANCELLED':
      return 'text-destructive-foreground';
    default:
      return 'text-muted-foreground';
  }
}


export default function OrdersPage() {
  const orders = mockOrders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold mb-8 text-center">Order History</h1>
      <Card className="bg-card text-card-foreground shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableCaption className="py-4">A list of recent orders.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead className="text-center">Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{order.id.substring(0,8)}...</TableCell>
                  <TableCell className="text-center">{order.tableNumber}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)} className={`${getStatusBadgeTextClass(order.status)} capitalize`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                  <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{format(parseISO(order.createdAt), 'MMM d, hh:mm a')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {orders.length === 0 && (
        <p className="text-center text-muted-foreground mt-10 text-lg">No orders found.</p>
      )}
    </div>
  );
}
