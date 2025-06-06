
'use server'; // Ensure this is at the VERY TOP of the file

import prisma from '@backend/lib/prisma';
import type { Modifier as PrismaModifier } from '@prisma/client';

// Define the AppModifier type to be used by the frontend
// For now, it's a direct mapping for the relevant fields.
export interface AppModifier {
  id: string;
  name: string;
  priceChange: number;
  createdAt: Date; // Added from schema
  updatedAt: Date; // Added from schema
}

// Helper function to map Prisma Modifier to our AppModifier type
function mapPrismaModifierToAppModifier(prismaModifier: PrismaModifier): AppModifier {
  return {
    id: prismaModifier.id,
    name: prismaModifier.name,
    priceChange: prismaModifier.priceChange,
    createdAt: prismaModifier.createdAt,
    updatedAt: prismaModifier.updatedAt,
  };
}

export async function getAllModifiersAction(): Promise<AppModifier[] | { error: string }> {
  console.log('>>>>> BACKEND ACTION CALLED: getAllModifiersAction (Real Implementation) <<<<<');
  try {
    const modifiers = await prisma.modifier.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    const result = modifiers.map(mapPrismaModifierToAppModifier);
    console.log(`>>>>> BACKEND ACTION RETURNING from getAllModifiersAction: Found ${result.length} modifiers <<<<<`);
    return result;
  } catch (error) {
    console.error("Error fetching modifiers from DB:", error);
    return { error: 'Failed to fetch modifiers from database.' };
  }
}

export async function createModifierAction(data: {
  name: string;
  priceChange: number;
}): Promise<AppModifier | { error: string }> {
  console.log('>>>>> BACKEND ACTION CALLED: createModifierAction with data:', data);
  try {
    if (!data.name) {
      return { error: 'Modifier name is required.' };
    }
    if (data.priceChange === null || data.priceChange === undefined || isNaN(data.priceChange)) {
        return { error: 'Price change must be a valid number.' };
    }

    const existingModifier = await prisma.modifier.findUnique({
        where: { name: data.name }
    });

    if (existingModifier) {
        return { error: `Modifier with name "${data.name}" already exists.` };
    }

    const newModifier = await prisma.modifier.create({
      data: {
        name: data.name,
        priceChange: data.priceChange,
      },
    });
    const result = mapPrismaModifierToAppModifier(newModifier);
    console.log('>>>>> BACKEND ACTION RETURNING from createModifierAction:', result);
    return result;
  } catch (error) {
    console.error('Error creating modifier:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
        return { error: `Modifier with name "${data.name}" already exists.` };
    }
    return { error: 'Failed to create modifier. Please check server logs.' };
  }
}

export async function updateModifierAction(
  id: string,
  data: Partial<{ name: string; priceChange: number }>
): Promise<AppModifier | { error: string }> {
  console.log('>>>>> BACKEND ACTION CALLED: updateModifierAction for id:', id, 'with data:', data);
  try {
    if (data.name === '') { 
        return { error: 'Modifier name cannot be empty.' };
    }
    if (data.priceChange !== undefined && isNaN(data.priceChange)) {
        return { error: 'Price change must be a valid number.' };
    }

    if (data.name !== undefined) {
        const currentModifier = await prisma.modifier.findUnique({ where: { id } });
        // Check if the name is being changed to a name that already exists for a *different* modifier
        if (currentModifier && currentModifier.name !== data.name) {
            const existingModifierWithNewName = await prisma.modifier.findUnique({
                where: { name: data.name }
            });
            if (existingModifierWithNewName) {
                return { error: `Another modifier with name "${data.name}" already exists.`};
            }
        }
    }
    
    const updatedModifier = await prisma.modifier.update({
      where: { id },
      data: {
        name: data.name,
        priceChange: data.priceChange,
      },
    });
    const result = mapPrismaModifierToAppModifier(updatedModifier);
    console.log('>>>>> BACKEND ACTION RETURNING from updateModifierAction:', result);
    return result;
  } catch (error) {
    console.error('Error updating modifier:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name') && data.name) {
        return { error: `Another modifier with name "${data.name}" already exists.`};
    }
    if (prismaError.code === 'P2025') {
        return { error: 'Modifier to update not found.'};
    }
    return { error: 'Failed to update modifier. Please check server logs.' };
  }
}

export async function deleteModifierAction(id: string): Promise<{ success: boolean; error?: string }> {
  console.log('>>>>> BACKEND ACTION CALLED: deleteModifierAction for id:', id);
  try {
    // Note: Deleting a modifier does not automatically remove it from MenuItems
    // if using an implicit many-to-many relation without onDelete: Cascade on the join table.
    // Prisma handles the relation table records for explicit many-to-many.
    // For now, we assume the join table records linking this modifier to menu items will be deleted.
    await prisma.modifier.delete({
      where: { id },
    });
    console.log('>>>>> BACKEND ACTION RETURNING from deleteModifierAction: success: true');
    return { success: true };
  } catch (error) {
    console.error('Error deleting modifier:', error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') { // Record to delete not found
         return { success: false, error: 'Modifier not found or already deleted.' };
    }
    // P2003 would be for foreign key constraint violations if this modifier was part of a relation
    // that restricts deletion (e.g., an explicit join table with onDelete: Restrict).
    // For the implicit m-n with MenuItem, Prisma manages the join table.
    return { success: false, error: 'Failed to delete modifier. It might no longer exist or there was a server error.' };
  }
}
