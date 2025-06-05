
import type { Order, OrderItem, Modifier } from '@/types';
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
    status: 'paid',
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
    status: 'preparing',
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
    status: 'pending',
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
    status: 'served',
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
    status: 'cancelled',
    subtotal: 16.50,
    taxRate: 0.08,
    taxAmount: 1.32,
    totalAmount: 17.82,
    createdAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 0.4 * 60 * 60 * 1000).toISOString(),
  },
];

const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'paid':
      return 'default'; // Primary color (blue in this theme)
    case 'preparing':
      return 'secondary'; // Accent color (teal)
    case 'served':
      return 'outline'; // Muted foreground on card background
    case 'pending':
      return 'default'; // Use secondary for pending to distinguish from paid
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusBadgeTextClass = (status: OrderStatus): string => {
  switch (status) {
    case 'paid':
      return 'text-primary-foreground';
    case 'preparing':
      return 'text-accent-foreground'; // Changed from secondary-foreground
    case 'served':
      return 'text-foreground';
    case 'pending':
      return 'text-secondary-foreground';
    case 'cancelled':
      return 'text-destructive-foreground';
    default:
      return 'text-muted-foreground';
  }
}


export default function OrdersPage() {
  const orders = mockOrders; // In a real app, fetch orders

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
                      {order.status}
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
