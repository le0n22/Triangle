
import type { MenuCategory, MenuItem, Modifier } from '@/types';
import { MenuBrowser } from '@/components/features/digital-menu/menu-browser';
import { getAllCategoriesAction, type AppMenuCategory as BackendMenuCategory } from '@backend/actions/categoryActions';
import { getAllMenuItemsAction, type AppMenuItem as BackendMenuItem } from '@backend/actions/menuItemActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

async function getMenuDataForBrowser(): Promise<MenuCategory[] | { error: string }> {
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

  const menuCategoriesForBrowser: MenuCategory[] = dbCategories.map(dbCategory => {
    const itemsForThisCategory = dbMenuItems
      .filter(dbItem => dbItem.categoryId === dbCategory.id)
      .map(dbItem => {
        // Map BackendMenuItem to frontend MenuItem type
        const frontendMenuItem: MenuItem = {
          id: dbItem.id,
          name: dbItem.name,
          description: dbItem.description || '', // Ensure description is not null/undefined
          price: dbItem.price,
          category: dbCategory.name, // Use category name from the parent category
          imageUrl: dbItem.imageUrl || undefined,
          dataAiHint: dbItem.dataAiHint || undefined,
          availableModifiers: dbItem.availableModifiers.map(mod => ({ // Ensure modifiers match frontend type
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

  return menuCategoriesForBrowser.sort((a,b) => a.name.localeCompare(b.name));
}

export default async function MenuPage() {
  const menuData = await getMenuDataForBrowser();

  if ('error' in menuData) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Menu</AlertTitle>
          <AlertDescription>{menuData.error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (menuData.length === 0) {
     return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-headline font-bold text-foreground mb-4">Digital Menu</h1>
        <p className="text-muted-foreground text-lg">The menu is currently empty or no categories are defined.</p>
        <p className="text-sm text-muted-foreground">Please add categories and menu items in the settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <MenuBrowser categories={menuData} />
    </div>
  );
}
