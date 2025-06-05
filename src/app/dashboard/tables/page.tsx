import type { Table } from '@/types';
import { TableMap } from '@/components/features/table-management/table-map';

// Mock data for tables
const mockTables: Table[] = [
  { id: 't1', number: 1, status: 'available', capacity: 4 },
  { id: 't2', number: 2, status: 'occupied', capacity: 2, currentOrderId: 'ord123' },
  { id: 't3', number: 3, status: 'reserved', capacity: 6 },
  { id: 't4', number: 4, status: 'available', capacity: 4 },
  { id: 't5', number: 5, status: 'dirty', capacity: 2 },
  { id: 't6', number: 6, status: 'occupied', capacity: 8, currentOrderId: 'ord456' },
  { id: 't7', number: 7, status: 'available', capacity: 2 },
  { id: 't8', number: 8, status: 'reserved', capacity: 4 },
  { id: 't9', number: 9, status: 'available', capacity: 4 },
  { id: 't10', number: 10, status: 'occupied', capacity: 2, currentOrderId: 'ord789' },
];

export default function TablesPage() {
  // In a real app, fetch tables data
  const tables = mockTables;

  return (
    <div className="container mx-auto py-8">
      <TableMap tables={tables} />
    </div>
  );
}
