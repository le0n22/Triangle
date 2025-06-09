
'use server';

import prisma from '@backend/lib/prisma';
import type { MenuCategory as PrismaMenuCategory } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { AppMenuCategory } from '@/types';

// Helper function to map Prisma MenuCategory to our AppMenuCategory type
function mapPrismaCategoryToAppCategory(
  prismaCategory: PrismaMenuCategory
): AppMenuCategory {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    iconName: prismaCategory.iconName ?? undefined,
  };
}

export async function getAllCategoriesAction(): Promise<AppMenuCategory[]> {
  try {
    // Removed include for defaultPrinterRole completely
    const categories = await prisma.menuCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return categories.map(mapPrismaCategoryToAppCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Propagate the error so the frontend can know something went wrong.
    // Consider if you want to return an empty array or a more specific error object.
    // For now, throwing the error to make it clear.
    // If you prefer to return { error: string }, you can change this.
    throw error; 
    // Or return { error: (error as Error).message } if you adapt the frontend.
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
    
    const createData: Prisma.MenuCategoryCreateInput = {
      name: data.name,
      iconName: data.iconName || null,
    };

    const newCategory = await prisma.menuCategory.create({
      data: createData,
    });
    return mapPrismaCategoryToAppCategory(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[], cause?: string } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
        return { error: `Category with name "${data.name}" already exists.` };
    }
    return { error: 'Failed to create category. Please check server logs.' };
  }
}

export async function updateCategoryAction(
  id: string,
  data: Partial<{ name: string; iconName?: string; }>
): Promise<AppMenuCategory | { error: string }> {
  try {
    if (data.name === '') {
        return { error: 'Category name cannot be empty.' };
    }

    if (data.name !== undefined) {
        const currentCategory = await prisma.menuCategory.findUnique({ where: { id } });
        // Check if name is being changed and if the new name already exists for another category
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

    const updatedCategory = await prisma.menuCategory.update({
      where: { id },
      data: updateData,
    });
    return mapPrismaCategoryToAppCategory(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[], cause?: string } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name') && data.name) {
        return { error: `Another category with name "${data.name}" already exists.`};
    }
    if (prismaError.code === 'P2025') {
        return { error: 'Category to update not found.'};
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
        // Attempt to provide a more specific validation error message
        return { error: `Data validation error updating category: ${error.message.split('\\n').slice(-2).join(' ')}` };
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
    if (prismaError.code === 'P2025') { // Record to delete not found.
         return { success: false, error: 'Category not found or already deleted.' };
    }
    return { success: false, error: 'Failed to delete category. It might no longer exist or there was a server error.' };
  }
}
