
'use client';

import type { MenuCategory, MenuItem, Modifier } from '@/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Inbox } from 'lucide-react'; // Added Inbox
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MenuItemSelectorProps {
  categories: MenuCategory[];
  onSelectItem: (item: MenuItem, modifiers: Modifier[]) => void;
}

export function MenuItemSelector({ categories: initialCategories, onSelectItem }: MenuItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  console.log(`MenuItemSelector: Rendered. Received initialCategories count: ${initialCategories?.length}`);
  // console.log(`MenuItemSelector: Received initialCategories DATA:`, JSON.stringify(initialCategories, null, 2));


  useEffect(() => {
    console.log(`MenuItemSelector: useEffect for selectedCategoryId - initialCategories count: ${initialCategories?.length}, current selectedCategoryId: ${selectedCategoryId}`);
    if (initialCategories && initialCategories.length > 0) {
      const firstCategoryId = initialCategories[0].id;
      // If no category is selected OR if the currently selected category is no longer in the list
      if (!selectedCategoryId || !initialCategories.find(cat => cat.id === selectedCategoryId)) {
        console.log(`MenuItemSelector: Setting selectedCategoryId to first category: ${firstCategoryId}`);
        setSelectedCategoryId(firstCategoryId);
      } else {
        console.log(`MenuItemSelector: Current selection ${selectedCategoryId} is valid or already set.`);
      }
    } else { // initialCategories is empty or null/undefined
      if (selectedCategoryId !== null) { // Only update if it's not already null to avoid loop if initialCategories is always empty
        console.log(`MenuItemSelector: No/empty categories, setting selectedCategoryId to null.`);
        setSelectedCategoryId(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategories]); // Only run when initialCategories reference changes. SelectedCategoryId is managed internally.

  const handleItemClick = (item: MenuItem) => {
    onSelectItem(item, []); // Modifiers will be handled by ModifierModal in OrderPanel
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId || !initialCategories) return null;
    const category = initialCategories.find(cat => cat.id === selectedCategoryId);
    // console.log(`MenuItemSelector: selectedCategory memo. ID: ${selectedCategoryId}, Found:`, category?.name);
    return category || null;
  }, [selectedCategoryId, initialCategories]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    const items = selectedCategory.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    // console.log(`MenuItemSelector: filteredItems memo. Count: ${items.length} for category ${selectedCategory.name}`);
    return items;
  }, [selectedCategory, searchTerm]);

  return (
    <div className="flex flex-col h-full border-r border-border bg-card text-card-foreground p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items in category..."
          className="pl-10 bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!selectedCategory || (initialCategories && initialCategories.length === 0)}
        />
      </div>

      <div className="flex flex-1 min-h-0">
        <ScrollArea className="w-1/3 pr-3 border-r border-border/50">
          <nav className="flex flex-col gap-1">
            {initialCategories && initialCategories.length > 0 ? (
              initialCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto py-2 px-2.5 text-xs md:text-sm",
                    selectedCategoryId === category.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  {category.name}
                </Button>
              ))
            ) : (
                <div className="text-center text-muted-foreground py-6 text-xs px-2">
                    <Inbox className="mx-auto h-6 w-6 mb-1" />
                    No categories found.
                </div>
            )}
          </nav>
        </ScrollArea>

        <ScrollArea className="w-2/3 pl-3">
          {selectedCategory ? (
            <section id={`order-panel-items-${selectedCategory.id}`}>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-2 rounded-md hover:bg-accent/10 cursor-pointer transition-colors group border border-transparent hover:border-accent/50"
                      onClick={() => handleItemClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}
                    >
                      {item.imageUrl && (
                        <div className="relative w-12 h-12 md:w-14 md:h-14 mr-2.5 rounded-md overflow-hidden shrink-0">
                          <Image src={item.imageUrl} alt={item.name} fill style={{objectFit: 'cover'}} data-ai-hint={item.dataAiHint} sizes="(max-width: 768px) 50px, 60px" />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        <p className="text-xs md:text-sm font-medium text-primary">${item.price.toFixed(2)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-7 w-7 shrink-0">
                        <PlusCircle className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="text-center text-muted-foreground py-8 text-sm flex flex-col items-center">
                    <Inbox className="h-10 w-10 mb-2"/>
                    {selectedCategory.items.length > 0 ? 'No items match your search.' : 'This category is empty.'}
                 </div>
              )}
            </section>
          ) : (
             initialCategories && initialCategories.length > 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm flex flex-col items-center">
                    <Inbox className="h-10 w-10 mb-2"/>
                    Select a category to view items.
                </div>
             ) : (
                <div className="text-center text-muted-foreground py-8 text-sm flex flex-col items-center">
                    <Inbox className="h-10 w-10 mb-2"/>
                    No menu items available. Add categories and items in settings.
                </div>
             )
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
