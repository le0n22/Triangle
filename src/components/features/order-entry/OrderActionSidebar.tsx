
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
  if (!order) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 border-l border-border bg-card">
        <p className="text-muted-foreground">Loading actions...</p>
      </div>
    );
  }

  const noItemsCurrentlyInOrder = order.items.filter(item => item.quantity > 0).length === 0;
  const isOrderPersisted = order.id && !order.id.startsWith('temp-ord-');
  const isOrderClosed = order.status === 'PAID' || order.status === 'CANCELLED';
  const allItemsQuantityZero = order.items.every(item => item.quantity === 0);
  // Disable actions if there are effectively no items to act upon, or if order is closed/saving
  const baseActionDisabled = effectiveNoItemsForActions || isSaving || isOrderClosed;
  const effectiveNoItemsForActions = noItemsCurrentlyInOrder || (isOrderPersisted && allItemsQuantityZero);


  const actionButtons = [
    { label: 'Split Bill', icon: SplitSquareHorizontal, onClick: onSplitBill, disabled: baseActionDisabled, variant: 'outline' as const },
    { label: 'Print Bill', icon: Printer, onClick: onPrintBill, disabled: baseActionDisabled, variant: 'outline' as const },
    { label: 'Discount', icon: Percent, onClick: onApplyDiscount, disabled: baseActionDisabled, variant: 'outline' as const },
    { label: 'Transfer Table', icon: ArrowRightLeft, onClick: onTransferTable, disabled: isSaving || isOrderClosed, variant: 'outline' as const },
    { label: 'Back to Tables', icon: ChevronLeft, onClick: onBackToTables, disabled: isSaving, variant: 'outline' as const },
    { 
      label: 'Cancel Order', 
      icon: isSaving && order.id.startsWith('temp-ord-') ? Loader2 : Ban, 
      onClick: onCancelOrder, 
      disabled: isSaving && !order.id.startsWith('temp-ord-') || isOrderClosed, 
      variant: 'destructive-outline' as const,
      iconClassName: isSaving && order.id.startsWith('temp-ord-') ? "animate-spin" : ""
    },
  ];

  return (
    <div className="w-full h-full flex flex-col border-l border-border bg-card text-card-foreground p-3 space-y-2">
      <ScrollArea className="flex-grow">
        <div className="space-y-2">
          {actionButtons.map((btn) => (
            <Button
              key={btn.label}
              variant={btn.variant}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={cn("w-full justify-start h-12 text-sm", btn.variant === 'destructive-outline' && "border-destructive text-destructive hover:bg-destructive/10")}
            >
              <btn.icon className={cn("mr-3 h-5 w-5", btn.iconClassName)} />
              {btn.label}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="pt-2 mt-auto space-y-2 border-t border-border">
        <Button
          onClick={onConfirmOrder}
          size="lg"
          className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={effectiveNoItemsForActions || isSaving || isOrderClosed}
        >
          {isSaving && order.id.startsWith('temp-ord-') ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          {isOrderPersisted ? 'Update & KOT' : 'Confirm & KOT'}
        </Button>
        <Button
          onClick={onGoToPayment}
          size="lg"
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white"
          disabled={effectiveNoItemsForActions || isSaving || !isOrderPersisted || isOrderClosed}
        >
          {isSaving && isOrderPersisted ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
