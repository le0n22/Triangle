import type { KOT } from '@/types';
import { KotView } from '@/components/features/kot-generation/kot-view';
// import { redirect } from 'next/navigation'; // No longer redirecting from here, showing message instead
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock function to generate/fetch KOT data for an order
async function getKotForOrder(orderId: string): Promise<KOT | null> {
  // More direct logging
  console.log(`--- KOT PAGE: getKotForOrder CALLED ---`);
  console.log(`--- KOT PAGE: getKotForOrder received orderId: >>${orderId}<< ---`);

  if (!orderId || typeof orderId !== 'string' || orderId.trim() === "") {
    console.error(`--- KOT PAGE: getKotForOrder - INVALID orderId received: >>${orderId}<<. Returning null. ---`);
    return null;
  }

  // Simulate KOT generation based on orderId
  // For now, as long as we have an orderId, return a mock KOT.
  // In a real app, you would fetch order details from the DB using this orderId.
  const mockKotData: KOT = {
    id: `kot-${orderId.substring(0,8)}-${Date.now().toString().slice(-5)}`, // Make ID more readable
    orderId: orderId,
    tableNumber: Math.floor(Math.random() * 10) + 1, // Random table number for mock
    items: [
      { name: 'Mock Item A', quantity: Math.floor(Math.random() * 3) + 1, specialRequests: 'Mock request A' },
      { name: 'Mock Item B', quantity: Math.floor(Math.random() * 2) + 1, modifiers: ["Mock Mod X"] },
    ],
    createdAt: new Date().toISOString(),
  };
  console.log(`--- KOT PAGE: getKotForOrder successfully generated mock KOT for orderId: >>${orderId}<< ---`);
  return mockKotData;
}


interface KotPageProps {
  params: {
    orderId: string;
  };
}

export default async function KotPage({ params }: KotPageProps) {
  console.log(`--- KOT PAGE: KotPage Server Component EXECUTION START ---`);
  console.log(`--- KOT PAGE: Received params object:`, JSON.stringify(params, null, 2));

  const orderIdFromParams = params?.orderId; // Safely access orderId

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
  
  const kot = await getKotForOrder(orderIdFromParams);
  console.log(`--- KOT PAGE: Result from getKotForOrder:`, kot ? `KOT ID ${kot.id}` : 'null');

  if (!kot) {
    console.error(`--- KOT PAGE: KOT data is null for orderId: >>${orderIdFromParams}<<. Displaying 'Not Found' message. ---`);
     return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-destructive">KOT Not Found</h1>
        <p className="text-muted-foreground">Could not generate or find KOT for order ID "{orderIdFromParams}".</p>
        <Link href="/dashboard/tables">
            <Button className="mt-4">Go to Tables</Button>
        </Link>
      </div>
    );
  }
  
  console.log(`--- KOT PAGE: Rendering KotView with KOT ID: ${kot.id} for orderId: ${orderIdFromParams} ---`);
  return (
    <div className="container mx-auto">
      <KotView kot={kot} orderId={orderIdFromParams} />
    </div>
  );
}
