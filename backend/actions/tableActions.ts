
'use server';

import prisma from '@backend/lib/prisma';
import type { Table as AppTable, TableStatus } from '@/types';
import type { Table as PrismaTable, TableStatus as PrismaTableStatus } from '@prisma/client';

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
        status: 'AVAILABLE' as PrismaTableStatus,
      },
    });
    return mapPrismaTableToAppTable(newTable);
  } catch (error) {
    console.error('Error creating table:', error);
    // Type assertion for Prisma-specific error
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('number')) {
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
        status: data.status ? (data.status.toUpperCase() as PrismaTableStatus) : undefined,
      },
    });
    return mapPrismaTableToAppTable(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('number')) {
        return { error: `Another table with number ${data.number} already exists.`};
    }
    return { error: 'Failed to update table. Please check server logs for more details.' };
  }
}

export async function deleteTableAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.table.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting table:', error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') { // Record to delete not found
         return { success: false, error: 'Table not found or already deleted.' };
    }
    // Consider P2003 for foreign key constraint violations if onDelete behavior was different
    return { success: false, error: 'Failed to delete table. It might have related records or no longer exists.' };
  }
}

export async function updateTableStatusAction(tableId: string, status: TableStatus): Promise<AppTable | { error: string }> {
  try {
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { status: status.toUpperCase() as PrismaTableStatus },
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
        status: orderId ? ('OCCUPIED' as PrismaTableStatus) : ('AVAILABLE' as PrismaTableStatus),
      },
    });
    return mapPrismaTableToAppTable(updatedTable);
  } catch (error) {
    console.error(`Error updating table ${tableId} order details:`, error);
    return { error: `Failed to update order details for table ${tableId}.` };
  }
}
