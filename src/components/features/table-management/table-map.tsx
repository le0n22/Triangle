import type { Table } from '@/types';
import { TableCard } from './table-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';

interface TableMapProps {
  tables: Table[];
}

export function TableMap({ tables }: TableMapProps) {
  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No tables configured.</p>
        <Button className="mt-4">Add Table</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-semibold">Table Layout</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Table
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 auto-rows-max"> 
        {/* Increased gap, 2xl variant, auto-rows-max for better flow with fixed card heights */}
        {tables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
    </div>
  );
}
