
'use server'; // Ensure this is at the VERY TOP of the file

import prisma from '@backend/lib/prisma';
import type { Modifier as PrismaModifier } from '@prisma/client';

// Define the AppModifier type to be used by the frontend
export interface AppModifier {
  id: string;
  name: string;
  priceChange: number;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to map Prisma Modifier to our AppModifier type
function mapPrismaModifierToAppModifier(prismaModifier: PrismaModifier): AppModifier {
  return {
    id: prismaModifier.id,
    name: prismaModifier.name,
    priceChange: prismaModifier.priceChange.toNumber(), // Ensure conversion to number
    createdAt: prismaModifier.createdAt,
    updatedAt: prismaModifier.updatedAt,
  };
}

export async function getAllModifiersAction(): Promise<AppModifier[] | { error: string }> {
  try {
    const modifiers = await prisma.modifier.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    const result = modifiers.map(mapPrismaModifierToAppModifier);
    return result;
  } catch (error) {
    console.error("Error fetching modifiers from DB:", error);
    return { error: 'Failed to fetch modifiers from database. Check server logs.' };
  }
}

export async function createModifierAction(data: {
  name: string;
  priceChange: number;
}): Promise<AppModifier | { error: string }> {
  try {
    if (!data.name) {
      return { error: 'Modifier name is required.' };
    }
    if (data.priceChange === null || data.priceChange === undefined || isNaN(data.priceChange)) {
        return { error: 'Price change must be a valid number.' };
    }

    const existingModifier = await prisma.modifier.findFirst({ 
        where: { name: data.name }
    });

    if (existingModifier) {
        return { error: `Modifier with name "${data.name}" already exists.` };
    }

    const newModifier = await prisma.modifier.create({
      data: {
        name: data.name,
        priceChange: data.priceChange, // Prisma handles number to Decimal conversion
      },
    });
    const result = mapPrismaModifierToAppModifier(newModifier);
    return result;
  } catch (error) {
    console.error('Error creating modifier:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
        return { error: `Modifier with name "${data.name}" already exists (caught by create).` };
    }
    return { error: 'Failed to create modifier. Please check server logs for details.' };
  }
}

export async function updateModifierAction(
  id: string,
  data: Partial<{ name: string; priceChange: number }>
): Promise<AppModifier | { error: string }> {
  try {
    if (data.name === '') {
        return { error: 'Modifier name cannot be empty.' };
    }
    if (data.priceChange !== undefined && isNaN(data.priceChange)) {
        return { error: 'Price change must be a valid number.' };
    }

    if (data.name !== undefined) {
        const existingModifierWithNewName = await prisma.modifier.findFirst({ 
            where: {
                name: data.name,
                NOT: { id: id }
            }
        });
        if (existingModifierWithNewName) {
            return { error: `Another modifier with name "${data.name}" already exists.`};
        }
    }

    const updatedModifier = await prisma.modifier.update({
      where: { id },
      data: {
        name: data.name,
        priceChange: data.priceChange, // Prisma handles number to Decimal conversion
      },
    });
    const result = mapPrismaModifierToAppModifier(updatedModifier);
    return result;
  } catch (error) {
    console.error('Error updating modifier:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name') && data.name) {
        return { error: `Another modifier with name "${data.name}" already exists (caught by update).`};
    }
    if (prismaError.code === 'P2025') {
        return { error: 'Modifier to update not found.'};
    }
    return { error: 'Failed to update modifier. Please check server logs for details.' };
  }
}

export async function deleteModifierAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.modifier.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting modifier:', error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
         return { success: false, error: 'Modifier not found or already deleted.' };
    }
    return { success: false, error: 'Failed to delete modifier. Check server logs.' };
  }
}
    
