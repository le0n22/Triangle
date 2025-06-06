
'use client';

import type { Order, OrderStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency'; // Import useCurrency

interface KdsOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export function KdsOrderCard({ order, onUpdateStatus }: KdsOrderCardProps) {
  const timeSinceOrder = formatDistanceToNow(parseISO(order.createdAt), { addSuffix: true });
  const { currency } = useCurrency(); // Use the hook

  const getCardStyles = (status: OrderStatus) => {
    switch (status) {
      case 'OPEN':
        return { borderColor: 'border-primary', textColor: 'text-primary' };
      case 'IN_PROGRESS':
        return { borderColor: 'border-accent', textColor: 'text-accent' }; // Use accent for in progress
      case 'DONE':
        return { borderColor: 'border-muted', textColor: 'text-accent' }; // Use accent for done (ready)
      case 'CANCELLED': 
        return { borderColor: 'border-destructive', textColor: 'text-destructive' };
      default:
        return { borderColor: 'border-border', textColor: 'text-foreground' };
    }
  };

  const { borderColor, textColor } = getCardStyles(order.status);

  const formatModifierPrice = (priceChange: number) => {
    const sign = priceChange >= 0 ? '+' : '-';
    return `${sign}${currency.symbol}${Math.abs(priceChange).toFixed(2)}`;
  };

  return (
    <Card className={cn("flex flex-col h-full shadow-lg bg-card text-card-foreground border-2", borderColor)}>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-headline">Table {order.tableNumber}</CardTitle>
          <span className={cn("text-sm font-medium", textColor)}>
            {order.status.replace('_', ' ').toUpperCase()}
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
                    - {item.selectedModifiers.map(m => `${m.name} (${formatModifierPrice(m.priceChange)})`).join(', ')}
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
      <CardFooter className="p-3 flex flex-col gap-0 print:hidden"> 
        {order.status === 'OPEN' && (
          <Button
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => onUpdateStatus(order.id, 'IN_PROGRESS')}
          >
            Start Preparing
          </Button>
        )}
        {order.status === 'IN_PROGRESS' && (
          <Button
            size="sm"
            variant="outline"
            className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            onClick={() => onUpdateStatus(order.id, 'DONE')}
          >
            Set Ready
          </Button>
        )}
        {order.status === 'DONE' && (
           <p className="w-full text-center text-sm text-accent font-semibold py-2">Order Ready!</p> 
        )}

        {(order.status === 'OPEN' || order.status === 'IN_PROGRESS') && (
          <Button
            size="sm"
            variant="destructive"
            className="w-full mt-2" 
            onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
          >
            Cancel Order
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
