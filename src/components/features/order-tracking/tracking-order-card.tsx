
'use client';

import type { ExternalOrder, ExternalOrderStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { PackageCheck, Ban, CookingPot, Bike, CheckCircle, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency'; // Import useCurrency

interface TrackingOrderCardProps {
  order: ExternalOrder;
  onUpdateStatus: (orderId: string, newStatus: ExternalOrderStatus) => void;
}

const statusDetails: Record<ExternalOrderStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDING_CONFIRMATION: { label: 'Pending Confirmation', icon: AlertCircle, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  PREPARING: { label: 'Preparing', icon: CookingPot, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', icon: PackageCheck, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  ON_THE_WAY: { label: 'On The Way', icon: Bike, color: 'bg-primary/20 text-primary border-primary/30' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  CANCELLED_BY_RESTAURANT: { label: 'Cancelled (Restaurant)', icon: Ban, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  CANCELLED_BY_USER: { label: 'Cancelled (User)', icon: Ban, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};


export function TrackingOrderCard({ order, onUpdateStatus }: TrackingOrderCardProps) {
  const currentStatusDetail = statusDetails[order.status];
  const StatusIcon = currentStatusDetail.icon;
  const { formatCurrency } = useCurrency(); // Use the hook

  return (
    <Card className={`shadow-md ${currentStatusDetail.color}`}>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-headline flex items-center">
              <StatusIcon className="w-5 h-5 mr-2" /> {order.platform} - {order.platformOrderId}
            </CardTitle>
            <CardDescription className="text-xs">
              Placed: {format(parseISO(order.placedAt), 'MMM d, hh:mm a')} | Customer: {order.customerName}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`capitalize text-xs ${currentStatusDetail.color} border-current`}>
            {currentStatusDetail.label}
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 text-sm">
        <p className="font-medium mb-1">Address: <span className="font-normal text-muted-foreground">{order.customerAddress}</span></p>
        {order.customerPhoneNumber && <p className="font-medium mb-2">Phone: <span className="font-normal text-muted-foreground">{order.customerPhoneNumber}</span></p>}
        
        <div className="mb-2">
          <h5 className="font-semibold mb-1">Items:</h5>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5 text-xs">
            {order.items.map(item => (
              <li key={item.id}>
                {item.quantity}x {item.name} - {formatCurrency(item.totalPrice)}
                {item.notes && <span className="block pl-4 text-accent text-xs">Note: {item.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
        {order.notes && <p className="text-xs text-amber-600 mt-2">Customer Notes: {order.notes}</p>}
      </CardContent>
      <CardFooter className="p-3 flex flex-wrap gap-2">
        {order.status === 'PENDING_CONFIRMATION' && (
          <>
            <Button size="sm" onClick={() => onUpdateStatus(order.id, 'PREPARING')} className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700">Accept Order</Button>
            <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(order.id, 'CANCELLED_BY_RESTAURANT')} className="flex-1 min-w-[120px]">Reject Order</Button>
          </>
        )}
        {order.status === 'PREPARING' && (
          <Button size="sm" onClick={() => onUpdateStatus(order.id, 'READY_FOR_PICKUP')} className="w-full bg-blue-600 hover:bg-blue-700">Mark Ready for Pickup</Button>
        )}
        {order.status === 'READY_FOR_PICKUP' && (
          <Button size="sm" onClick={() => onUpdateStatus(order.id, 'ON_THE_WAY')} className="w-full bg-purple-600 hover:bg-purple-700">Mark Out for Delivery</Button>
        )}
        {order.status === 'ON_THE_WAY' && (
          <Button size="sm" onClick={() => onUpdateStatus(order.id, 'DELIVERED')} className="w-full bg-teal-600 hover:bg-teal-700">Mark Delivered</Button>
        )}
        {(order.status === 'PREPARING' || order.status === 'READY_FOR_PICKUP') && 
         !['CANCELLED_BY_RESTAURANT', 'CANCELLED_BY_USER', 'DELIVERED'].includes(order.status) && (
          <Button size="sm" variant="outline" onClick={() => onUpdateStatus(order.id, 'CANCELLED_BY_RESTAURANT')} className="w-full mt-2 border-destructive text-destructive hover:bg-destructive/10">Cancel Order</Button>
        )}
      </CardFooter>
    </Card>
  );
}
