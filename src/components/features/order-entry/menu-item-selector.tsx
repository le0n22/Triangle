
'use client';

import type { MenuCategory, MenuItem, Modifier } from '@/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MenuItemSelectorProps {
  categories: MenuCategory[];
  onSelectItem: (item: MenuItem, modifiers: Modifier[]) => void;
}

export function MenuItemSelector({ categories: initialCategories, onSelectItem }: MenuItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategories.length > 0 ? initialCategories[0].id : null
  );

  const handleItemClick = (item: MenuItem) => {
    // Modifiers are handled by the ModifierModal triggered from OrderPanel after item selection
    onSelectItem(item, []);
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return initialCategories.find(cat => cat.id === selectedCategoryId) || null;
  }, [selectedCategoryId, initialCategories]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedCategory.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
          disabled={!selectedCategory}
        />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Categories List (Left Panel) */}
        <ScrollArea className="w-1/3 pr-3 border-r border-border/50">
          <nav className="flex flex-col gap-1">
            {initialCategories.map((category) => (
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
            ))}
             {initialCategories.length === 0 && (
                <p className="text-center text-muted-foreground py-6 text-xs">No categories.</p>
            )}
          </nav>
        </ScrollArea>

        {/* Menu Items (Right Panel) */}
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
                <p className="text-center text-muted-foreground py-8 text-sm">
                  {selectedCategory.items.length > 0 ? 'No items match your search.' : 'This category is empty.'}
                </p>
              )}
            </section>
          ) : (
             initialCategories.length > 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Select a category.
                </p>
             ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No menu items available.
                </p>
             )
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
