import Link from 'next/link';
import { Salad } from 'lucide-react'; // Using a generic food icon

export function Logo() {
  return (
    <Link href="/dashboard/tables" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
      <Salad className="h-8 w-8" />
      <h1 className="text-2xl font-headline font-semibold">OrderFlow</h1>
    </Link>
  );
}
