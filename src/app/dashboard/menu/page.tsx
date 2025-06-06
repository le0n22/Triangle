
import type { MenuCategory, MenuItem, Modifier } from '@/types';
import { MenuBrowser } from '@/components/features/digital-menu/menu-browser';
import { getAllCategoriesAction, type AppMenuCategory as BackendMenuCategory } from '@backend/actions/categoryActions';
import { getAllMenuItemsAction, type AppMenuItem as BackendMenuItem } from '@backend/actions/menuItemActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

async function getMenuDataForBrowser(): Promise<MenuCategory[] | { error: string }> {
  console.log("DEBUG: menu/page.tsx - getMenuDataForBrowser called");
  const categoriesResult = await getAllCategoriesAction();
  const menuItemsResult = await getAllMenuItemsAction();

  if ('error' in categoriesResult) {
    console.error("DEBUG: menu/page.tsx - Error fetching categories:", categoriesResult.error);
    return { error: `Failed to load categories: ${categoriesResult.error}` };
  }
  if ('error' in menuItemsResult) {
    console.error("DEBUG: menu/page.tsx - Error fetching menu items:", menuItemsResult.error);
    return { error: `Failed to load menu items: ${menuItemsResult.error}` };
  }

  const dbCategories = categoriesResult as BackendMenuCategory[];
  const dbMenuItems = menuItemsResult as BackendMenuItem[];
  console.log(`DEBUG: menu/page.tsx - DB Categories: ${dbCategories.length}, DB Menu Items: ${dbMenuItems.length}`);

  // 1. Map all dbMenuItems to frontend MenuItem structure, including their original category name
  const allFrontendMenuItems: MenuItem[] = dbMenuItems.map(dbItem => {
    const categoryForThisItem = dbCategories.find(cat => cat.id === dbItem.categoryId);
    return {
      id: dbItem.id,
      name: dbItem.name,
      description: dbItem.description || '',
      price: dbItem.price,
      category: categoryForThisItem ? categoryForThisItem.name : 'Uncategorized', // Store original category name
      imageUrl: dbItem.imageUrl || undefined,
      dataAiHint: dbItem.dataAiHint || undefined,
      availableModifiers: dbItem.availableModifiers.map(mod => ({
        id: mod.id,
        name: mod.name,
        priceChange: mod.priceChange,
      })),
    };
  }).sort((a, b) => a.name.localeCompare(b.name)); // Sort all items by name

  // 2. Create the "All" category
  const allItemsCategory: MenuCategory = {
    id: 'all-items-pseudo-category-id', // Unique ID for "All" category
    name: 'All',
    iconName: 'List', // Icon for "All" category
    items: allFrontendMenuItems, // Contains all items, already sorted
  };

  // 3. Map DB categories and their specific items
  const mappedDbCategories: MenuCategory[] = dbCategories.map(dbCategory => {
    const itemsForThisCategory = dbMenuItems
      .filter(dbItem => dbItem.categoryId === dbCategory.id)
      .map(dbItem => { // Re-map to ensure correct MenuItem structure for items within this specific category
        return {
          id: dbItem.id,
          name: dbItem.name,
          description: dbItem.description || '',
          price: dbItem.price,
          category: dbCategory.name, // Use the current dbCategory.name here
          imageUrl: dbItem.imageUrl || undefined,
          dataAiHint: dbItem.dataAiHint || undefined,
          availableModifiers: dbItem.availableModifiers.map(mod => ({
            id: mod.id,
            name: mod.name,
            priceChange: mod.priceChange,
          })),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort items within this specific category

    return {
      id: dbCategory.id,
      name: dbCategory.name,
      iconName: dbCategory.iconName,
      items: itemsForThisCategory,
    };
  }).sort((a,b) => a.name.localeCompare(b.name)); // Sort the actual categories by name

  // 4. Prepend "All" category and return
  const finalMenuCategories = [allItemsCategory, ...mappedDbCategories];
  console.log("DEBUG: menu/page.tsx - Final categories structure:", finalMenuCategories.map(c => ({ id: c.id, name: c.name, itemCount: c.items.length })));
  return finalMenuCategories;
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
  
  if (menuData.length === 0 || (menuData.length === 1 && menuData[0].id === 'all-items-pseudo-category-id' && menuData[0].items.length === 0) ) {
     console.log("DEBUG: menu/page.tsx - Rendering empty menu state because menuData is effectively empty.");
     return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-headline font-bold text-foreground mb-4">Digital Menu</h1>
        <p className="text-muted-foreground text-lg">The menu is currently empty.</p>
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
