
'use server';

import prisma from '@backend/lib/prisma';
import type { MenuCategory as PrismaMenuCategory, PrinterRole as PrismaPrinterRole } from '@prisma/client';
import type { PrinterRole } from '@/types'; // Import frontend PrinterRole

// Define the AppMenuCategory type to be used by the frontend
export interface AppMenuCategory {
  id: string;
  name: string;
  iconName?: string; // Optional
  defaultPrinterRole?: PrinterRole; // Added optional field
}

// Helper function to map Prisma MenuCategory to our AppMenuCategory type
function mapPrismaCategoryToAppCategory(prismaCategory: PrismaMenuCategory): AppMenuCategory {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    iconName: prismaCategory.iconName ?? undefined,
    defaultPrinterRole: prismaCategory.defaultPrinterRole ? prismaCategory.defaultPrinterRole as PrinterRole : undefined,
  };
}

export async function getAllCategoriesAction(): Promise<AppMenuCategory[]> {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return categories.map(mapPrismaCategoryToAppCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Return empty array on error, or throw
  }
}

export async function createCategoryAction(data: {
  name: string;
  iconName?: string;
  defaultPrinterRole?: PrinterRole; // Added field
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

    const newCategory = await prisma.menuCategory.create({
      data: {
        name: data.name,
        iconName: data.iconName || null,
        defaultPrinterRole: data.defaultPrinterRole ? data.defaultPrinterRole as PrismaPrinterRole : null,
      },
    });
    return mapPrismaCategoryToAppCategory(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
        return { error: `Category with name "${data.name}" already exists.` };
    }
    return { error: 'Failed to create category. Please check server logs.' };
  }
}

export async function updateCategoryAction(
  id: string,
  data: Partial<{ name: string; iconName?: string; defaultPrinterRole?: PrinterRole | null }> // Allow null to unset
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
    
    const updatedCategory = await prisma.menuCategory.update({
      where: { id },
      data: {
        name: data.name,
        iconName: data.iconName,
        defaultPrinterRole: data.defaultPrinterRole === null 
          ? null 
          : (data.defaultPrinterRole ? data.defaultPrinterRole as PrismaPrinterRole : undefined),
      },
    });
    return mapPrismaCategoryToAppCategory(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name') && data.name) {
        return { error: `Another category with name "${data.name}" already exists.`};
    }
    if (prismaError.code === 'P2025') {
        return { error: 'Category to update not found.'};
    }
    return { error: 'Failed to update category. Please check server logs.' };
  }
}

export async function deleteCategoryAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
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
