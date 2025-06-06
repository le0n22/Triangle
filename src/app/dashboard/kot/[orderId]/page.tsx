
import type { KOT, AppOrderItem as FrontendOrderItem } from '@/types';
import { KotView } from '@/components/features/kot-generation/kot-view';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAppOrderByIdAction, type AppOrder } from '@backend/actions/orderActions';

interface KotPageProps {
  params: {
    orderId: string;
  };
}

// Helper function to format selected modifiers for KOT
function formatKotModifiers(modifiers: FrontendOrderItem['selectedModifiers']): string[] | undefined {
    if (!modifiers || modifiers.length === 0) {
        return undefined;
    }
    return modifiers.map(mod => {
        let modifierString = mod.name;
        if (mod.priceChange !== 0) {
            modifierString += ` (${mod.priceChange > 0 ? '+' : '-'}$${Math.abs(mod.priceChange).toFixed(2)})`;
        }
        return modifierString;
    });
}


export default async function KotPage({ params }: KotPageProps) {
  console.log(`--- KOT PAGE: KotPage Server Component EXECUTION START ---`);
  
  const orderIdFromParams = params?.orderId; 
  console.log(`--- KOT PAGE: Extracted orderIdFromParams: >>${orderIdFromParams}<< ---`);

  if (!orderIdFromParams || typeof orderIdFromParams !== 'string' || orderIdFromParams.trim() === "") {
    console.error(`--- KOT PAGE: Invalid or missing orderId in params. orderIdFromParams: >>${orderIdFromParams}<< ---`);
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-destructive">Error: Invalid Order ID</h1>
        <p className="text-muted-foreground">The Order ID provided in the URL is invalid or missing.</p>
        <Link href="/dashboard/tables">
            <Button className="mt-4">Go to Tables</Button>
        </Link>
      </div>
    );
  }

  const appOrderResult = await getAppOrderByIdAction(orderIdFromParams);
  console.log(`--- KOT PAGE: Result from getAppOrderByIdAction for orderId ${orderIdFromParams}:`, 
              appOrderResult ? (('error' in appOrderResult) ? `Error: ${appOrderResult.error}` : `Order status ${appOrderResult.status}, items: ${appOrderResult.items.length}`) : 'null (Order not found by action)');


  if (!appOrderResult || ('error' in appOrderResult && appOrderResult.error)) {
    const errorMessage = appOrderResult && 'error' in appOrderResult ? appOrderResult.error : 'Order data could not be fetched or order not found.';
    console.error(`--- KOT PAGE: Error fetching order or order not found for ID: >>${orderIdFromParams}<<. Error: ${errorMessage} ---`);
     return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-destructive">KOT Generation Failed</h1>
        <p className="text-muted-foreground">{errorMessage}</p>
        <p className="text-sm text-muted-foreground">Could not generate KOT for order ID "{orderIdFromParams}".</p>
        <Link href="/dashboard/tables">
            <Button className="mt-4">Go to Tables</Button>
        </Link>
      </div>
    );
  }

  if (appOrderResult === null) { // Explicitly checking for null if order not found by action
    console.error(`--- KOT PAGE: Order with ID >>${orderIdFromParams}<< not found by getAppOrderByIdAction (returned null). ---`);
     return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-destructive">KOT Generation Failed</h1>
        <p className="text-muted-foreground">Order with ID "{orderIdFromParams}" not found.</p>
        <Link href="/dashboard/tables">
            <Button className="mt-4">Go to Tables</Button>
        </Link>
      </div>
    );
  }

  const appOrder = appOrderResult as AppOrder;

  const kotData: KOT = {
    id: `kot-${appOrder.id.substring(0,8)}-${new Date(appOrder.createdAt).getTime().toString().slice(-5)}`,
    orderId: appOrder.id,
    tableNumber: appOrder.tableNumber,
    items: appOrder.items.map(item => ({
      name: item.menuItemName,
      quantity: item.quantity,
      modifiers: formatKotModifiers(item.selectedModifiers),
      specialRequests: item.specialRequests || undefined,
    })),
    createdAt: appOrder.createdAt.toString(), 
  };
  
  console.log(`--- KOT PAGE: Successfully created KOT data for orderId: ${appOrder.id}. KOT ID: ${kotData.id} ---`);
  console.log(`--- KOT PAGE: KOT Items Count: ${kotData.items.length}. Items:`, JSON.stringify(kotData.items.map(i => `${i.quantity}x ${i.name}`), null, 2));
  
  console.log(`--- KOT PAGE: Rendering KotView with KOT ID: ${kotData.id} for orderId: ${orderIdFromParams} ---`);
  return (
    <div className="container mx-auto">
      <KotView kot={kotData} orderId={orderIdFromParams} />
    </div>
  );
}

