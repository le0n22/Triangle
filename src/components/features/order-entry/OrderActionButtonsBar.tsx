
'use client';

import type { Order } from '@/types';
import { ActionButton } from './ActionButton';
import {
  SplitSquareHorizontal,
  Printer,
  Percent,
  ArrowRightLeft,
  Ban,
  CreditCard,
  ChevronLeft,
  Save,
  Send,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface OrderActionButtonsBarProps {
  order: Order | null;
  isSaving: boolean;
  onSplitBill: () => void;
  onPrintBill: () => void;
  onApplyDiscount: () => void;
  onTransferTable: () => void;
  onCancelOrder: () => Promise<void>;
  onConfirmOrder: () => Promise<void>;
  onGoToPayment: () => Promise<void>;
  onBackToTables: () => void;
}

export function OrderActionButtonsBar({
  order,
  isSaving,
  onSplitBill,
  onPrintBill,
  onApplyDiscount,
  onTransferTable,
  onCancelOrder,
  onConfirmOrder,
  onGoToPayment,
  onBackToTables,
}: OrderActionButtonsBarProps) {
  if (!order) return null;

  const noItems = order.items.length === 0;
  const isOrderPersisted = order.id && !order.id.startsWith('temp-ord-');
  const isOrderClosed = order.status === 'PAID' || order.status === 'CANCELLED';
  
  const allItemsQuantityZero = order.items.every(item => item.quantity === 0);
  const effectiveNoItems = noItems || (isOrderPersisted && allItemsQuantityZero);


  return (
    <div className="flex flex-col h-full bg-background p-3 space-y-2 overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          Icon={SplitSquareHorizontal}
          label="Split Bill"
          onClick={onSplitBill}
          disabled={effectiveNoItems || isSaving || isOrderClosed}
        />
        <ActionButton
          Icon={Printer}
          label="Print Bill"
          onClick={onPrintBill}
          disabled={effectiveNoItems || isSaving || isOrderClosed}
        />
        <ActionButton
          Icon={Percent}
          label="Discount"
          onClick={onApplyDiscount}
          disabled={effectiveNoItems || isSaving || isOrderClosed}
        />
        <ActionButton
          Icon={ArrowRightLeft}
          label="Transfer Table"
          onClick={onTransferTable}
          disabled={effectiveNoItems || isSaving || isOrderClosed}
        />
        <ActionButton
          Icon={isSaving ? Loader2 : Ban}
          label="Cancel Order"
          onClick={onCancelOrder}
          disabled={isSaving}
          className={isSaving ? "animate-spin" : "text-destructive border-destructive hover:bg-destructive/10"}
          iconClassName={isSaving ? "animate-spin" : "text-destructive"}
        />
         <ActionButton
          Icon={ChevronLeft}
          label="Back to Tables"
          onClick={onBackToTables}
          disabled={isSaving}
        />
      </div>
      
      <div className="mt-auto pt-2 space-y-2 border-t border-border">
        <ActionButton
            Icon={isSaving && order.id.startsWith('temp-ord-') ? Loader2 : Send}
            label={isOrderPersisted ? 'Update & KOT' : 'Confirm & KOT'}
            onClick={onConfirmOrder}
            disabled={effectiveNoItems || isSaving || isOrderClosed}
            className={cn(
              "bg-accent hover:bg-accent/90 text-accent-foreground w-full h-20",
              (isSaving && order.id.startsWith('temp-ord-')) && "animate-spin"
            )}
            iconClassName={(isSaving && order.id.startsWith('temp-ord-')) ? "animate-spin" : ""}
        />
        <ActionButton
            Icon={isSaving && !order.id.startsWith('temp-ord-') ? Loader2 : CreditCard}
            label="Go to Payment"
            onClick={onGoToPayment}
            disabled={effectiveNoItems || isSaving || !isOrderPersisted || isOrderClosed}
            className={cn(
              "bg-primary hover:bg-primary/90 text-primary-foreground w-full h-20",
              (isSaving && !order.id.startsWith('temp-ord-')) && "animate-spin"
            )}
            iconClassName={(isSaving && !order.id.startsWith('temp-ord-')) ? "animate-spin" : ""}
        />
      </div>
    </div>
  );
}
