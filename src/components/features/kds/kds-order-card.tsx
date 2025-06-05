
'use client';

import type { Order } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button'; // For future actions

interface KdsOrderCardProps {
  order: Order;
  // onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void; // Future use
}

export function KdsOrderCard({ order }: KdsOrderCardProps) {
  const timeSinceOrder = formatDistanceToNow(parseISO(order.createdAt), { addSuffix: true });

  const cardBorderColor = order.status === 'preparing' ? 'border-accent' : 'border-primary';

  return (
    <Card className={`flex flex-col h-full shadow-lg bg-card text-card-foreground border-2 ${cardBorderColor}`}>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-headline">Table {order.tableNumber}</CardTitle>
          <span className={`text-sm font-medium ${order.status === 'preparing' ? 'text-accent' : 'text-primary'}`}>
            {order.status.toUpperCase()}
          </span>
        </div>
        <CardDescription className="text-xs">
          Order ID: {order.id.substring(0, 7)}... | {timeSinceOrder}
        </CardDescription>
      </CardHeader>
      <Separator />
      <ScrollArea className="flex-grow">
        <CardContent className="p-4 space-y-2">
          <ul className="space-y-2.5">
            {order.items.map((item) => (
              <li key={item.id} className="pb-2 border-b border-dashed border-border/70 last:border-b-0">
                <div className="flex justify-between items-start">
                  <span className="text-base font-semibold">{item.quantity}x {item.menuItemName}</span>
                </div>
                {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                  <p className="text-xs text-muted-foreground pl-2">
                    - {item.selectedModifiers.map(m => `${m.name} (${m.priceChange >= 0 ? '+' : '-'}$${Math.abs(m.priceChange).toFixed(2)})`).join(', ')}
                  </p>
                )}
                {item.specialRequests && (
                  <p className="text-xs text-accent pl-2 font-medium">- Requests: {item.specialRequests}</p>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </ScrollArea>
      <Separator />
      <CardFooter className="p-3 flex gap-2 print:hidden">
        {/* Placeholder for future action buttons */}
        {order.status === 'pending' && (
          <Button 
            size="sm" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
            // onClick={() => onUpdateStatus(order.id, 'preparing')}
          >
            Mark Preparing
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            // onClick={() => onUpdateStatus(order.id, 'served')}
          >
            Mark Served/Ready
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

