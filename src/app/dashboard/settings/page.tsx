
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantSettings } from '@/components/features/settings/restaurant-settings';
import { TableManagementSettings } from '@/components/features/settings/table-management-settings';
import { CategoryManagementSettings } from '@/components/features/settings/category-management-settings';
import { MenuItemManagementSettings } from '@/components/features/settings/menu-item-management-settings';
import { ModifierManagementSettings } from '@/components/features/settings/modifier-management-settings';
import { PrinterRoleManagementSettings } from '@/components/features/settings/printer-role-management-settings';
import { OrderPlatformSettings } from '@/components/features/settings/order-platform-settings';
import { ThemeSettings } from '@/components/features/settings/theme-settings';
import { LanguageSettings } from '@/components/features/settings/language-settings';
import { CurrencySettings } from '@/components/features/settings/CurrencySettings';
import type { TranslationKey } from '@/types'; 
import { useLanguage } from '@/hooks/use-language';


export default function SettingsPage() {
  const { t } = useLanguage();

  const settingsTabs: { value: string; labelKey: TranslationKey }[] = [
    { value: 'restaurant', labelKey: 'restaurant' },
    { value: 'appearance', labelKey: 'appearance' },
    { value: 'tables', labelKey: 'tables' },
    { value: 'printer_roles', labelKey: 'printerRoles' },
    { value: 'categories', labelKey: 'categories' },
    { value: 'menu_items', labelKey: 'menu_items' },
    { value: 'modifiers', labelKey: 'modifiers' },
    { value: 'order_platforms', labelKey: 'order_platforms' },
  ];


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold mb-8">{t('settings')}</h1>
      <Tabs defaultValue="restaurant" className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-2 mb-10">
           {settingsTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{t(tab.labelKey)}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="restaurant" className="mt-10">
          <RestaurantSettings />
        </TabsContent>
        <TabsContent value="appearance" className="mt-10">
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
        <TabsContent value="tables" className="mt-10">
          <TableManagementSettings />
        </TabsContent>
        <TabsContent value="printer_roles" className="mt-10">
          <PrinterRoleManagementSettings />
        </TabsContent>
        <TabsContent value="categories" className="mt-10">
          <CategoryManagementSettings />
        </TabsContent>
        <TabsContent value="menu_items" className="mt-10">
          <MenuItemManagementSettings /> 
        </TabsContent>
        <TabsContent value="modifiers" className="mt-10">
          <ModifierManagementSettings />
        </TabsContent>
        <TabsContent value="order_platforms" className="mt-10">
          <OrderPlatformSettings initialPlatforms={[]} /> 
        </TabsContent>
      </Tabs>
    </div>
  );
}
