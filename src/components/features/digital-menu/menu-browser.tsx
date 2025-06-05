'use client';

import type { MenuCategory, MenuItem } from '@/types';
import { MenuCategorySection } from './menu-category-section';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MenuBrowserProps {
  categories: MenuCategory[];
}

export function MenuBrowser({ categories: initialCategories }: MenuBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleAddItemToOrder = (item: MenuItem) => {
    // This is a placeholder. In a real app, this would interact with an order context/state.
    console.log('Adding item to order:', item);
    toast({
      title: `${item.name} added`,
      description: `1 x ${item.name} has been added to the current order.`,
      duration: 3000,
    });
  };
  
  const filteredCategories = initialCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">Digital Menu</h1>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search menu items..." 
            className="pl-10 bg-card border-border focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <MenuCategorySection 
            key={category.id} 
            category={category} 
            onAddItemToOrder={handleAddItemToOrder}
          />
        ))
      ) : (
        <p className="text-center text-muted-foreground py-10 text-lg">
          {initialCategories.length > 0 ? 'No menu items match your search.' : 'The menu is currently empty.'}
        </p>
      )}
    </div>
  );
}
