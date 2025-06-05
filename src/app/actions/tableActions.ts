
'use server';

import prisma from '@/lib/prisma';
import type { Table as AppTable, TableStatus } from '@/types';
import type { Table as PrismaTable } from '@prisma/client';

// Helper function to map Prisma Table to our AppTable type
function mapPrismaTableToAppTable(prismaTable: PrismaTable): AppTable {
  return {
    id: prismaTable.id,
    number: prismaTable.number,
    capacity: prismaTable.capacity,
    name: prismaTable.name ?? undefined,
    status: prismaTable.status.toLowerCase() as TableStatus, // Ensure status is lowercase
    currentOrderId: prismaTable.currentOrderId ?? undefined,
    currentOrderTotal: prismaTable.currentOrderTotal ?? undefined,
  };
}

export async function getAllTables(): Promise<AppTable[]> {
  try {
    const tables = await prisma.table.findMany({
      orderBy: {
        number: 'asc',
      },
    });
    return tables.map(mapPrismaTableToAppTable);
  } catch (error) {
    console.error('Error fetching tables:', error);
    // Consider returning a more specific error or re-throwing
    return [];
  }
}

export async function createTableAction(data: {
  name?: string;
  number: number;
  capacity: number;
}): Promise<AppTable | { error: string }> {
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
        name: data.name || null,
        number: data.number,
        capacity: data.capacity,
        status: 'AVAILABLE', // Prisma enum, ensure it's uppercase
      },
    });
    return mapPrismaTableToAppTable(newTable);
  } catch (error) {
    console.error('Error creating table:', error);
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('number')) {
        return { error: `Table with number ${data.number} already exists.` };
    }
    return { error: 'Failed to create table. Please check server logs for more details.' };
  }
}

export async function updateTableAction(
  id: string,
  data: Partial<{ name?: string; number: number; capacity: number; status: TableStatus }>
): Promise<AppTable | { error: string }> {
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
        name: data.name,
        number: data.number,
        capacity: data.capacity,
        // Ensure status is uppercase for Prisma enum
        status: data.status ? (data.status.toUpperCase() as typeof PrismaTable['status']) : undefined,
      },
    });
    return mapPrismaTableToAppTable(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('number')) {
        // This specific error handling might be redundant due to the check above,
        // but kept for safety in case of race conditions or other scenarios.
        return { error: `Another table with number ${data.number} already exists.`};
    }
    return { error: 'Failed to update table. Please check server logs for more details.' };
  }
}

export async function deleteTableAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Consider relations:
    // If a table has an active order, deletion might be prevented by business logic
    // or orders could be archived/reassigned.
    // Prisma schema uses onDelete: SetNull for currentOrder, so it will be disassociated.
    // Orders in the Order[] relation are not directly handled by onDelete here.
    
    // Example check (can be expanded based on business rules):
    // const tableToDelete = await prisma.table.findUnique({
    //     where: { id },
    //     include: { currentOrder: true, orders: { take: 1 } } // Check if it has any associated orders
    // });
    // if (tableToDelete?.currentOrderId || (tableToDelete?.orders && tableToDelete.orders.length > 0)) {
    //     return { success: false, error: 'Cannot delete table with active or past orders. Please clear/reassign orders first.' };
    // }

    await prisma.table.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting table:', error);
    // Prisma's P2025 error code indicates record not found, which is okay for delete.
    // More specific error handling can be added if needed (e.g., foreign key constraints if onDelete behavior was different)
    return { success: false, error: 'Failed to delete table. It might have related records or no longer exists.' };
  }
}

export async function updateTableStatusAction(tableId: string, status: TableStatus): Promise<AppTable | { error: string }> {
  try {
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { status: status.toUpperCase() as typeof PrismaTable['status'] },
    });
     return mapPrismaTableToAppTable(updatedTable);
  } catch (error) {
    console.error(`Error updating table ${tableId} status to ${status}:`, error);
    return { error: `Failed to update status for table ${tableId}.` };
  }
}

export async function updateTableOrderDetailsAction(
    tableId: string, 
    orderId: string | null, 
    orderTotal: number | null
): Promise<AppTable | { error: string }> {
  try {
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        currentOrderId: orderId,
        currentOrderTotal: orderTotal,
        status: orderId ? 'OCCUPIED' : 'AVAILABLE', // Set status based on order presence
      },
    });
    return mapPrismaTableToAppTable(updatedTable);
  } catch (error) {
    console.error(`Error updating table ${tableId} order details:`, error);
    return { error: `Failed to update order details for table ${tableId}.` };
  }
}
