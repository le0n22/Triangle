
'use server';

import prisma from '@backend/lib/prisma';
import type { PrinterRoleDefinition as PrismaPrinterRoleDefinition } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { AppPrinterRoleDefinition } from '@/types';

function mapPrismaRoleToAppRole(prismaRole: PrismaPrinterRoleDefinition): AppPrinterRoleDefinition {
  return {
    id: prismaRole.id,
    roleKey: prismaRole.roleKey,
    displayName: prismaRole.displayName,
    createdAt: prismaRole.createdAt,
    updatedAt: prismaRole.updatedAt,
  };
}

export async function getAllPrinterRoleDefinitionsAction(): Promise<AppPrinterRoleDefinition[] | { error: string }> {
  try {
    const roles = await prisma.printerRoleDefinition.findMany({
      orderBy: {
        displayName: 'asc',
      },
    });
    return roles.map(mapPrismaRoleToAppRole);
  } catch (error) {
    console.error('Error fetching printer role definitions:', error);
    return { error: 'Failed to fetch printer role definitions.' };
  }
}

export async function createPrinterRoleDefinitionAction(data: {
  roleKey: string;
  displayName: string;
}): Promise<AppPrinterRoleDefinition | { error: string }> {
  try {
    if (!data.roleKey || !data.displayName) {
      return { error: 'Role Key and Display Name are required.' };
    }
    // Validate roleKey format (e.g., uppercase, underscores)
    if (!/^[A-Z0-9_]+$/.test(data.roleKey)) {
        return { error: 'Role Key can only contain uppercase letters, numbers, and underscores.' };
    }


    const newRole = await prisma.printerRoleDefinition.create({
      data: {
        roleKey: data.roleKey,
        displayName: data.displayName,
      },
    });
    return mapPrismaRoleToAppRole(newRole);
  } catch (error) {
    console.error('Error creating printer role definition:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if ((error.meta?.target as string[])?.includes('roleKey')) {
        return { error: `Printer role with key "${data.roleKey}" already exists.` };
      }
    }
    return { error: 'Failed to create printer role definition.' };
  }
}

export async function updatePrinterRoleDefinitionAction(
  id: string,
  data: Partial<{ roleKey: string; displayName: string }>
): Promise<AppPrinterRoleDefinition | { error: string }> {
  try {
    if (data.roleKey === '') return { error: 'Role Key cannot be empty.' };
    if (data.displayName === '') return { error: 'Display Name cannot be empty.' };

    if (data.roleKey && !/^[A-Z0-9_]+$/.test(data.roleKey)) {
        return { error: 'Role Key can only contain uppercase letters, numbers, and underscores.' };
    }
    
    // Check if new roleKey conflicts with an existing one (excluding the current record)
    if (data.roleKey) {
        const existingRole = await prisma.printerRoleDefinition.findUnique({
            where: { roleKey: data.roleKey }
        });
        if (existingRole && existingRole.id !== id) {
            return { error: `Another printer role with key "${data.roleKey}" already exists.` };
        }
    }

    const updatedRole = await prisma.printerRoleDefinition.update({
      where: { id },
      data: {
        roleKey: data.roleKey,
        displayName: data.displayName,
      },
    });
    return mapPrismaRoleToAppRole(updatedRole);
  } catch (error) {
    console.error('Error updating printer role definition:', error);
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002' && data.roleKey) {
            if ((error.meta?.target as string[])?.includes('roleKey')) {
                return { error: `Printer role with key "${data.roleKey}" already exists.` };
            }
        }
        if (error.code === 'P2025') {
             return { error: 'Printer role to update not found.' };
        }
    }
    return { error: 'Failed to update printer role definition.' };
  }
}

export async function deletePrinterRoleDefinitionAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if this role is being used by any MenuCategory or MenuItem
    const categoriesUsingRole = await prisma.menuCategory.count({ where: { defaultPrinterRoleId: id } });
    const menuItemsUsingRole = await prisma.menuItem.count({ where: { defaultPrinterRoleId: id } });

    if (categoriesUsingRole > 0 || menuItemsUsingRole > 0) {
      let message = 'Cannot delete printer role. It is currently assigned as the default for:';
      if (categoriesUsingRole > 0) message += ` ${categoriesUsingRole} category(s)`;
      if (menuItemsUsingRole > 0) message += `${categoriesUsingRole > 0 ? ' and' : ''} ${menuItemsUsingRole} menu item(s)`;
      message += '. Please reassign them first.';
      return { success: false, error: message };
    }

    await prisma.printerRoleDefinition.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting printer role definition:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return { success: false, error: 'Printer role not found or already deleted.' };
    }
    return { success: false, error: 'Failed to delete printer role definition.' };
  }
}
