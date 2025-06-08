
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
import { CurrencySettings } from '@/components/features/settings/CurrencySettings';
// PrinterSettings import is removed
import type { TranslationKey } from '@/types'; 
import { useLanguage } from '@/hooks/use-language';


export default function SettingsPage() {
  const { t } = useLanguage();

  const settingsTabs: { value: string; labelKey: TranslationKey }[] = [
    { value: 'restaurant', labelKey: 'restaurant' },
    { value: 'appearance', labelKey: 'appearance' },
    { value: 'tables', labelKey: 'tables' },
    { value: 'categories', labelKey: 'categories' },
    { value: 'menu_items', labelKey: 'menu_items' },
    { value: 'modifiers', labelKey: 'modifiers' },
    // { value: 'printers', labelKey: 'printers' }, // "Printers" tab removed
    { value: 'order_platforms', labelKey: 'order_platforms' },
  ];


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold mb-8">{t('settings')}</h1>
      <Tabs defaultValue="restaurant" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2 mb-6">
           {settingsTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{t(tab.labelKey)}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="restaurant">
          <RestaurantSettings />
        </TabsContent>
        <TabsContent value="appearance">
          <div className="flex flex-wrap gap-8 justify-start">
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.07rem)] xl:w-[calc(33.333%-1.07rem)]">
              <ThemeSettings />
            </div>
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.07rem)] xl:w-[calc(33.333%-1.07rem)]">
              <LanguageSettings />
            </div>
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.07rem)] xl:w-[calc(33.333%-1.07rem)]">
              <CurrencySettings />
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
          <MenuItemManagementSettings /> 
        </TabsContent>
        <TabsContent value="modifiers">
          <ModifierManagementSettings />
        </TabsContent>
        {/* 
        PrinterSettings TabsContent removed
        <TabsContent value="printers">
          <PrinterSettings />
        </TabsContent> 
        */}
        <TabsContent value="order_platforms">
          <OrderPlatformSettings initialPlatforms={[]} /> 
        </TabsContent>
      </Tabs>
    </div>
  );
}
