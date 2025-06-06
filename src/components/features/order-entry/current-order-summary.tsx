
'use client';

import type { Order, OrderItem, Modifier } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  Edit3, 
  PlusCircle, 
  MinusCircle, 
  Printer, 
  CreditCard, 
  ChevronLeft,
  SplitSquareHorizontal,
  Percent,
  ArrowRightLeft,
  Ban,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CurrentOrderSummaryProps {
  order: Order | null;
  initialOrderSnapshot?: Order | null; // Optional snapshot of the order when it was loaded
  onUpdateItemQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItemModifiers: (item: OrderItem) => void;
  onConfirmOrder: () => Promise<void>;
  onGoToPayment: () => Promise<void>;
  onCancelOrder: () => Promise<void>;
  isSaving: boolean;
}

// Helper function to compare modifier arrays by their IDs and count
const areModifierArraysEqual = (arr1: Modifier[], arr2: Modifier[]): boolean => {
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
  onConfirmOrder,
  onGoToPayment,
  onCancelOrder,
  isSaving
}: CurrentOrderSummaryProps) {
  const { toast } = useToast();

  const handleSplitBill = () => {
    if (!order || order.items.length === 0) return;
    console.log('Action: Split Bill for order', order.id);
    toast({ title: 'Split Bill', description: 'Functionality to split the bill would be here.' });
  };

  const handlePrintBill = () => {
    if (!order || order.items.length === 0) return;
    console.log('Action: Print Bill for order', order.id);
    toast({ title: 'Printing Bill...', description: 'Preparing bill for printing.' });
    window.print(); 
  };

  const handleApplyDiscount = () => {
    if (!order || order.items.length === 0) return;
    console.log('Action: Apply Discount for order', order.id);
    toast({ title: 'Apply Discount', description: 'Discount modal or controls would appear here.' });
  };

  const handleTransferTable = () => {
    if (!order) return;
    console.log('Action: Transfer Table for order', order.id);
    toast({ title: 'Transfer Table', description: `Initiating transfer for table ${order.tableNumber}.` });
  };

  if (!order) { 
    return (
      <div className="p-6 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
        <Loader2 className="w-16 h-16 mb-4 text-primary animate-spin" />
        <p className="text-lg">Loading order details...</p>
      </div>
    );
  }
  
  const noItems = order.items.length === 0;
  const isOrderPersisted = !order.id.startsWith('temp-ord-');
  const isOrderClosed = order.status === 'PAID' || order.status === 'CANCELLED';


  const formatModifiers = (modifiers: Modifier[]) => {
    if (!modifiers || modifiers.length === 0) return null;
    return modifiers.map(m => `${m.name}${m.priceChange !== 0 ? ` (${m.priceChange > 0 ? '+' : '-'}$${Math.abs(m.priceChange).toFixed(2)})` : ''}`).join(', ');
  };

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground p-4">
      <h3 className="text-xl font-headline font-semibold mb-4">
        Current Order (Table {order.tableNumber})
        {isOrderPersisted && !isOrderClosed && <span className="ml-2 text-xs font-normal text-green-500">(Saved)</span>}
        {isOrderClosed && <span className="ml-2 text-xs font-normal text-destructive">({order.status})</span>}
      </h3>
      <ScrollArea className="flex-grow mb-4 pr-2">
        {noItems ? (
            <div className="flex-grow flex flex-col justify-center items-center text-center text-muted-foreground p-6">
                <ShoppingCartIcon className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-lg">No items in the current order.</p>
                <p className="text-sm">Select items from the menu to get started.</p>
            </div>
        ) : (
            <ul className="space-y-3">
            {order.items.map((item) => {
                const initialItem = initialOrderSnapshot?.items.find(snapItem => snapItem.id === item.id);
                let itemState: 'new' | 'modified' | 'unchanged' = 'unchanged';

                if (!initialItem) {
                    itemState = 'new';
                } else if (initialItem && (
                    item.quantity !== initialItem.quantity ||
                    item.specialRequests !== initialItem.specialRequests ||
                    !areModifierArraysEqual(item.selectedModifiers, initialItem.selectedModifiers)
                )) {
                    itemState = 'modified';
                }
                
                const itemClasses = cn(
                    "p-3 rounded-md border",
                    itemState === 'new' && "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/50 shadow-sm",
                    itemState === 'modified' && "bg-yellow-500/10 border-yellow-500/30 ring-1 ring-yellow-500/50 shadow-sm",
                    itemState === 'unchanged' && "bg-background/50 border-border opacity-75 hover:opacity-100"
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
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateItemQuantity(item.id, Math.max(0, item.quantity - 1))} disabled={isSaving || (item.quantity === 1 && !initialItem) }>
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
      
      {!noItems && (
        <>
            <Separator className="my-3 bg-border/50" />
            <div className="space-y-1 text-sm mb-4">
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

            {!isOrderClosed && (
                <div className="my-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Button variant="outline" onClick={handleSplitBill} disabled={noItems || isSaving}>
                    <SplitSquareHorizontal className="mr-2 h-4 w-4" /> Split Bill
                    </Button>
                    <Button variant="outline" onClick={handlePrintBill} disabled={noItems || isSaving}>
                    <Printer className="mr-2 h-4 w-4" /> Print Bill
                    </Button>
                    <Button variant="outline" onClick={handleApplyDiscount} disabled={noItems || isSaving}>
                    <Percent className="mr-2 h-4 w-4" /> Discount
                    </Button>
                    <Button variant="outline" onClick={handleTransferTable} disabled={noItems || isSaving}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
                    </Button>
                    <Button variant="destructive-outline" onClick={onCancelOrder} disabled={isSaving} className="col-span-2 sm:col-span-1 border-destructive text-destructive hover:bg-destructive/10">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />} 
                        Cancel Order
                    </Button>
                </div>
            )}
        </>
      )}
      
      <div className="mt-auto space-y-3 pt-4 border-t border-border">
            <Link href="/dashboard/tables" passHref>
                <Button variant="outline" size="lg" className="w-full" disabled={isSaving}>
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back to Tables
                </Button>
            </Link>
            {!isOrderClosed && (
                <>
                    <Button 
                        onClick={onConfirmOrder} 
                        size="lg" 
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        disabled={noItems || isSaving}
                    >
                        {isSaving && order.id.startsWith('temp-ord-') ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Printer className="mr-2 h-5 w-5" />} 
                        {isOrderPersisted ? 'Update Order & Print KOT' : 'Confirm Order & Print KOT'}
                    </Button>
                    <Button 
                        onClick={onGoToPayment} 
                        size="lg" 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={noItems || isSaving || !isOrderPersisted}
                    >
                        {isSaving && !order.id.startsWith('temp-ord-') ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />} 
                        Proceed to Payment
                    </Button>
                </>
            )}
            {isOrderClosed && (
                <p className="text-center text-muted-foreground">This order is {order.status.toLowerCase()}.</p>
            )}
        </div>
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
  )
}
