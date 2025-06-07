
'use server';

import prisma from '@backend/lib/prisma';
import type { MenuItem as PrismaMenuItem, MenuCategory as PrismaMenuCategory, Modifier as PrismaModifier, PrinterRole as PrismaPrinterRole } from '@prisma/client';
import type { PrinterRole } from '@/types'; // Import frontend PrinterRole

// Frontend'in kullanacağı MenuItem tipi
// Kategori ve modifier detaylarını da içerebilir
export interface AppMenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number; // Should be number
  imageUrl?: string | null;
  dataAiHint?: string | null;
  categoryId: string;
  categoryName: string; // Kategori adını göstermek için
  availableModifiers: { id: string; name: string; priceChange: number }[]; // priceChange should be number
  defaultPrinterRole?: PrinterRole | null; // Added field
  createdAt: Date;
  updatedAt: Date;
}

// Veri transfer objesi (DTO) veya form verisi için tip
export interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  dataAiHint?: string;
  categoryId: string;
  availableModifierIds?: string[]; // Sadece ID'ler
  defaultPrinterRole?: PrinterRole | null; // Added field for form data consistency, though not directly used in create/update yet via UI
}

function mapPrismaMenuItemToAppMenuItem(
  prismaMenuItem: PrismaMenuItem & { category: PrismaMenuCategory; availableModifiers: PrismaModifier[] }
): AppMenuItem {
  return {
    id: prismaMenuItem.id,
    name: prismaMenuItem.name,
    description: prismaMenuItem.description,
    price: prismaMenuItem.price.toNumber(), // Convert Decimal to number
    imageUrl: prismaMenuItem.imageUrl,
    dataAiHint: prismaMenuItem.dataAiHint,
    categoryId: prismaMenuItem.categoryId,
    categoryName: prismaMenuItem.category.name,
    availableModifiers: prismaMenuItem.availableModifiers.map(mod => ({
      id: mod.id,
      name: mod.name,
      priceChange: mod.priceChange.toNumber(), // Convert Decimal to number
    })),
    defaultPrinterRole: prismaMenuItem.defaultPrinterRole ? prismaMenuItem.defaultPrinterRole as PrinterRole : null, // Map the role
    createdAt: prismaMenuItem.createdAt,
    updatedAt: prismaMenuItem.updatedAt,
  };
}

export async function getAllMenuItemsAction(): Promise<AppMenuItem[] | { error: string }> {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true,
        availableModifiers: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return menuItems.map(mapPrismaMenuItemToAppMenuItem);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return { error: 'Failed to fetch menu items. Please check server logs.' };
  }
}

export async function createMenuItemAction(data: MenuItemFormData): Promise<AppMenuItem | { error: string }> {
  try {
    if (!data.name || !data.categoryId || data.price === undefined || data.price === null) {
      return { error: 'Menu item name, category, and price are required.' };
    }
    if (data.price < 0) {
        return { error: 'Price cannot be negative.' };
    }

    const existingItem = await prisma.menuItem.findFirst({
        where: { name: data.name }
    });
    if (existingItem) {
        return { error: `Menu item with name "${data.name}" already exists.`};
    }

    const newMenuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price, // Prisma handles number to Decimal conversion here
        imageUrl: data.imageUrl || null,
        dataAiHint: data.dataAiHint || null,
        category: {
          connect: { id: data.categoryId },
        },
        availableModifiers: data.availableModifierIds && data.availableModifierIds.length > 0
          ? {
              connect: data.availableModifierIds.map(id => ({ id })),
            }
          : undefined,
        defaultPrinterRole: data.defaultPrinterRole ? data.defaultPrinterRole as PrismaPrinterRole : null, // Add to create
      },
      include: {
        category: true,
        availableModifiers: true,
      },
    });
    return mapPrismaMenuItemToAppMenuItem(newMenuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[], cause?: string } };
     if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
      return { error: `Menu item with name "${data.name}" already exists.` };
    }
    if (prismaError.code === 'P2025' && prismaError.meta?.cause?.includes('CategoryToConnect')) {
        return { error: 'Selected category not found.'};
    }
    return { error: 'Failed to create menu item. Please check server logs.' };
  }
}

export async function updateMenuItemAction(id: string, data: Partial<MenuItemFormData>): Promise<AppMenuItem | { error: string }> {
  try {
    if (data.name === '') return { error: 'Menu item name cannot be empty.' };
    if (data.price !== undefined && data.price < 0) return { error: 'Price cannot be negative.' };
    if (data.categoryId === '') return { error: 'Category cannot be empty.' };

    if (data.name) {
        const existingItemWithNewName = await prisma.menuItem.findFirst({
            where: { name: data.name, NOT: { id: id } }
        });
        if (existingItemWithNewName) {
            return { error: `Another menu item with name "${data.name}" already exists.`};
        }
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price, // Prisma handles number to Decimal conversion
        imageUrl: data.imageUrl,
        dataAiHint: data.dataAiHint,
        category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
        availableModifiers: data.availableModifierIds !== undefined // Check if it's explicitly passed
          ? {
              set: data.availableModifierIds.map(modId => ({ id: modId })),
            }
          : undefined,
        defaultPrinterRole: data.defaultPrinterRole === null
          ? null
          : (data.defaultPrinterRole ? data.defaultPrinterRole as PrismaPrinterRole : undefined), // Add to update
      },
      include: {
        category: true,
        availableModifiers: true,
      },
    });
    return mapPrismaMenuItemToAppMenuItem(updatedMenuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[], cause?: string } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name') && data.name) {
      return { error: `Another menu item with name "${data.name}" already exists.` };
    }
    if (prismaError.code === 'P2025') {
        if (prismaError.meta?.cause?.includes('record to update not found')) {
             return { error: 'Menu item to update not found.'};
        }
        if (prismaError.meta?.cause?.includes('CategoryToConnect')) {
            return { error: 'Selected category for update not found.'};
        }
       return { error: 'Failed to update menu item: Record not found or related record missing.' };
    }
    return { error: 'Failed to update menu item. Please check server logs.' };
  }
}

export async function deleteMenuItemAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.menuItem.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting menu item:', error);
    const prismaError = error as { code?: string, meta?: { cause?: string } };
    if (prismaError.code === 'P2025') {
         return { success: false, error: 'Menu item not found or already deleted.' };
    }
    if (prismaError.code === 'P2003') {
        return { success: false, error: 'Cannot delete menu item. It is part of one or more existing orders.' };
    }
    return { success: false, error: 'Failed to delete menu item. Please check server logs.' };
  }
}
