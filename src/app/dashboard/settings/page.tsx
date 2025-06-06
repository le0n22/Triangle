
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantSettings } from '@/components/features/settings/restaurant-settings';
import { TableManagementSettings } from '@/components/features/settings/table-management-settings';
import { CategoryManagementSettings } from '@/components/features/settings/category-management-settings';
import { MenuItemManagementSettings } from '@/components/features/settings/menu-item-management-settings';
import { ModifierManagementSettings } from '@/components/features/settings/modifier-management-settings';
import { OrderPlatformSettings } from '@/components/features/settings/order-platform-settings';
import { ThemeSettings } from '@/components/features/settings/theme-settings';
import { LanguageSettings } from '@/components/features/settings/language-settings';
import type { Table, MenuCategory, MenuItem, Modifier, DeliveryPlatform, TranslationKey } from '@/types'; 
import { useLanguage } from '@/hooks/use-language';

// Mock data (ideally this would come from a global store or API in a real app)
const mockTablesData: Table[] = [
  { id: 't1', number: 1, status: 'available', capacity: 4 },
  { id: 't2', number: 2, status: 'occupied', capacity: 2, currentOrderId: 'ord123' },
  { id: 't3', number: 3, status: 'reserved', capacity: 6 },
];

const mockModifiersData: Modifier[] = [
  { id: 'mod1', name: 'Extra Cheese', priceChange: 1.50 },
  { id: 'mod2', name: 'No Onions', priceChange: 0.00 },
  { id: 'mod3', name: 'Spicy', priceChange: 0.50 },
  { id: 'mod4', name: 'Large Size', priceChange: 2.00 },
  { id: 'mod5', name: 'Gluten-Free Base', priceChange: 2.50 },
];

const mockCategoriesData: MenuCategory[] = [
  {
    id: 'cat1', name: 'Appetizers', iconName: 'Soup', items: [
      { id: 'item1', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls served with sweet chili sauce.', price: 8.99, category: 'Appetizers', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'spring rolls', availableModifiers: [mockModifiersData[1]] },
      { id: 'item2', name: 'Garlic Bread', description: 'Toasted baguette with garlic butter and herbs.', price: 6.50, category: 'Appetizers', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'garlic bread', availableModifiers: [mockModifiersData[0]] },
    ]
  },
  {
    id: 'cat2', name: 'Main Courses', iconName: 'UtensilsCrossed', items: [
      { id: 'item3', name: 'Grilled Salmon', description: 'Fresh salmon fillet grilled to perfection, served with roasted vegetables.', price: 22.00, category: 'Main Courses', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'grilled salmon', availableModifiers: [mockModifiersData[2]] },
      { id: 'item4', name: 'Margherita Pizza', description: 'Classic pizza with tomato, mozzarella, and basil.', price: 15.00, category: 'Main Courses', imageUrl: 'https://placehold.co/100x100.png', dataAiHint:'pizza food', availableModifiers: [mockModifiersData[0], mockModifiersData[2], mockModifiersData[4]] },
    ]
  },
];

const mockMenuItemsData: MenuItem[] = mockCategoriesData.flatMap(cat => cat.items);

const mockDeliveryPlatforms: DeliveryPlatform[] = [
  { id: 'dp1', name: 'Trendyol GO', apiKey: 'tg_test_key_123', apiSecret: 'tg_test_secret_xyz', isEnabled: true },
  { id: 'dp2', name: 'Yemeksepeti', apiKey: 'ys_live_key_456', apiSecret: 'ys_live_secret_abc', isEnabled: true },
  { id: 'dp3', name: 'Migros Yemek', apiKey: '', apiSecret: '', isEnabled: false },
];


export default function SettingsPage() {
  const { t } = useLanguage();

  const settingsTabs: { value: string; labelKey: TranslationKey }[] = [
    { value: 'restaurant', labelKey: 'restaurant' },
    { value: 'appearance', labelKey: 'appearance' },
    { value: 'tables', labelKey: 'tables' },
    { value: 'categories', labelKey: 'categories' },
    { value: 'menu_items', labelKey: 'menu_items' },
    { value: 'modifiers', labelKey: 'modifiers' },
    { value: 'order_platforms', labelKey: 'order_platforms' },
  ];


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold mb-8">{t('settings')}</h1>
      <Tabs defaultValue="restaurant" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 mb-6">
           {settingsTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{t(tab.labelKey)}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="restaurant">
          <RestaurantSettings />
        </TabsContent>
        <TabsContent value="appearance">
          <div className="flex flex-col md:flex-row md:space-x-8 md:space-y-0 space-y-8">
            <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent content overflow */}
              <ThemeSettings />
            </div>
            <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent content overflow */}
              <LanguageSettings />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tables">
          <TableManagementSettings />
        </TabsContent>
        <TabsContent value="categories">
          <CategoryManagementSettings />
        </TabsContent>
        <TabsContent value="menu_items">
          <MenuItemManagementSettings 
            initialMenuItems={mockMenuItemsData} 
            categories={mockCategoriesData}
            modifiers={mockModifiersData}
          />
        </TabsContent>
        <TabsContent value="modifiers">
          <ModifierManagementSettings />
        </TabsContent>
        <TabsContent value="order_platforms">
          <OrderPlatformSettings initialPlatforms={mockDeliveryPlatforms} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

