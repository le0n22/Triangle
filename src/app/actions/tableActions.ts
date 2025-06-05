
'use server';

import prisma from '@/lib/prisma';
import type { Table, TableStatus } from '@/types';

// Directly callable from Server Components
export async function getAllTables(): Promise<Table[]> {
  try {
    const tables = await prisma.table.findMany({
      orderBy: {
        number: 'asc',
      },
    });
    // Map Prisma model to our Table type if necessary (especially for enums or relations)
    // For now, assuming direct compatibility or simple mapping
    return tables.map(table => ({
      ...table,
      status: table.status as TableStatus, // Ensure status matches our enum
      currentOrderTotal: table.currentOrderTotal === null ? undefined : table.currentOrderTotal,
      name: table.name === null ? undefined : table.name,
      currentOrderId: table.currentOrderId === null ? undefined : table.currentOrderId,
    }));
  } catch (error) {
    console.error('Error fetching tables:', error);
    // In a real app, handle this more gracefully, maybe return an error object
    return [];
  }
}

export async function createTableAction(data: {
  name?: string;
  number: number;
  capacity: number;
}): Promise<Table | { error: string }> {
  try {
    if (!data.number || !data.capacity) {
      return { error: 'Table number and capacity are required.' };
    }
    const newTable = await prisma.table.create({
      data: {
        name: data.name,
        number: data.number,
        capacity: data.capacity,
        status: 'available', // Default status
      },
    });
    return {
        ...newTable,
        status: newTable.status as TableStatus,
        currentOrderTotal: newTable.currentOrderTotal === null ? undefined : newTable.currentOrderTotal,
        name: newTable.name === null ? undefined : newTable.name,
        currentOrderId: newTable.currentOrderId === null ? undefined : newTable.currentOrderId,
    };
  } catch (error) {
    console.error('Error creating table:', error);
    return { error: 'Failed to create table.' };
  }
}

export async function updateTableAction(
  id: string,
  data: Partial<{ name?: string; number: number; capacity: number; status: TableStatus }>
): Promise<Table | { error: string }> {
  try {
    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        name: data.name,
        number: data.number,
        capacity: data.capacity,
        status: data.status,
      },
    });
    return {
        ...updatedTable,
        status: updatedTable.status as TableStatus,
        currentOrderTotal: updatedTable.currentOrderTotal === null ? undefined : updatedTable.currentOrderTotal,
        name: updatedTable.name === null ? undefined : updatedTable.name,
        currentOrderId: updatedTable.currentOrderId === null ? undefined : updatedTable.currentOrderId,
    };
  } catch (error) {
    console.error('Error updating table:', error);
    return { error: 'Failed to update table.' };
  }
}

export async function deleteTableAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Before deleting a table, consider relations:
    // - What happens to orders associated with this table? (e.g., disassociate, archive, prevent deletion if active orders)
    // For now, we'll proceed with simple deletion.
    await prisma.table.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting table:', error);
    return { success: false, error: 'Failed to delete table.' };
  }
}

export async function updateTableStatusAction(tableId: string, status: TableStatus): Promise<Table | { error: string }> {
  try {
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { status },
    });
     return {
        ...updatedTable,
        status: updatedTable.status as TableStatus,
        currentOrderTotal: updatedTable.currentOrderTotal === null ? undefined : updatedTable.currentOrderTotal,
        name: updatedTable.name === null ? undefined : updatedTable.name,
        currentOrderId: updatedTable.currentOrderId === null ? undefined : updatedTable.currentOrderId,
    };
  } catch (error) {
    console.error(`Error updating table ${tableId} status to ${status}:`, error);
    return { error: `Failed to update status for table ${tableId}.` };
  }
}

export async function updateTableOrderDetailsAction(tableId: string, orderId: string | null, orderTotal: number | null): Promise<Table | { error: string }> {
  try {
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        currentOrderId: orderId,
        currentOrderTotal: orderTotal,
        status: orderId ? 'occupied' : 'available', // Assuming if an order is set, it's occupied
      },
    });
    return {
        ...updatedTable,
        status: updatedTable.status as TableStatus,
        currentOrderTotal: updatedTable.currentOrderTotal === null ? undefined : updatedTable.currentOrderTotal,
        name: updatedTable.name === null ? undefined : updatedTable.name,
        currentOrderId: updatedTable.currentOrderId === null ? undefined : updatedTable.currentOrderId,
    };
  } catch (error) {
    console.error(`Error updating table ${tableId} order details:`, error);
    return { error: `Failed to update order details for table ${tableId}.` };
  }
}
