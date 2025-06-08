
'use server';

import prisma from '@backend/lib/prisma';
import type { PrinterRoleDefinition as PrismaPrinterRoleDefinition } from '@prisma/client';
import { Prisma } from '@prisma/client'; // Prisma'yı import etmeyi unutmayın
import type { AppPrinterRoleDefinition } from '@/types';

// Prisma objesinin import edilip edilmediğini kontrol etmek için log ekleyelim
console.log('--- printerRoleDefinitionActions.ts ---');
console.log('Imported prisma object:', prisma ? 'Defined' : 'UNDEFINED');
if (!prisma) {
  console.error('CRITICAL: prisma object is undefined in printerRoleDefinitionActions.ts. Check prisma client initialization and import.');
}

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
  console.log('getAllPrinterRoleDefinitionsAction called. Prisma defined:', !!prisma);
  if (!prisma) {
    const errorMsg = 'Prisma client is not available in getAllPrinterRoleDefinitionsAction.';
    console.error(errorMsg);
    return { error: errorMsg };
  }
  try {
    const roles = await prisma.printerRoleDefinition.findMany({
      orderBy: {
        displayName: 'asc',
      },
    });
    return roles.map(mapPrismaRoleToAppRole);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching printer role definitions:', errorMsg);
    return { error: 'Failed to fetch printer role definitions. ' + errorMsg };
  }
}

export async function createPrinterRoleDefinitionAction(data: {
  roleKey: string;
  displayName: string;
}): Promise<AppPrinterRoleDefinition | { error: string }> {
  console.log('createPrinterRoleDefinitionAction called. Prisma defined:', !!prisma);
   if (!prisma) {
    const errorMsg = 'Prisma client is not available in createPrinterRoleDefinitionAction.';
    console.error(errorMsg);
    return { error: errorMsg };
  }
  try {
    if (!data.roleKey || !data.displayName) {
      return { error: 'Role Key and Display Name are required.' };
    }
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { error: 'Failed to create printer role definition. ' + errorMsg };
  }
}

export async function updatePrinterRoleDefinitionAction(
  id: string,
  data: Partial<{ roleKey: string; displayName: string }>
): Promise<AppPrinterRoleDefinition | { error: string }> {
  console.log('updatePrinterRoleDefinitionAction called. Prisma defined:', !!prisma);
   if (!prisma) {
    const errorMsg = 'Prisma client is not available in updatePrinterRoleDefinitionAction.';
    console.error(errorMsg);
    return { error: errorMsg };
  }
  try {
    if (data.roleKey === '') return { error: 'Role Key cannot be empty.' };
    if (data.displayName === '') return { error: 'Display Name cannot be empty.' };

    // RoleKey'in güncellenmemesi gerektiği için bu kontrolü kaldırıyorum veya yorum satırı yapıyorum.
    // Genellikle primary key veya unique key'ler oluşturulduktan sonra değiştirilmez.
    /*
    if (data.roleKey && !/^[A-Z0-9_]+$/.test(data.roleKey)) {
        return { error: 'Role Key can only contain uppercase letters, numbers, and underscores.' };
    }
    
    if (data.roleKey) {
        const existingRole = await prisma.printerRoleDefinition.findUnique({
            where: { roleKey: data.roleKey }
        });
        if (existingRole && existingRole.id !== id) {
            return { error: `Another printer role with key "${data.roleKey}" already exists.` };
        }
    }
    */

    const updateData: { displayName?: string } = {};
    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }
    // roleKey güncellenmeyecekse, data objesinden çıkarılmalı veya sadece displayName güncellenmeli.
    // Şimdilik sadece displayName'in güncellenebildiğini varsayıyorum.

    const updatedRole = await prisma.printerRoleDefinition.update({
      where: { id },
      data: updateData, // Sadece displayName güncelleniyor
    });
    return mapPrismaRoleToAppRole(updatedRole);
  } catch (error) {
    console.error('Error updating printer role definition:', error);
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Bu P2002 kontrolü displayName için de gerekebilir eğer displayName'i de unique yapmak isterseniz.
        // Şu anki şemada sadece roleKey unique.
        /*
        if (error.code === 'P2002' && data.roleKey) { 
            if ((error.meta?.target as string[])?.includes('roleKey')) {
                return { error: `Printer role with key "${data.roleKey}" already exists.` };
            }
        }
        */
        if (error.code === 'P2025') {
             return { error: 'Printer role to update not found.' };
        }
    }
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { error: 'Failed to update printer role definition. ' + errorMsg };
  }
}

export async function deletePrinterRoleDefinitionAction(id: string): Promise<{ success: boolean; error?: string }> {
  console.log('deletePrinterRoleDefinitionAction called. Prisma defined:', !!prisma);
  if (!prisma) {
    const errorMsg = 'Prisma client is not available in deletePrinterRoleDefinitionAction.';
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  try {
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: 'Failed to delete printer role definition. ' + errorMsg };
  }
}
    