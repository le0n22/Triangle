
import type { Table } from '@/types';
import { TableMap } from '@/components/features/table-management/table-map';
import { getAllTables } from '@/app/actions/tableActions';

export default async function TablesPage() {
  // Fetch tables from the backend service (Server Action or direct Prisma call)
  const tables = await getAllTables();

  // If you want to ensure some mock data exists for initial dev with an empty DB, you could do:
  // if (tables.length === 0) {
  //   tables.push(
  //     { id: 't-mock-1', name: 'Window Spot', number: 1, status: 'available', capacity: 4 },
  //     { id: 't-mock-2', number: 2, status: 'occupied', capacity: 2, currentOrderId: 'ord-mock-123', currentOrderTotal: 30.24 }
  //   );
  //   // In a real scenario, you might call an action to seed these if DB is empty.
  // }


  return (
    <div className="container mx-auto py-8">
      <TableMap tables={tables} />
    </div>
  );
}

