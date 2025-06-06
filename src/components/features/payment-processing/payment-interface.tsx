
'use client';

import type { Order, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Landmark, CreditCard, Smartphone, CheckCircle, Ticket } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PaymentInterfaceProps {
  order: Order;
}

const paymentMethodIcons: Record<PaymentMethod, React.ElementType> = {
  cash: Landmark,
  card: CreditCard,
  mobile: Smartphone,
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Credit/Debit Card',
  mobile: 'Mobile Payment',
};

export function PaymentInterface({ order }: PaymentInterfaceProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleProcessPayment = () => {
    if (!selectedMethod) {
      toast({ title: 'Payment method required', description: 'Please select a payment method.', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: 'Payment Successful!',
        description: `Paid $${order.totalAmount.toFixed(2)} using ${paymentMethodLabels[selectedMethod]}.`,
        className: 'bg-accent text-accent-foreground', 
      });
      // In a real app: update order status to 'paid', clear table, etc.
      // Redirect to a success page or back to tables
      router.push('/dashboard/tables'); 
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl bg-card text-card-foreground">
        <CardHeader className="text-center">
          <Ticket className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Complete Payment</CardTitle>
          <CardDescription>Order ID: {order.id.substring(0,8)}... | Table: {order.tableNumber}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">Order Summary</h4>
            <ul className="space-y-1 text-sm">
              {order.items.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.menuItemName}</span>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-3 bg-border/50" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({(order.taxRate * 100).toFixed(0)}%):</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              <Separator className="my-2 bg-border/50" />
              <div className="flex justify-between font-bold text-xl text-primary">
                <span>Total Amount Due:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Select Payment Method</h4>
            <RadioGroup 
              onValueChange={(value) => setSelectedMethod(value as PaymentMethod)} 
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              value={selectedMethod || undefined}
            >
              {(['cash', 'card', 'mobile'] as PaymentMethod[]).map((method) => {
                const Icon = paymentMethodIcons[method];
                return (
                  <Label
                    key={method}
                    htmlFor={`payment-${method}`}
                    className={`flex flex-col items-center justify-center rounded-md border-2 p-4 hover:border-primary cursor-pointer transition-all
                      ${selectedMethod === method ? 'border-primary ring-2 ring-primary bg-primary/10' : 'border-border'}`}
                  >
                    <RadioGroupItem value={method} id={`payment-${method}`} className="sr-only" />
                    <Icon className={`h-10 w-10 mb-2 ${selectedMethod === method ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">{paymentMethodLabels[method]}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6">
          <Link href={`/dashboard/order/${order.tableId}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">Back to Order</Button>
          </Link>
          <Button 
            onClick={handleProcessPayment} 
            disabled={isProcessing || !selectedMethod}
            className="w-full sm:flex-grow bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isProcessing ? 'Processing...' : `Pay $${order.totalAmount.toFixed(2)}`}
            {selectedMethod && <CheckCircle className="ml-2 h-5 w-5" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
