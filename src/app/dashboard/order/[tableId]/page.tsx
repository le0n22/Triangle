
import type { MenuCategory, Order, MenuItem, Modifier } from '@/types';
import { OrderPanel } from '@/components/features/order-entry/order-panel';
import { getAllCategoriesAction, type AppMenuCategory as BackendMenuCategory } from '@backend/actions/categoryActions';
import { getAllMenuItemsAction, type AppMenuItem as BackendMenuItem } from '@backend/actions/menuItemActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Helper function to transform backend data to frontend MenuCategory structure
async function getMenuDataForOrderPanel(): Promise<MenuCategory[] | { error: string }> {
  console.log("DEBUG: order/[tableId]/page.tsx - getMenuDataForOrderPanel called");
  const categoriesResult = await getAllCategoriesAction();
  const menuItemsResult = await getAllMenuItemsAction();

  if ('error' in categoriesResult) {
    console.error("DEBUG: order/[tableId]/page.tsx - Error fetching categories:", categoriesResult.error);
    return { error: `Failed to load categories: ${categoriesResult.error}` };
  }
  if ('error' in menuItemsResult) {
    console.error("DEBUG: order/[tableId]/page.tsx - Error fetching menu items:", menuItemsResult.error);
    return { error: `Failed to load menu items: ${menuItemsResult.error}` };
  }

  const dbCategories = categoriesResult as BackendMenuCategory[];
  const dbMenuItems = menuItemsResult as BackendMenuItem[];
  console.log(`DEBUG: order/[tableId]/page.tsx - DB Categories: ${dbCategories.length}, DB Menu Items: ${dbMenuItems.length}`);

  // 1. Map all dbMenuItems to frontend MenuItem structure
  const allFrontendMenuItems: MenuItem[] = dbMenuItems.map(dbItem => {
    const categoryForThisItem = dbCategories.find(cat => cat.id === dbItem.categoryId);
    return {
      id: dbItem.id,
      name: dbItem.name,
      description: dbItem.description || '',
      price: dbItem.price,
      category: categoryForThisItem ? categoryForThisItem.name : 'Uncategorized',
      imageUrl: dbItem.imageUrl || undefined,
      dataAiHint: dbItem.dataAiHint || undefined,
      availableModifiers: dbItem.availableModifiers.map(mod => ({
        id: mod.id,
        name: mod.name,
        priceChange: mod.priceChange,
      })),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // 2. Create the "All" category
  const allItemsCategory: MenuCategory = {
    id: 'all-items-pseudo-category-id',
    name: 'All',
    iconName: 'List', // Though MenuItemSelector doesn't use icons, good for consistency
    items: allFrontendMenuItems,
  };

  // 3. Map DB categories and their specific items
  const mappedDbCategories: MenuCategory[] = dbCategories.map(dbCategory => {
    const itemsForThisCategory = dbMenuItems
      .filter(dbItem => dbItem.categoryId === dbCategory.id)
      .map(dbItem => {
        return {
          id: dbItem.id,
          name: dbItem.name,
          description: dbItem.description || '',
          price: dbItem.price,
          category: dbCategory.name,
          imageUrl: dbItem.imageUrl || undefined,
          dataAiHint: dbItem.dataAiHint || undefined,
          availableModifiers: dbItem.availableModifiers.map(mod => ({
            id: mod.id,
            name: mod.name,
            priceChange: mod.priceChange,
          })),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      id: dbCategory.id,
      name: dbCategory.name,
      iconName: dbCategory.iconName,
      items: itemsForThisCategory,
    };
  }).sort((a,b) => a.name.localeCompare(b.name));
  
  // 4. Prepend "All" category
  const finalMenuCategories = [allItemsCategory, ...mappedDbCategories];
  console.log("DEBUG: order/[tableId]/page.tsx - Final categories structure:", finalMenuCategories.map(c => ({ id: c.id, name: c.name, itemCount: c.items.length })));
  return finalMenuCategories;
}

interface OrderPageProps {
  params: {
    tableId: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { tableId } = params;
  // For now, initialOrder is null. Actual order fetching can be added later.
  const initialOrder = null; 
  const menuData = await getMenuDataForOrderPanel();

  if ('error' in menuData) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Menu Data</AlertTitle>
          <AlertDescription>{menuData.error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (menuData.length === 0 || (menuData.length === 1 && menuData[0].id === 'all-items-pseudo-category-id' && menuData[0].items.length === 0)) {
    console.log("DEBUG: order/[tableId]/page.tsx - No menu data (categories/items) found to pass to OrderPanel.");
    // OrderPanel should handle empty menuCategories gracefully.
    // Passing empty array ensures OrderPanel / MenuItemSelector can show "no items" message.
  }

  return (
    <OrderPanel tableId={tableId} initialOrder={initialOrder} menuCategories={menuData} />
  );
}

export async function generateStaticParams() {
  return [];
}
