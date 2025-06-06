
'use client';

import type { Order, OrderItem, Modifier } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Edit3, PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrentOrderSummaryProps {
  order: Order | null;
  initialOrderSnapshot?: Order | null; 
  onUpdateItemQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItemModifiers: (item: OrderItem) => void;
  isSaving: boolean;
}

const areModifierArraysEqual = (arr1: Modifier[], arr2: Modifier[]): boolean => {
  if (!arr1 && !arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  const ids1 = arr1.map(m => m.id).sort();
  const ids2 = arr2.map(m => m.id).sort();
  return ids1.every((id, index) => id === ids2[index]);
};

export function CurrentOrderSummary({
  order,
  initialOrderSnapshot,
  onUpdateItemQuantity,
  onRemoveItem,
  onEditItemModifiers,
  isSaving
}: CurrentOrderSummaryProps) {
  if (!order) {
    return (
      <div className="p-6 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
        <Loader2 className="w-16 h-16 mb-4 text-primary animate-spin" />
        <p className="text-lg">Loading order details...</p>
      </div>
    );
  }

  const noItemsCurrentlyInOrder = order.items.filter(item => item.quantity > 0).length === 0;
  const isOrderPersisted = order.id && !order.id.startsWith('temp-ord-');
  const isOrderClosed = order.status === 'PAID' || order.status === 'CANCELLED';

  const formatModifiers = (modifiers: Modifier[]) => {
    if (!modifiers || modifiers.length === 0) return null;
    return modifiers.map(m => `${m.name}${m.priceChange !== 0 ? ` (${m.priceChange > 0 ? '+' : '-'}$${Math.abs(m.priceChange).toFixed(2)})` : ''}`).join(', ');
  };

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground p-4">
      <h3 className="text-xl font-headline font-semibold mb-4">
        Order for Table {order.tableNumber}
        {isOrderPersisted && !isOrderClosed && <span className="ml-2 text-xs font-normal text-green-500">(Saved)</span>}
        {isOrderClosed && <span className="ml-2 text-xs font-normal text-destructive uppercase">({order.status})</span>}
      </h3>
      <ScrollArea className="flex-grow mb-4 pr-2">
        {noItemsCurrentlyInOrder ? (
          <div className="flex-grow flex flex-col justify-center items-center text-center text-muted-foreground p-6">
            <ShoppingCartIcon className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-lg">No items in the current order.</p>
            <p className="text-sm">Select items from the menu to get started.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {order.items.map((item) => {
              if (item.quantity === 0 && !item.id.startsWith('item-')) {
                return null;
              }
              if (item.quantity === 0 && item.id.startsWith('item-')) {
                return null;
              }

              const initialItem = initialOrderSnapshot?.items.find(snapItem => snapItem.id === item.id);
              let itemState: 'new' | 'modified' | 'unchanged' = 'unchanged';

              if (!initialItem && item.id.startsWith('item-')) {
                itemState = 'new';
              } else if (initialItem && (
                item.quantity !== initialItem.quantity ||
                item.specialRequests !== initialItem.specialRequests ||
                !areModifierArraysEqual(item.selectedModifiers, initialItem.selectedModifiers)
              )) {
                itemState = 'modified';
              } else if (!initialItem && !item.id.startsWith('item-')) {
                itemState = 'new';
              }

              const itemClasses = cn(
                "p-3 rounded-md border transition-all duration-300 ease-in-out",
                itemState === 'new' && "bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/60 shadow-md",
                itemState === 'modified' && "bg-yellow-500/10 border-yellow-500/40 ring-1 ring-yellow-500/60 shadow-md",
                itemState === 'unchanged' && "bg-background/50 border-border opacity-80 hover:opacity-100"
              );

              return (
                <li key={item.id} className={itemClasses}>
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
                    {!isOrderClosed && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => onEditItemModifiers(item)} className="h-7 w-7" disabled={isSaving}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} className="h-7 w-7" disabled={isSaving}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {!isOrderClosed && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateItemQuantity(item.id, Math.max(0, item.quantity - 1))} disabled={isSaving || (item.quantity === 1 && item.id.startsWith('item-'))}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateItemQuantity(item.id, item.quantity + 1)} disabled={isSaving}>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>

      {!noItemsCurrentlyInOrder && (
        <>
          <Separator className="my-3 bg-border/50" />
          <div className="space-y-1 text-sm mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({(order.taxRate * 100).toFixed(0)}%):</span>
              <span>${order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-primary">
              <span>Total:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
      
      {isOrderClosed && (
        <p className="text-center text-muted-foreground py-4 mt-auto border-t border-border">
          This order is {order.status.toLowerCase()}. No further actions can be taken.
        </p>
      )}
      {noItemsCurrentlyInOrder && !isOrderClosed && (
        <p className="text-center text-muted-foreground py-4 mt-auto border-t border-border">
          Add items to the order to enable actions.
        </p>
      )}
    </div>
  );
}

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
  );
}
