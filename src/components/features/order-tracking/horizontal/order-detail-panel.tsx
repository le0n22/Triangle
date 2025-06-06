
'use client';

import type { ExternalOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, MapPin, CheckCircle, XCircle, Info, Edit3 } from 'lucide-react';
import { platformIconMap } from './platform-icons';
import { format, parseISO } from 'date-fns';
import { useCurrency } from '@/hooks/useCurrency'; // Import useCurrency

interface OrderDetailPanelProps {
  order: ExternalOrder | null;
}

export function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  const { formatCurrency, currency } = useCurrency(); // Use the hook

  if (!order) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-card text-muted-foreground rounded-r-lg p-6">
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
    <Card className="h-full flex flex-col shadow-lg rounded-r-lg bg-card text-card-foreground overflow-hidden">
      <CardHeader className="p-3 border-b border-border shrink-0"> {/* Reduced padding */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 min-w-0"> {/* Reduced gap */}
            <PlatformIcon className="w-8 h-8 shrink-0" /> {/* Reduced icon size */}
            <div className="min-w-0"> 
              <CardTitle className="text-base font-semibold truncate"> {/* Adjusted font size */}
                {order.shortCode} - {order.customerName}
              </CardTitle>
              <CardDescription className="text-xs truncate">{order.paymentServiceType}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleEditOrder} className="text-muted-foreground hover:text-primary shrink-0 h-7 w-7"> {/* Adjusted button size */}
            <Edit3 className="h-4 w-4" />
            <span className="sr-only">Edit Order</span>
          </Button>
        </div>
        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground"> {/* Reduced margin and spacing */}
          {order.customerPhoneNumber && (
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-1.5 shrink-0" /> {order.customerPhoneNumber}
            </div>
          )}
          <div className="flex items-start">
            <MapPin className="w-3 h-3 mr-1.5 mt-0.5 shrink-0" /> {order.customerAddress}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow min-h-0 p-4 space-y-4 overflow-y-auto">
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
          <h4 className="font-semibold mb-1 text-sm">Order Items:</h4>
          <ul className="space-y-1">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center text-xs pb-0.5 border-b border-border/50 last:border-b-0">
                <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                {/* Using currency.symbol directly here as formatCurrency adds it */}
                <span className="font-medium whitespace-nowrap">{currency.symbol}{item.totalPrice.toFixed(2)}</span>
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
    </Card>
  );
}
