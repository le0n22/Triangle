
'use client';

import type { ExternalOrder } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { platformIconMap } from './platform-icons';
import { AlertCircle, Ban, CheckCircle, CookingPot } from 'lucide-react';

interface HorizontalOrderListItemProps {
  order: ExternalOrder;
  isSelected: boolean;
  onSelect: () => void;
}

const statusBadgeConfig: Record<ExternalOrderStatus, { label: string; className: string; icon?: React.ElementType }> = {
  PENDING_CONFIRMATION: { label: 'Waiting', className: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle },
  PREPARING: { label: 'Preparing', className: 'bg-blue-100 text-blue-700 border-blue-300', icon: CookingPot },
  READY_FOR_PICKUP: { label: 'Ready', className: 'bg-purple-100 text-purple-700 border-purple-300', icon: CheckCircle },
  ON_THE_WAY: { label: 'On The Way', className: 'bg-primary/10 text-primary border-primary/30', icon: CheckCircle },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  CANCELLED_BY_RESTAURANT: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-300 line-through', icon: Ban },
  CANCELLED_BY_USER: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 border-slate-300 line-through', icon: Ban },
};


export function HorizontalOrderListItem({ order, isSelected, onSelect }: HorizontalOrderListItemProps) {
  const PlatformIcon = platformIconMap[order.platform] || platformIconMap.default;
  const statusConfig = statusBadgeConfig[order.status] || { label: order.status, className: 'bg-gray-200 text-gray-700 border-gray-400' };
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        "flex items-center p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
        isSelected && "bg-primary/10 ring-2 ring-primary"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <PlatformIcon className="w-8 h-8 mr-3 shrink-0" />
      <div className="flex-grow grid grid-cols-[auto_1fr_auto] items-center gap-x-2 text-sm">
        <div className="flex flex-col">
          <span className="font-medium text-xs">{format(parseISO(order.placedAt), 'HH:mm')} {order.shortCode}</span>
          <span className="font-semibold truncate text-card-foreground">{order.customerName}</span>
          <span className="text-xs text-muted-foreground">{order.paymentServiceType}</span>
        </div>

        <Badge variant="outline" className={cn("justify-self-end text-xs py-0.5 px-2 h-fit", statusConfig.className)}>
          {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
          {statusConfig.label}
        </Badge>
        <span className="font-semibold text-right text-card-foreground">₺{order.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}
