

import type { MenuCategory, Order as AppOrder } from '@/types'; // Using frontend MenuCategory type
import { OrderPanel } from '@/components/features/order-entry/order-panel';
import { getAllCategoriesAction, type AppMenuCategory as BackendMenuCategory } from '@backend/actions/categoryActions';
import { getAllMenuItemsAction, type AppMenuItem as BackendMenuItem } from '@backend/actions/menuItemActions';
import { getOpenOrderByTableIdAction } from '@backend/actions/orderActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Inbox } from 'lucide-react';

async function getMenuDataForOrderPanel(): Promise<MenuCategory[] | { error: string }> {
  const categoriesResult = await getAllCategoriesAction();
  const menuItemsResult = await getAllMenuItemsAction();

  if ('error' in categoriesResult) {
    return { error: `Failed to load categories: ${categoriesResult.error}` };
  }
  if ('error' in menuItemsResult) {
    return { error: `Failed to load menu items: ${menuItemsResult.error}` };
  }

  const dbCategories = categoriesResult as BackendMenuCategory[];
  const dbMenuItems = menuItemsResult as BackendMenuItem[];

  const allFrontendMenuItems: MenuCategory['items'][0][] = dbMenuItems.map(dbItem => {
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
      categoryId: dbItem.categoryId,
      defaultPrinterRole: dbItem.defaultPrinterRoleKey && dbItem.defaultPrinterRoleDisplayName
        ? { roleKey: dbItem.defaultPrinterRoleKey, displayName: dbItem.defaultPrinterRoleDisplayName }
        : null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const allItemsCategory: MenuCategory = {
    id: 'all-items-pseudo-category-id',
    name: 'All',
    iconName: 'List',
    items: allFrontendMenuItems,
    defaultPrinterRole: null, 
  };

  const mappedDbCategories: MenuCategory[] = dbCategories.map(dbCategory => {
    const itemsForThisCategory = dbMenuItems
      .filter(dbItem => dbItem.categoryId === dbCategory.id)
      .map(dbItem => {
        // This mapping needs to be for the MenuItem type expected by MenuCategory['items']
        return {
          id: dbItem.id,
          name: dbItem.name,
          description: dbItem.description || '',
          price: dbItem.price,
          category: dbCategory.name, // Set category name for the item
          imageUrl: dbItem.imageUrl || undefined,
          dataAiHint: dbItem.dataAiHint || undefined,
          availableModifiers: dbItem.availableModifiers.map(mod => ({
            id: mod.id,
            name: mod.name,
            priceChange: mod.priceChange,
          })),
          categoryId: dbItem.categoryId,
          defaultPrinterRole: dbItem.defaultPrinterRoleKey && dbItem.defaultPrinterRoleDisplayName
            ? { roleKey: dbItem.defaultPrinterRoleKey, displayName: dbItem.defaultPrinterRoleDisplayName }
            : null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      id: dbCategory.id,
      name: dbCategory.name,
      iconName: dbCategory.iconName,
      items: itemsForThisCategory, // items are now correctly typed as MenuItem[]
      defaultPrinterRole: dbCategory.defaultPrinterRoleKey && dbCategory.defaultPrinterRoleDisplayName
        ? { roleKey: dbCategory.defaultPrinterRoleKey, displayName: dbCategory.defaultPrinterRoleDisplayName }
        : null,
    };
  }).sort((a,b) => a.name.localeCompare(b.name));
  
  const finalMenuCategories = [allItemsCategory, ...mappedDbCategories];
  return finalMenuCategories;
}

interface OrderPageProps {
  params: {
    tableId: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { tableId } = params;
  console.log(`OrderPage: Rendering for tableId: ${tableId} - Applying dynamic printer role logic.`);

  const menuDataResult = await getMenuDataForOrderPanel();
  const initialOrderResult = await getOpenOrderByTableIdAction(tableId);

  let initialOrder: AppOrder | null = null;
  if (initialOrderResult && 'error' in initialOrderResult) {
    console.error(`Error fetching open order for table ${tableId}:`, initialOrderResult.error);
  } else if (initialOrderResult) {
    initialOrder = initialOrderResult;
  }

  if ('error' in menuDataResult) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Menu Data</AlertTitle>
          <AlertDescription>{menuDataResult.error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const menuCategories = menuDataResult;

  if (menuCategories.length === 0 || (menuCategories.length === 1 && menuCategories[0].id === 'all-items-pseudo-category-id' && menuCategories[0].items.length === 0)) {
     return (
      <div className="container mx-auto py-10 h-[calc(100vh-var(--header-height,4rem)-2*theme(spacing.6))] flex flex-col justify-center items-center">
        <Inbox className="w-24 h-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-headline font-bold text-foreground mb-2">Menu is Empty</h1>
        <p className="text-muted-foreground text-lg">Cannot take orders without menu items.</p>
        <p className="text-sm text-muted-foreground">Please add categories and menu items in the settings page.</p>
      </div>
    );
  }

  return (
    <OrderPanel 
        tableIdParam={tableId} 
        initialOrder={initialOrder} 
        menuCategories={menuCategories} 
    />
  );
}

export async function generateStaticParams() {
  return [];
}

    