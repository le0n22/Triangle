
import type { MenuCategory, Order, MenuItem, Modifier } from '@/types';
import { OrderPanel } from '@/components/features/order-entry/order-panel';
import { getAllCategoriesAction, type AppMenuCategory as BackendMenuCategory } from '@backend/actions/categoryActions';
import { getAllMenuItemsAction, type AppMenuItem as BackendMenuItem } from '@backend/actions/menuItemActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Helper function to transform backend data to frontend MenuCategory structure
async function getMenuDataForOrderPanel(): Promise<MenuCategory[] | { error: string }> {
  console.log("OrderPage: getMenuDataForOrderPanel called");
  const categoriesResult = await getAllCategoriesAction();
  const menuItemsResult = await getAllMenuItemsAction();

  if ('error' in categoriesResult) {
    console.error("OrderPage: Error fetching categories:", categoriesResult.error);
    return { error: `Failed to load categories: ${categoriesResult.error}` };
  }
  if ('error' in menuItemsResult) {
    console.error("OrderPage: Error fetching menu items:", menuItemsResult.error);
    return { error: `Failed to load menu items: ${menuItemsResult.error}` };
  }

  const dbCategories = categoriesResult as BackendMenuCategory[];
  const dbMenuItems = menuItemsResult as BackendMenuItem[];

  console.log("OrderPage: Fetched DB Categories Count:", dbCategories.length);
  console.log("OrderPage: Fetched DB Menu Items Count:", dbMenuItems.length);

  const menuCategoriesForPanel: MenuCategory[] = dbCategories.map(dbCategory => {
    const itemsForThisCategory = dbMenuItems
      .filter(dbItem => dbItem.categoryId === dbCategory.id)
      .map(dbItem => {
        // Map BackendMenuItem to frontend MenuItem type expected by OrderPanel/MenuItemSelector
        const frontendMenuItem: MenuItem = {
          id: dbItem.id,
          name: dbItem.name,
          description: dbItem.description || '',
          price: dbItem.price,
          category: dbCategory.name, // Category name for display in MenuItemCard if needed, though selector uses category objects
          imageUrl: dbItem.imageUrl || undefined,
          dataAiHint: dbItem.dataAiHint || undefined,
          availableModifiers: dbItem.availableModifiers.map(mod => ({
            id: mod.id,
            name: mod.name,
            priceChange: mod.priceChange,
          })),
        };
        return frontendMenuItem;
      });

    return {
      id: dbCategory.id,
      name: dbCategory.name,
      iconName: dbCategory.iconName,
      items: itemsForThisCategory.sort((a, b) => a.name.localeCompare(b.name)),
    };
  });
  
  const sortedMenuCategories = menuCategoriesForPanel.sort((a,b) => a.name.localeCompare(b.name));
  console.log("OrderPage: Transformed menuCategoriesForPanel Count:", sortedMenuCategories.length);
  // console.log("OrderPage: Transformed menuCategoriesForPanel DATA:", JSON.stringify(sortedMenuCategories, null, 2));
  return sortedMenuCategories;
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
  
  if (menuData.length === 0) {
    console.log("OrderPage: No menu data (categories/items) found to pass to OrderPanel.");
    // OrderPanel should handle empty menuCategories gracefully.
  }

  return (
    <OrderPanel tableId={tableId} initialOrder={initialOrder} menuCategories={menuData} />
  );
}

export async function generateStaticParams() {
  return [];
}
