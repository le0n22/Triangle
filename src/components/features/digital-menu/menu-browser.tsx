
'use client';

import type { MenuCategory, MenuItem } from '@/types';
import { MenuItemCard } from './menu-item-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Soup, UtensilsCrossed, CakeSlice, CupSoda, CookingPot, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MenuBrowserProps {
  categories: MenuCategory[];
}

const categoryIcons: Record<string, React.ElementType> = {
  Appetizers: Soup,
  'Main Courses': UtensilsCrossed,
  Desserts: CakeSlice,
  Beverages: CupSoda,
  Sides: CookingPot,
  default: Star,
};

export function MenuBrowser({ categories: initialCategories }: MenuBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategories.length > 0 ? initialCategories[0].id : null
  );
  const { toast } = useToast();

  const handleAddItemToOrder = (item: MenuItem) => {
    console.log('Adding item to order:', item);
    toast({
      title: `${item.name} added`,
      description: `1 x ${item.name} has been added to the current order.`,
      duration: 3000,
    });
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return initialCategories.find(cat => cat.id === selectedCategoryId) || null;
  }, [selectedCategoryId, initialCategories]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedCategory.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedCategory, searchTerm]);

  const IconComponent = selectedCategory ? (categoryIcons[selectedCategory.name] || categoryIcons.default) : null;

  if (!initialCategories || initialCategories.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-headline font-bold text-foreground mb-4">Digital Menu</h1>
        <p className="text-muted-foreground text-lg">The menu is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2*theme(spacing.6))]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 px-1">
        <h1 className="text-4xl font-headline font-bold text-foreground">Digital Menu</h1>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items in selected category..."
            className="pl-10 bg-card border-border focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!selectedCategory}
          />
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Categories List (Left Panel) */}
        <ScrollArea className="w-1/4 xl:w-1/5 pr-4 border-r border-border">
          <nav className="flex flex-col gap-1">
            {initialCategories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-auto py-2.5 px-3 text-sm",
                  selectedCategoryId === category.id && "bg-accent text-accent-foreground"
                )}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        {/* Menu Items (Right Panel) */}
        <ScrollArea className="w-3/4 xl:w-4/5 pl-6">
          {selectedCategory ? (
            <section id={selectedCategory.id}>
              <div className="flex items-center mb-6">
                {IconComponent && <IconComponent className="h-8 w-8 mr-3 text-primary" />}
                <h2 className="text-3xl font-headline font-semibold text-foreground">{selectedCategory.name}</h2>
              </div>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} onAddItem={handleAddItemToOrder} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10 text-lg">
                  {selectedCategory.items.length > 0 ? 'No menu items match your search in this category.' : 'This category is empty.'}
                </p>
              )}
            </section>
          ) : (
            <p className="text-center text-muted-foreground py-10 text-lg">
              Select a category to view its items.
            </p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
