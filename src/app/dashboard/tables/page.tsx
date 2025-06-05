
import type { Table } from '@/types';
import { TableMap } from '@/components/features/table-management/table-map';
import { getAllTables } from '@backend/actions/tableActions';

export default async function TablesPage() {
  const tables = await getAllTables();

  return (
    <div className="container mx-auto py-8">
      <TableMap tables={tables} />
    </div>
  );
}
