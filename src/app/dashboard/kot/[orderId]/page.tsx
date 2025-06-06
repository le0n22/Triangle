
import type { KOT, AppOrderItem as FrontendOrderItem } from '@/types';
import { KotView } from '@/components/features/kot-generation/kot-view';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAppOrderByIdAction, type AppOrder } from '@backend/actions/orderActions';

interface KotPageProps {
  params: {
    orderId: string;
  };
  searchParams: {
    delta?: string;
  };
}

interface QueryDeltaItem {
  n: string; // menuItemName
  q: number; // quantity (current quantity)
  oq?: number; // oldQuantity (if changed)
  m?: string[]; // selectedModifiers (formatted string list)
  s?: string; // specialRequests
  st: 'new' | 'modified' | 'deleted'; // status of the item in delta
}

// Helper function to format selected modifiers for KOT (from QueryDeltaItem)
function formatDeltaModifiersForKot(modifiers: QueryDeltaItem['m']): string[] | undefined {
    if (!modifiers || modifiers.length === 0) {
        return undefined;
    }
    return modifiers;
}

// Helper function to format selected modifiers for KOT (from AppOrderItem)
function formatAppOrderModifiersForKot(modifiers: FrontendOrderItem['selectedModifiers']): string[] | undefined {
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


export default async function KotPage({ params, searchParams }: KotPageProps) {
  console.log(`--- KOT PAGE: KotPage Server Component EXECUTION START ---`);
  
  const orderIdFromParams = params?.orderId; 
  console.log(`--- KOT PAGE: Extracted orderIdFromParams: >>${orderIdFromParams}<< ---`);

  const deltaQueryParam = searchParams?.delta;
  console.log(`--- KOT PAGE: Received searchParams.delta: >>${deltaQueryParam}<< ---`);

  let deltaKOTItems: QueryDeltaItem[] | null = null;
  if (deltaQueryParam) {
    try {
      const parsedDelta = JSON.parse(decodeURIComponent(deltaQueryParam));
      if (Array.isArray(parsedDelta) && parsedDelta.length > 0) {
        deltaKOTItems = parsedDelta as QueryDeltaItem[];
        console.log(`--- KOT PAGE: Parsed deltaKOTItems: ---`, JSON.stringify(deltaKOTItems, null, 2));
      } else {
        console.log(`--- KOT PAGE: Parsed delta is empty or not an array. Delta:`, parsedDelta);
      }
    } catch (error) {
      console.error(`--- KOT PAGE: Error parsing delta query param:`, error);
    }
  }

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

  if (appOrderResult === null) { 
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
  let kotItemsForView: KOT['items'];

  if (deltaKOTItems && deltaKOTItems.length > 0) {
    console.log(`--- KOT PAGE: Using DELTA items for KOT. Delta items count: ${deltaKOTItems.length} ---`);
    kotItemsForView = deltaKOTItems.map(item => {
        let namePrefix = "";
        if (item.st === 'new') namePrefix = "(NEW) ";
        else if (item.st === 'modified') namePrefix = `(MODIFIED ${item.oq ?? ''} -> ${item.q}) `;
        else if (item.st === 'deleted') namePrefix = `(DELETED ${item.oq ?? ''}x) `;
        
        return {
            name: `${namePrefix}${item.n}`,
            quantity: item.q, 
            modifiers: formatDeltaModifiersForKot(item.m),
            specialRequests: item.s || undefined,
        };
    });
  } else {
    console.log(`--- KOT PAGE: No valid delta items found, using FULL order items for KOT. ---`);
    kotItemsForView = appOrder.items.map(item => ({
      name: item.menuItemName,
      quantity: item.quantity,
      modifiers: formatAppOrderModifiersForKot(item.selectedModifiers),
      specialRequests: item.specialRequests || undefined,
    }));
  }


  const kotData: KOT = {
    id: `kot-${appOrder.id.substring(0,8)}-${new Date(appOrder.createdAt).getTime().toString().slice(-5)}`,
    orderId: appOrder.id,
    tableNumber: appOrder.tableNumber,
    items: kotItemsForView,
    createdAt: appOrder.createdAt.toString(), 
  };
  
  console.log(`--- KOT PAGE: Successfully created KOT data for orderId: ${appOrder.id}. KOT ID: ${kotData.id} ---`);
  console.log(`--- KOT PAGE: KOT Items Count: ${kotData.items.length}. Items:`, JSON.stringify(kotData.items.map(i => `${i.quantity}x ${i.name}`), null, 2));
  
  console.log(`--- KOT PAGE: Rendering KotView with KOT ID: ${kotData.id} for orderId: ${orderIdFromParams} and tableId: ${appOrder.tableId} ---`);
  return (
    <div className="container mx-auto">
      <KotView kot={kotData} orderId={orderIdFromParams} actualTableId={appOrder.tableId} />
    </div>
  );
}
