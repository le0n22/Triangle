
'use server';

import prisma from '@/lib/prisma';
import type { Table, TableStatus } from '@/types';

// Helper function to map Prisma Table to our Table type
function mapPrismaTableToAppTable(prismaTable: any): Table {
  return {
    ...prismaTable,
    status: prismaTable.status as TableStatus,
    currentOrderTotal: prismaTable.currentOrderTotal === null ? undefined : prismaTable.currentOrderTotal,
    name: prismaTable.name === null ? undefined : prismaTable.name,
    currentOrderId: prismaTable.currentOrderId === null ? undefined : prismaTable.currentOrderId,
  };
}

export async function getAllTables(): Promise<Table[]> {
  try {
    const tables = await prisma.table.findMany({
      orderBy: {
        number: 'asc',
      },
    });
    return tables.map(mapPrismaTableToAppTable);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

export async function createTableAction(data: {
  name?: string;
  number: number;
  capacity: number;
}): Promise<Table | { error: string }> {
  try {
    if (data.number === null || data.number === undefined || data.capacity === null || data.capacity === undefined) {
      return { error: 'Table number and capacity are required.' };
    }
    if (data.number <= 0 || data.capacity <= 0) {
        return { error: 'Table number and capacity must be positive values.' };
    }

    const existingTable = await prisma.table.findUnique({
        where: { number: data.number }
    });

    if (existingTable) {
        return { error: `Table with number ${data.number} already exists.` };
    }

    const newTable = await prisma.table.create({
      data: {
        name: data.name || null, // Ensure name is explicitly null if undefined/empty
        number: data.number,
        capacity: data.capacity,
        status: 'AVAILABLE', // Prisma enum, ensure it's uppercase
      },
    });
    return mapPrismaTableToAppTable(newTable);
  } catch (error) {
    console.error('Error creating table:', error);
    // Check for unique constraint violation if not caught by above check (though it should be)
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('number')) {
        return { error: `Table with number ${data.number} already exists.` };
    }
    return { error: 'Failed to create table. Please check server logs.' };
  }
}

export async function updateTableAction(
  id: string,
  data: Partial<{ name?: string; number: number; capacity: number; status: TableStatus }>
): Promise<Table | { error: string }> {
  try {
    if (data.number !== undefined && data.number <= 0) {
        return { error: 'Table number must be a positive value.' };
    }
    if (data.capacity !== undefined && data.capacity <= 0) {
        return { error: 'Table capacity must be a positive value.' };
    }

    // Check if updating to a number that already exists (and is not the current table's number)
    if (data.number !== undefined) {
        const currentTable = await prisma.table.findUnique({ where: { id } });
        if (currentTable && currentTable.number !== data.number) {
            const existingTableWithNewNumber = await prisma.table.findUnique({
                where: { number: data.number }
            });
            if (existingTableWithNewNumber) {
                return { error: `Another table with number ${data.number} already exists.`};
            }
        }
    }
    
    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        name: data.name, // Prisma handles undefined correctly (no update)
        number: data.number,
        capacity: data.capacity,
        status: data.status ? data.status.toUpperCase() as any : undefined, // Map to uppercase for Prisma enum
      },
    });
    return mapPrismaTableToAppTable(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('number')) {
        return { error: `Another table with number ${data.number} already exists.`};
    }
    return { error: 'Failed to update table. Please check server logs.' };
  }
}

export async function deleteTableAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Consider relations:
    // - If a table has an active order, should deletion be prevented?
    // For now, Prisma schema uses onDelete: SetNull for currentOrder, so it will be disassociated.
    // Orders in the Order[] relation are not directly handled by onDelete here,
    // you might need to archive or reassign them if it's a hard requirement.
    const tableToDelete = await prisma.table.findUnique({
        where: { id },
        include: { currentOrder: true, orders: true } // Check if it has associated orders
    });

    if (tableToDelete?.currentOrderId || (tableToDelete?.orders && tableToDelete.orders.length > 0)) {
        // Example: Prevent deletion if there are any orders associated.
        // Adjust this logic based on your business rules.
        // return { success: false, error: 'Cannot delete table with active or past orders. Please clear/reassign orders first.' };
    }


    await prisma.table.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting table:', error);
    return { success: false, error: 'Failed to delete table. It might be in use or have related records.' };
  }
}

export async function updateTableStatusAction(tableId: string, status: TableStatus): Promise<Table | { error: string }> {
  try {
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { status: status.toUpperCase() as any }, // Map to uppercase for Prisma enum
    });
     return mapPrismaTableToAppTable(updatedTable);
  } catch (error) {
    console.error(`Error updating table ${tableId} status to ${status}:`, error);
    return { error: `Failed to update status for table ${tableId}.` };
  }
}

// This action is more complex as it involves order creation/linking.
// It might be better handled within an "OrderService" or similar.
// For now, it ensures the table status and order details are updated.
export async function updateTableOrderDetailsAction(tableId: string, orderId: string | null, orderTotal: number | null): Promise<Table | { error: string }> {
  try {
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        currentOrderId: orderId,
        currentOrderTotal: orderTotal,
        status: orderId ? 'OCCUPIED' : 'AVAILABLE', // Prisma enum, ensure it's uppercase
      },
    });
    return mapPrismaTableToAppTable(updatedTable);
  } catch (error) {
    console.error(`Error updating table ${tableId} order details:`, error);
    return { error: `Failed to update order details for table ${tableId}.` };
  }
}
