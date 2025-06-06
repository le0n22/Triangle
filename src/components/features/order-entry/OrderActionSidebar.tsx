
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
  getLabel?: (order: Order | null) => string; // For dynamic labels
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

  const generalActionButtons: ActionButtonConfig[] = [
    { label: 'Split Bill', icon: SplitSquareHorizontal, onClick: onSplitBill, isDisabled: (o, s) => effectiveNoItemsForActions || s || !!isOrderClosed, variant: 'outline' },
    { label: 'Print Bill', icon: Printer, onClick: onPrintBill, isDisabled: (o, s) => effectiveNoItemsForActions || s || !!isOrderClosed, variant: 'outline' },
    { label: 'Discount', icon: Percent, onClick: onApplyDiscount, isDisabled: (o, s) => effectiveNoItemsForActions || s || !!isOrderClosed, variant: 'outline' },
    { label: 'Transfer', icon: ArrowRightLeft, onClick: onTransferTable, isDisabled: (o, s) => s || !!isOrderClosed, variant: 'outline' },
    { label: 'Cancel Order', icon: Ban, onClick: onCancelOrder, isDisabled: (o, s) => s || !!isOrderClosed, variant: 'destructive-outline', showSpinner: true },
  ];
  
  const navigationAndPrimaryActions: ActionButtonConfig[] = [
     { 
      label: '< Back', 
      icon: ChevronLeft, 
      onClick: onBackToTables, 
      isDisabled: (o, s) => s, 
      variant: 'outline', 
      className: "h-12 text-xs px-3" 
    },
     { 
      getLabel: (o) => (o && o.id && !o.id.startsWith('temp-ord-')) ? 'Update' : 'Confirm', 
      label: '', // Will be overridden by getLabel
      icon: Save, 
      onClick: onConfirmOrder, 
      isDisabled: (o, s) => effectiveNoItemsForActions || s || !!isOrderClosed, 
      variant: 'default',
      className: "bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-xs px-3",
      showSpinner: true 
    },
    { 
      label: 'Payment', 
      icon: CreditCard, 
      onClick: onGoToPayment, 
      isDisabled: (o, s) => effectiveNoItemsForActions || s || !(o && o.id && !o.id.startsWith('temp-ord-')) || !!isOrderClosed, 
      variant: 'success', 
      className: "bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-xs px-3",
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
        <div className="space-y-1.5"> {/* Single column layout */}
          {generalActionButtons.map((btn) => (
            <Button
              key={btn.label}
              variant={btn.variant || 'outline'}
              onClick={btn.onClick}
              disabled={btn.isDisabled(order, isSaving)}
              className={cn(
                "w-full flex flex-col items-center justify-center p-1 text-xs leading-tight h-auto py-2.5 px-3", 
                btn.className
              )}
            >
              {isSaving && btn.showSpinner ? <Loader2 className="h-5 w-5 animate-spin mb-0.5" /> : <btn.icon className="h-5 w-5 mb-0.5" />}
              <span className="text-center text-[10px]">{btn.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="pt-1.5 mt-auto space-y-1.5 border-t border-border">
        {navigationAndPrimaryActions.map((btn) => {
           const currentLabel = btn.getLabel ? btn.getLabel(order) : btn.label;
           return (
            <Button
              key={currentLabel} // Use currentLabel for key if getLabel exists
              variant={btn.variant === 'success' ? 'default' : (btn.variant || 'default')}
              onClick={btn.onClick}
              disabled={btn.isDisabled(order, isSaving)}
              className={cn(
                "w-full", 
                btn.className 
              )}
            >
              {isSaving && btn.showSpinner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <btn.icon className="mr-2 h-4 w-4" />}
              {currentLabel}
            </Button>
           );
        })}
      </div>
       {isOrderClosed && (
        <p className="text-center text-xs text-muted-foreground py-2 mt-1 border-t border-border">
          Order is {order.status.toLowerCase()}. No further actions.
        </p>
      )}
    </div>
  );
}
    