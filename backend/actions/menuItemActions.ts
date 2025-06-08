
'use server';

import prisma from '@backend/lib/prisma';
import type { MenuItem as PrismaMenuItem, MenuCategory as PrismaMenuCategory, Modifier as PrismaModifier } from '@prisma/client';
import type { AppMenuItem } from '@/types'; // Ensure AppMenuItem uses string for roleKey

// Veri transfer objesi (DTO) veya form verisi için tip
export interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  dataAiHint?: string;
  categoryId: string;
  availableModifierIds?: string[];
  defaultPrinterRoleKey?: string | null; // Changed from PrinterRole to string (roleKey)
}

function mapPrismaMenuItemToAppMenuItem(
  prismaMenuItem: PrismaMenuItem & { 
    category: PrismaMenuCategory; 
    availableModifiers: PrismaModifier[];
    defaultPrinterRole?: { roleKey: string; displayName: string } | null;
  }
): AppMenuItem {
  return {
    id: prismaMenuItem.id,
    name: prismaMenuItem.name,
    description: prismaMenuItem.description,
    price: prismaMenuItem.price.toNumber(),
    imageUrl: prismaMenuItem.imageUrl,
    dataAiHint: prismaMenuItem.dataAiHint,
    categoryId: prismaMenuItem.categoryId,
    categoryName: prismaMenuItem.category.name, // Kategori adını göstermek için
    availableModifiers: prismaMenuItem.availableModifiers.map(mod => ({
      id: mod.id,
      name: mod.name,
      priceChange: mod.priceChange.toNumber(),
    })),
    defaultPrinterRoleKey: prismaMenuItem.defaultPrinterRole?.roleKey ?? undefined,
    defaultPrinterRoleDisplayName: prismaMenuItem.defaultPrinterRole?.displayName ?? undefined,
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
        defaultPrinterRole: { // Include the related PrinterRoleDefinition
          select: {
            roleKey: true,
            displayName: true,
          }
        }
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

    const createData: Prisma.MenuItemCreateInput = {
      name: data.name,
      description: data.description || null,
      price: data.price,
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
    };

    if (data.defaultPrinterRoleKey) {
      createData.defaultPrinterRole = {
        connect: { roleKey: data.defaultPrinterRoleKey }
      };
    }

    const newMenuItem = await prisma.menuItem.create({
      data: createData,
      include: {
        category: true,
        availableModifiers: true,
        defaultPrinterRole: { select: { roleKey: true, displayName: true } }
      },
    });
    return mapPrismaMenuItemToAppMenuItem(newMenuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[], cause?: string } };
     if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
      return { error: `Menu item with name "${data.name}" already exists.` };
    }
    if (prismaError.code === 'P2025') {
        if (prismaError.meta?.cause?.includes('CategoryToConnect')) {
            return { error: 'Selected category not found.'};
        }
        if (prismaError.meta?.cause?.includes('PrinterRoleDefinitionToConnect')) {
            return { error: `Selected printer role with key "${data.defaultPrinterRoleKey}" not found.` };
        }
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

    const updateData: Prisma.MenuItemUpdateInput = {
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      dataAiHint: data.dataAiHint,
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      availableModifiers: data.availableModifierIds !== undefined
        ? { set: data.availableModifierIds.map(modId => ({ id: modId })) }
        : undefined,
    };

    if (data.hasOwnProperty('defaultPrinterRoleKey')) {
      if (data.defaultPrinterRoleKey === null || data.defaultPrinterRoleKey === undefined || data.defaultPrinterRoleKey === '') {
        updateData.defaultPrinterRole = { disconnect: true };
      } else {
        updateData.defaultPrinterRole = {
          connect: { roleKey: data.defaultPrinterRoleKey }
        };
      }
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        availableModifiers: true,
        defaultPrinterRole: { select: { roleKey: true, displayName: true } }
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
        if (prismaError.meta?.cause?.includes('PrinterRoleDefinitionToConnect')) {
            return { error: `Selected printer role with key "${data.defaultPrinterRoleKey}" not found for update.` };
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
    if (prismaError.code === 'P2003') { // Foreign key constraint failed
        // Check if it's related to OrderItem
        if (prismaError.meta?.cause?.toLowerCase().includes('orderitemtomenuitem')) {
            return { success: false, error: 'Cannot delete menu item. It is part of one or more existing orders.' };
        }
    }
    return { success: false, error: 'Failed to delete menu item. Please check server logs.' };
  }
}
