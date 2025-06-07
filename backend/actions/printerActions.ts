
'use server';

import prisma from '@backend/lib/prisma';
import type { PrinterConfiguration as PrismaPrinterConfiguration, PrinterConnectionType as PrismaPrinterConnectionType, PrinterRole as PrismaPrinterRole } from '@prisma/client';
import type { PrinterConfiguration, PrinterConnectionType, PrinterRole } from '@/types';

// Helper to map Prisma types to App types
function mapPrismaPrinterToAppPrinter(prismaPrinter: PrismaPrinterConfiguration): PrinterConfiguration {
  return {
    id: prismaPrinter.id,
    name: prismaPrinter.name,
    connectionType: prismaPrinter.connectionType as PrinterConnectionType, // Assuming enum values match string literals
    connectionInfo: prismaPrinter.connectionInfo,
    roles: prismaPrinter.roles as PrinterRole[], // Assuming enum values match string literals
    createdAt: prismaPrinter.createdAt.toISOString(),
    updatedAt: prismaPrinter.updatedAt.toISOString(),
  };
}

export async function getAllPrinterConfigurationsAction(): Promise<PrinterConfiguration[] | { error: string }> {
  try {
    const printers = await prisma.printerConfiguration.findMany({
      orderBy: { name: 'asc' },
    });
    return printers.map(mapPrismaPrinterToAppPrinter);
  } catch (error) {
    console.error('Error fetching printer configurations:', error);
    return { error: 'Failed to fetch printer configurations.' };
  }
}

interface PrinterConfigurationFormData {
  name: string;
  connectionType: PrinterConnectionType;
  connectionInfo: string;
  roles: PrinterRole[];
}

export async function createPrinterConfigurationAction(data: PrinterConfigurationFormData): Promise<PrinterConfiguration | { error: string }> {
  try {
    if (!data.name || !data.connectionType || !data.connectionInfo) {
      return { error: 'Name, connection type, and connection info are required.' };
    }
     if (data.roles.length === 0) {
        return { error: 'At least one role must be selected for the printer.' };
    }

    const existingPrinter = await prisma.printerConfiguration.findUnique({
        where: { name: data.name }
    });
    if (existingPrinter) {
        return { error: `A printer with the name "${data.name}" already exists.`};
    }


    const newPrinter = await prisma.printerConfiguration.create({
      data: {
        name: data.name,
        connectionType: data.connectionType as PrismaPrinterConnectionType,
        connectionInfo: data.connectionInfo,
        roles: data.roles as PrismaPrinterRole[],
      },
    });
    return mapPrismaPrinterToAppPrinter(newPrinter);
  } catch (error) {
    console.error('Error creating printer configuration:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
        return { error: `A printer with the name "${data.name}" already exists.` };
    }
    return { error: 'Failed to create printer configuration.' };
  }
}

export async function updatePrinterConfigurationAction(id: string, data: Partial<PrinterConfigurationFormData>): Promise<PrinterConfiguration | { error: string }> {
  try {
    if (data.name === '') return { error: 'Printer name cannot be empty.' };
     if (data.roles !== undefined && data.roles.length === 0) {
        return { error: 'At least one role must be selected for the printer.' };
    }
    // Check if all potentially updatable fields are undefined
    if (data.name === undefined && data.connectionType === undefined && data.connectionInfo === undefined && data.roles === undefined) {
        return { error: 'No data provided for update.' };
    }

    if (data.name) {
        const existingPrinterWithNewName = await prisma.printerConfiguration.findFirst({
            where: { name: data.name, NOT: { id: id } }
        });
        if (existingPrinterWithNewName) {
            return { error: `Another printer with the name "${data.name}" already exists.`};
        }
    }
    
    const updatedPrinter = await prisma.printerConfiguration.update({
      where: { id },
      data: {
        name: data.name,
        connectionType: data.connectionType as PrismaPrinterConnectionType, // Cast needed if type differs
        connectionInfo: data.connectionInfo,
        roles: data.roles as PrismaPrinterRole[], // Cast needed
      },
    });
    return mapPrismaPrinterToAppPrinter(updatedPrinter);
  } catch (error) {
    console.error('Error updating printer configuration:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[], cause?: string } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name') && data.name) {
      return { error: `Another printer with name "${data.name}" already exists.` };
    }
    if (prismaError.code === 'P2025') { // Record to update not found
        return { error: 'Printer to update not found.'};
    }
    return { error: 'Failed to update printer configuration.' };
  }
}

export async function deletePrinterConfigurationAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.printerConfiguration.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting printer configuration:', error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') { // Record to delete not found
         return { success: false, error: 'Printer not found or already deleted.' };
    }
    return { error: 'Failed to delete printer configuration.' };
  }
}
