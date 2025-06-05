
'use client';

import type { ExternalOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, MapPin, CheckCircle, XCircle, Info, Edit3 } from 'lucide-react';
import { platformIconMap } from './platform-icons';
import { format, parseISO } from 'date-fns';

interface OrderDetailPanelProps {
  order: ExternalOrder | null;
}

export function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  if (!order) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 text-muted-foreground rounded-r-lg p-6">
        <Info className="w-10 h-10 mr-4" />
        <p className="text-lg">Select an order to view details.</p>
      </div>
    );
  }

  const PlatformIcon = platformIconMap[order.platform] || platformIconMap.default;

  const handleApprove = () => {
    console.log("Approve order:", order.id);
    // Placeholder for approve logic
  };

  const handleCancel = () => {
    console.log("Cancel order:", order.id);
    // Placeholder for cancel logic
  };

  const handleEditOrder = () => {
    console.log("Edit order:", order.id);
    // Placeholder for edit logic
  }

  return (
    <Card className="h-full flex flex-col shadow-lg rounded-r-lg bg-background text-foreground overflow-hidden">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <PlatformIcon className="w-10 h-10" />
            <div>
              <CardTitle className="text-lg font-semibold">
                {format(parseISO(order.placedAt), 'HH:mm')} {order.shortCode} - {order.customerName}
              </CardTitle>
              <CardDescription className="text-sm">{order.paymentServiceType}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleEditOrder} className="text-muted-foreground hover:text-primary">
            <Edit3 className="h-5 w-5" />
            <span className="sr-only">Edit Order</span>
          </Button>
        </div>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {order.customerPhoneNumber && (
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-1.5" /> {order.customerPhoneNumber}
            </div>
          )}
          <div className="flex items-start">
            <MapPin className="w-3 h-3 mr-1.5 mt-0.5 shrink-0" /> {order.customerAddress}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white w-full">
            <CheckCircle className="mr-2 h-4 w-4" /> Onayla
          </Button>
          <Button onClick={handleCancel} variant="destructive" className="w-full">
            <XCircle className="mr-2 h-4 w-4" /> İptal Et
          </Button>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-2 text-sm">Order Items:</h4>
          <ul className="space-y-1.5">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center text-sm pb-1 border-b border-border/50 last:border-b-0">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium">₺{item.totalPrice.toFixed(2)}</span>
              </li>
            ))}
             {order.items.length === 0 && <p className="text-xs text-muted-foreground">No items in this order.</p>}
          </ul>
        </div>

        {order.notes && (
          <div>
            <Separator className="my-2" />
            <h4 className="font-semibold mb-1 text-sm">Sipariş Notu:</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">{order.notes}</p>
          </div>
        )}
      </CardContent>
      <div className="p-4 border-t border-border text-right">
         <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span>₺{order.totalAmount.toFixed(2)}</span>
          </div>
      </div>
    </Card>
  );
}
