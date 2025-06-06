
'use client';

import type { MenuCategory, MenuItem, Modifier } from '@/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Inbox } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MenuItemSelectorProps {
  categories: MenuCategory[];
  onSelectItem: (item: MenuItem, modifiers: Modifier[]) => void;
  isSaving: boolean;
}

export function MenuItemSelector({ categories: initialCategories, onSelectItem, isSaving }: MenuItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      const firstCategoryId = initialCategories[0].id;
      if (!selectedCategoryId || !initialCategories.find(cat => cat.id === selectedCategoryId)) {
        setSelectedCategoryId(firstCategoryId);
      }
    } else {
      if (selectedCategoryId !== null) {
        setSelectedCategoryId(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategories]);

  const handleItemClick = (item: MenuItem) => {
    if (isSaving) return;
    onSelectItem(item, []);
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId || !initialCategories) return null;
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
    <div className="flex flex-col h-full border-r border-border bg-card text-card-foreground p-3 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items in category..."
          className="pl-10 bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!selectedCategory || (initialCategories && initialCategories.length === 0) || isSaving}
        />
      </div>

      <div className="flex flex-1 min-h-0"> {/* Removed gap-3 */}
        <ScrollArea className="w-1/3 pr-3 border-r border-border/50"> {/* Added pr-3 and border-r */}
          <nav className="flex flex-col gap-2">
            {initialCategories && initialCategories.length > 0 ? (
              initialCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className={cn(
                    "w-full flex flex-col items-center justify-center h-14 p-2 text-sm leading-tight whitespace-normal break-words",
                    selectedCategoryId === category.id && "bg-accent text-accent-foreground",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => { if (!isSaving) setSelectedCategoryId(category.id); }}
                  disabled={isSaving}
                >
                  <span className="text-center leading-snug">{category.name}</span>
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

        <ScrollArea className="w-2/3 pl-3">  {/* Changed pl-1 to pl-3 */}
          {selectedCategory ? (
            <section id={`order-panel-items-${selectedCategory.id}`}>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center p-2 rounded-md hover:bg-accent/10 cursor-pointer transition-colors group border border-primary/60",
                        isSaving && "opacity-50 cursor-not-allowed hover:bg-transparent hover:border-transparent"
                      )}
                      onClick={() => handleItemClick(item)}
                      role="button"
                      tabIndex={isSaving ? -1 : 0}
                      onKeyDown={(e) => !isSaving && e.key === 'Enter' && handleItemClick(item)}
                      aria-disabled={isSaving}
                    >
                      {item.imageUrl && (
                        <div className="relative w-12 h-12 md:w-14 md:h-14 mr-2.5 rounded-md overflow-hidden shrink-0">
                          <Image src={item.imageUrl} alt={item.name} fill style={{objectFit: 'cover'}} data-ai-hint={item.dataAiHint} sizes="(max-width: 768px) 50px, 60px" />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      </div>
                      <Button variant="ghost" size="icon" className={cn("opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-7 w-7 shrink-0", isSaving && "hidden")}>
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
    
    
