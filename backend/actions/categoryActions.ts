
'use server';

import prisma from '@backend/lib/prisma';
import type { MenuCategory as PrismaMenuCategory } from '@prisma/client';

// Define the AppMenuCategory type to be used by the frontend
// This should align with the structure expected by your frontend components
// and might be slightly different from PrismaMenuCategory if you add/remove/transform fields.
export interface AppMenuCategory {
  id: string;
  name: string;
  iconName?: string; // Optional
  // 'items' field is usually populated on the client or through a separate query
  // For basic category management, we might not need to return items with every category.
}

// Helper function to map Prisma MenuCategory to our AppMenuCategory type
// For now, it's a direct mapping for the relevant fields.
function mapPrismaCategoryToAppCategory(prismaCategory: PrismaMenuCategory): AppMenuCategory {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    iconName: prismaCategory.iconName ?? undefined,
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
        iconName: data.iconName || null, // Ensure null if empty string or undefined
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
  data: Partial<{ name: string; iconName?: string }>
): Promise<AppMenuCategory | { error: string }> {
  try {
    if (data.name === '') { // Check for empty string specifically if name is part of data
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
        name: data.name, // Will be undefined if not provided, Prisma handles this
        iconName: data.iconName, // Same here
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
    // Prisma's `onDelete: Cascade` for the relation in `MenuItem` 
    // should handle deleting associated menu items automatically.
    await prisma.menuCategory.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') { // Record to delete not found
         return { success: false, error: 'Category not found or already deleted.' };
    }
    // P2003 would be for foreign key constraint if onDelete was not Cascade or Restrict
    return { success: false, error: 'Failed to delete category. It might no longer exist or there was a server error.' };
  }
}

    