import type { KOT } from '@/types';
import { KotView } from '@/components/features/kot-generation/kot-view';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Added import for Link

// Mock function to generate/fetch KOT data for an order
async function getKotForOrder(orderId: string): Promise<KOT | null> {
  // Simulate KOT generation based on orderId
  if (orderId === 'ord456' || orderId.startsWith('ord-')) { // Example valid order IDs
    return {
      id: `kot-${orderId}-${Date.now()}`.substring(0,15),
      orderId: orderId,
      tableNumber: 2, // Example, should come from actual order
      items: [
        { name: 'Grilled Salmon', quantity: 1, specialRequests: 'Well done' },
        { name: 'Coca-Cola', quantity: 2, modifiers: ["Large Size"] },
        { name: 'Spring Rolls', quantity: 1, specialRequests: 'Extra crispy' },
      ],
      createdAt: new Date().toISOString(),
    };
  }
  return null;
}


interface KotPageProps {
  params: {
    orderId: string;
  };
}

export default async function KotPage({ params }: KotPageProps) {
  const { orderId } = params;
  const kot = await getKotForOrder(orderId);

  if (!kot) {
    // redirect('/dashboard/tables'); // Or show a "KOT not found/generated" message
     return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-destructive">KOT Not Found</h1>
        <p className="text-muted-foreground">Could not generate or find KOT for order ID "{orderId}".</p>
        <Link href="/dashboard/tables">
            <Button className="mt-4">Go to Tables</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <KotView kot={kot} orderId={orderId} />
    </div>
  );
}
