
'use client';

import type { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SplitSquareHorizontal,
  Printer,
  Percent,
  ArrowRightLeft,
  Ban,
  ChevronLeft,
  Save,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderActionSidebarProps {
  order: Order | null;
  isSaving: boolean;
  onSplitBill: () => void;
  onPrintBill: () => void;
  onApplyDiscount: () => void;
  onTransferTable: () => void;
  onCancelOrder: () => Promise<void>;
  onBackToTables: () => void;
  onConfirmOrder: () => Promise<void>;
  onGoToPayment: () => Promise<void>;
}

interface ActionButtonConfig {
  label: string;
  icon: React.ElementType;
  onClick: () => void | Promise<void>;
  isDisabled: (order: Order | null, isSaving: boolean) => boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "destructive-outline";
  className?: string;
  showSpinner?: boolean;
}

export function OrderActionSidebar({
  order,
  isSaving,
  onSplitBill,
  onPrintBill,
  onApplyDiscount,
  onTransferTable,
  onCancelOrder,
  onBackToTables,
  onConfirmOrder,
  onGoToPayment,
}: OrderActionSidebarProps) {

  const noItemsCurrentlyInOrder = !order || order.items.filter(item => item.quantity > 0).length === 0;
  const isOrderPersisted = order && order.id && !order.id.startsWith('temp-ord-');
  const isOrderClosed = order && (order.status === 'PAID' || order.status === 'CANCELLED');
  const allItemsQuantityZero = order && order.items.every(item => item.quantity === 0);
  const effectiveNoItemsForActions = noItemsCurrentlyInOrder || (isOrderPersisted && allItemsQuantityZero);

  const actionButtons: ActionButtonConfig[] = [
    { label: 'Split Bill', icon: SplitSquareHorizontal, onClick: onSplitBill, isDisabled: (o, s) => effectiveNoItemsForActions || s || !!isOrderClosed, variant: 'outline' },
    { label: 'Print Bill', icon: Printer, onClick: onPrintBill, isDisabled: (o, s) => effectiveNoItemsForActions || s || !!isOrderClosed, variant: 'outline' },
    { label: 'Discount', icon: Percent, onClick: onApplyDiscount, isDisabled: (o, s) => effectiveNoItemsForActions || s || !!isOrderClosed, variant: 'outline' },
    { label: 'Transfer', icon: ArrowRightLeft, onClick: onTransferTable, isDisabled: (o, s) => s || !!isOrderClosed, variant: 'outline' }, // Transfer might be allowed on empty persisted order
    { label: 'Cancel Order', icon: Ban, onClick: onCancelOrder, isDisabled: (o, s) => s || !!isOrderClosed, variant: 'destructive-outline', showSpinner: true },
    { label: 'Back to Tables', icon: ChevronLeft, onClick: onBackToTables, isDisabled: (o, s) => s, variant: 'outline' },
  ];

  const mainActionButtons: ActionButtonConfig[] = [
     { 
      label: isOrderPersisted ? 'Update & KOT' : 'Confirm & KOT', 
      icon: Save, 
      onClick: onConfirmOrder, 
      isDisabled: (o, s) => effectiveNoItemsForActions || s || !!isOrderClosed, 
      variant: 'default', // Primary button style
      className: "bg-primary hover:bg-primary/90 text-primary-foreground",
      showSpinner: true 
    },
    { 
      label: 'To Payment', 
      icon: CreditCard, 
      onClick: onGoToPayment, 
      isDisabled: (o, s) => effectiveNoItemsForActions || s || !isOrderPersisted || !!isOrderClosed, 
      variant: 'success', // Custom variant or direct styling for green
      className: "bg-green-600 hover:bg-green-700 text-white",
      showSpinner: true 
    },
  ];


  if (!order) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 border-l border-border bg-card space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm text-center">Loading actions...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex flex-col border-l border-border bg-card text-card-foreground p-2 space-y-1.5">
      <ScrollArea className="flex-grow">
        <div className="grid grid-cols-2 gap-1.5">
          {actionButtons.map((btn) => (
            <Button
              key={btn.label}
              variant={btn.variant || 'outline'}
              onClick={btn.onClick}
              disabled={btn.isDisabled(order, isSaving)}
              className={cn(
                "h-20 w-full flex flex-col items-center justify-center p-1 text-xs leading-tight",
                btn.className
              )}
            >
              {isSaving && btn.showSpinner ? <Loader2 className="h-5 w-5 animate-spin mb-1" /> : <btn.icon className="h-5 w-5 mb-1" />}
              <span className="text-center">{btn.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="pt-1.5 mt-auto space-y-1.5 border-t border-border">
        {mainActionButtons.map((btn) => (
           <Button
              key={btn.label}
              variant={btn.variant === 'success' ? 'default' : (btn.variant || 'default')} // Map success to default for Button, style with className
              onClick={btn.onClick}
              disabled={btn.isDisabled(order, isSaving)}
              className={cn(
                "w-full h-14 text-sm",
                btn.className // Apply custom styles for green button etc.
              )}
            >
              {isSaving && btn.showSpinner ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <btn.icon className="mr-2 h-5 w-5" />}
              {btn.label}
            </Button>
        ))}
      </div>
       {isOrderClosed && (
        <p className="text-center text-xs text-muted-foreground py-2 mt-1 border-t border-border">
          Order is {order.status.toLowerCase()}. No further actions.
        </p>
      )}
    </div>
  );
}
