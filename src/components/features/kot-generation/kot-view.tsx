'use client';

import type { KOT } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns'; // For formatting date/time
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface KotViewProps {
  kot: KOT;
  orderId: string; // To link back to order or payment
}

export function KotView({ kot, orderId }: KotViewProps) {
  const router = useRouter();
  const handlePrint = () => {
    // Basic browser print
    window.print();
  };
  
  const handleContinueToPayment = () => {
    router.push(`/dashboard/payment/${orderId}`);
  };

  return (
    <div className="max-w-md mx-auto py-8 print:py-0">
      <Card className="shadow-lg bg-card text-card-foreground print:shadow-none print:border-none">
        <CardHeader className="text-center border-b border-border pb-4 print:border-black">
          <CardTitle className="text-2xl font-headline font-bold">KITCHEN ORDER TICKET</CardTitle>
          <CardDescription className="text-sm">
            KOT ID: {kot.id.substring(0,8)}... | Order: {kot.orderId.substring(0,8)}...
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4 print:p-2">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Table: {kot.tableNumber}</span>
            <span>{format(new Date(kot.createdAt), 'PPpp')}</span>
          </div>
          <Separator className="my-3 bg-border/50 print:bg-gray-300" />
          <div>
            <h4 className="text-lg font-semibold mb-2">Items:</h4>
            <ul className="space-y-2">
              {kot.items.map((item, index) => (
                <li key={index} className="pb-2 mb-2 border-b border-dashed border-border/70 print:border-gray-400 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <span className="text-base font-medium">{item.quantity}x {item.name}</span>
                  </div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <p className="text-xs text-muted-foreground pl-2">- Modifiers: {item.modifiers.join(', ')}</p>
                  )}
                  {item.specialRequests && (
                    <p className="text-xs text-accent pl-2">- Requests: {item.specialRequests}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
           <p className="text-center text-xs text-muted-foreground pt-4 print:hidden">
            --- End of KOT ---
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t border-border print:hidden">
          <Link href={`/dashboard/order/${orderId}?tableId=t${kot.tableNumber}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order
            </Button>
          </Link>
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print KOT
          </Button>
          <Button onClick={handleContinueToPayment} className="w-full sm:flex-grow bg-primary hover:bg-primary/90 text-primary-foreground">
            <CheckCircle className="mr-2 h-4 w-4" /> Continue to Payment
          </Button>
        </CardFooter>
      </Card>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
           main, header, aside { display: none !important; }
           /* Ensure card content in print-container is visible */
           .print-container .bg-card { background-color: white !important; color: black !important; }
           .print-container .text-card-foreground { color: black !important; }
           .print-container .text-primary { color: #5D4037 !important; /* A dark gold for print */ }
           .print-container .text-accent { color: #795548 !important; /* A dark sienna for print */ }
           .print-container .text-muted-foreground { color: #616161 !important; }
           .print-container .border-border, .print-container .border-black, .print-container .border-dashed { border-color: #BDBDBD !important; }
        }
      `}</style>
      <div className="print-container hidden print:block"> {/* Wrapper for print styles */}
         <Card className="shadow-none border-none bg-card text-card-foreground">
            <CardHeader className="text-center border-b border-black pb-4">
              <CardTitle className="text-2xl font-headline font-bold">KITCHEN ORDER TICKET</CardTitle>
              <CardDescription className="text-sm">
                KOT ID: {kot.id.substring(0,8)}... | Order: {kot.orderId.substring(0,8)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Table: {kot.tableNumber}</span>
                <span>{format(new Date(kot.createdAt), 'PPpp')}</span>
              </div>
              <Separator className="my-3 bg-border/50" />
              <div>
                <h4 className="text-lg font-semibold mb-2">Items:</h4>
                <ul className="space-y-2">
                  {kot.items.map((item, index) => (
                    <li key={index} className="pb-2 mb-2 border-b border-dashed border-border/70 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <span className="text-base font-medium">{item.quantity}x {item.name}</span>
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-xs text-muted-foreground pl-2">- Modifiers: {item.modifiers.join(', ')}</p>
                      )}
                      {item.specialRequests && (
                        <p className="text-xs text-accent pl-2">- Requests: {item.specialRequests}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
