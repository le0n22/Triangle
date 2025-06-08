
'use server';

import prisma from '@backend/lib/prisma';
import type { MenuCategory as PrismaMenuCategory } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { AppMenuCategory } from '@/types'; // Ensure AppMenuCategory uses string for roleKey

// Helper function to map Prisma MenuCategory to our AppMenuCategory type
function mapPrismaCategoryToAppCategory(
  prismaCategory: PrismaMenuCategory & { defaultPrinterRole?: { roleKey: string; displayName: string } | null }
): AppMenuCategory {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    iconName: prismaCategory.iconName ?? undefined,
    defaultPrinterRoleKey: prismaCategory.defaultPrinterRole?.roleKey ?? undefined,
    defaultPrinterRoleDisplayName: prismaCategory.defaultPrinterRole?.displayName ?? undefined,
  };
}

export async function getAllCategoriesAction(): Promise<AppMenuCategory[]> {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        defaultPrinterRole: { // Include the related PrinterRoleDefinition
          select: {
            roleKey: true,
            displayName: true,
          }
        }
      }
    });
    return categories.map(mapPrismaCategoryToAppCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function createCategoryAction(data: {
  name: string;
  iconName?: string;
  defaultPrinterRoleKey?: string | null; // Changed from PrinterRole to string (roleKey)
}): Promise<AppMenuCategory | { error: string }> {
  try {
    if (!data.name) {
      return { error: 'Category name is required.' };
    }

    const existingCategory = await prisma.menuCategory.findUnique({
        where: { name: data.name }
    });

    if (existingCategory) {
        return { error: `Category with name "${data.name}" already exists.` };
    }
    
    const createData: Prisma.MenuCategoryCreateInput = {
      name: data.name,
      iconName: data.iconName || null,
    };

    if (data.defaultPrinterRoleKey) {
      createData.defaultPrinterRole = {
        connect: { roleKey: data.defaultPrinterRoleKey }
      };
    } else {
      // Explicitly do not connect or set if null/undefined
      // If the relation is optional and you want to ensure it's null if not provided:
      // createData.defaultPrinterRoleId = null; // If using direct ID
    }

    const newCategory = await prisma.menuCategory.create({
      data: createData,
      include: {
        defaultPrinterRole: { select: { roleKey: true, displayName: true } }
      }
    });
    return mapPrismaCategoryToAppCategory(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[], cause?: string } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
        return { error: `Category with name "${data.name}" already exists.` };
    }
    if (prismaError.code === 'P2025' && prismaError.meta?.cause?.includes('PrinterRoleDefinitionToConnect')) {
        return { error: `Selected printer role with key "${data.defaultPrinterRoleKey}" not found.` };
    }
    return { error: 'Failed to create category. Please check server logs.' };
  }
}

export async function updateCategoryAction(
  id: string,
  data: Partial<{ name: string; iconName?: string; defaultPrinterRoleKey?: string | null }>
): Promise<AppMenuCategory | { error: string }> {
  try {
    if (data.name === '') {
        return { error: 'Category name cannot be empty.' };
    }

    if (data.name !== undefined) {
        const currentCategory = await prisma.menuCategory.findUnique({ where: { id } });
        if (currentCategory && currentCategory.name !== data.name) {
            const existingCategoryWithNewName = await prisma.menuCategory.findUnique({
                where: { name: data.name }
            });
            if (existingCategoryWithNewName) {
                return { error: `Another category with name "${data.name}" already exists.`};
            }
        }
    }

    const updateData: Prisma.MenuCategoryUpdateInput = {
      name: data.name,
      iconName: data.iconName,
    };

    if (data.hasOwnProperty('defaultPrinterRoleKey')) { // Check if the key is explicitly passed
      if (data.defaultPrinterRoleKey === null || data.defaultPrinterRoleKey === undefined || data.defaultPrinterRoleKey === '') {
        updateData.defaultPrinterRole = { disconnect: true }; // Disconnect if roleKey is null/undefined/empty
      } else {
        updateData.defaultPrinterRole = {
          connect: { roleKey: data.defaultPrinterRoleKey }
        };
      }
    }

    const updatedCategory = await prisma.menuCategory.update({
      where: { id },
      data: updateData,
      include: {
        defaultPrinterRole: { select: { roleKey: true, displayName: true } }
      }
    });
    return mapPrismaCategoryToAppCategory(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[], cause?: string } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name') && data.name) {
        return { error: `Another category with name "${data.name}" already exists.`};
    }
    if (prismaError.code === 'P2025') {
        if (prismaError.meta?.cause?.includes('PrinterRoleDefinitionToConnect')) {
            return { error: `Selected printer role with key "${data.defaultPrinterRoleKey}" not found for update.` };
        }
        return { error: 'Category to update not found.'};
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
        return { error: `Data validation error updating category: ${error.message.split('\n').slice(-2).join(' ')}` };
    }
    return { error: 'Failed to update category. Please check server logs.' };
  }
}

export async function deleteCategoryAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if any menu items are associated with this category
    const itemCount = await prisma.menuItem.count({
      where: { categoryId: id },
    });

    if (itemCount > 0) {
      return { success: false, error: `Cannot delete category. It has ${itemCount} associated menu item(s). Please reassign or delete them first.` };
    }
    
    await prisma.menuCategory.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
         return { success: false, error: 'Category not found or already deleted.' };
    }
    return { success: false, error: 'Failed to delete category. It might no longer exist or there was a server error.' };
  }
}
