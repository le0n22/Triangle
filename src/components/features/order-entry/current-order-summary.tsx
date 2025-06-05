'use client';

import type { Order, OrderItem, Modifier } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Edit3, PlusCircle, MinusCircle } from 'lucide-react';

interface CurrentOrderSummaryProps {
  order: Order | null;
  onUpdateItemQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItemModifiers: (item: OrderItem) => void; // To open modifier modal
}

export function CurrentOrderSummary({ order, onUpdateItemQuantity, onRemoveItem, onEditItemModifiers }: CurrentOrderSummaryProps) {
  if (!order || order.items.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
        <ShoppingCartIcon className="w-16 h-16 mb-4 text-gray-400" />
        <p className="text-lg">No items in the current order.</p>
        <p className="text-sm">Select items from the menu to get started.</p>
      </div>
    );
  }

  const formatModifiers = (modifiers: Modifier[]) => {
    if (!modifiers || modifiers.length === 0) return null;
    return modifiers.map(m => `${m.name} (${m.priceChange >= 0 ? '+' : '-'}$${Math.abs(m.priceChange).toFixed(2)})`).join(', ');
  };

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground p-4">
      <h3 className="text-xl font-headline font-semibold mb-4">Current Order (Table {order.tableNumber})</h3>
      <ScrollArea className="flex-grow mb-4 pr-2">
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="p-3 rounded-md border border-border bg-background/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{item.menuItemName}</p>
                  <p className="text-xs text-muted-foreground">
                    ${item.unitPrice.toFixed(2)} x {item.quantity} = ${item.totalPrice.toFixed(2)}
                  </p>
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <p className="text-xs text-primary mt-1">
                      Modifiers: {formatModifiers(item.selectedModifiers)}
                    </p>
                  )}
                  {item.specialRequests && (
                    <p className="text-xs text-accent mt-1">Requests: {item.specialRequests}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                   <Button variant="ghost" size="icon" onClick={() => onEditItemModifiers(item)} className="h-7 w-7">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} className="h-7 w-7">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateItemQuantity(item.id, Math.max(0, item.quantity - 1))}>
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="text-sm w-6 text-center">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateItemQuantity(item.id, item.quantity + 1)}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <Separator className="my-3 bg-border/50" />
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({ (order.taxRate * 100).toFixed(0) }%):</span>
          <span>${order.taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base text-primary">
          <span>Total:</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// Helper Icon (not in lucide-react)
function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" />
    </svg>
  )
}
