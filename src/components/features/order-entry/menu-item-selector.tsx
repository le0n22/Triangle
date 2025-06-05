'use client';

import type { MenuCategory, MenuItem, Modifier } from '@/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


interface MenuItemSelectorProps {
  categories: MenuCategory[];
  onSelectItem: (item: MenuItem, modifiers: Modifier[]) => void; 
}

export function MenuItemSelector({ categories, onSelectItem }: MenuItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleItemClick = (item: MenuItem) => {
    onSelectItem(item, []);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="flex flex-col h-full border-r border-border bg-card text-card-foreground p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menu..."
          className="pl-10 bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-grow">
        <Accordion type="multiple" defaultValue={categories.map(c => c.id)} className="w-full">
          {filteredCategories.map((category) => (
            <AccordionItem value={category.id} key={category.id}>
              <AccordionTrigger className="hover:no-underline text-base font-headline">{category.name}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-3 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
                      onClick={() => handleItemClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}
                    >
                      {item.imageUrl && (
                        <div className="relative w-16 h-16 mr-3 rounded-md overflow-hidden shrink-0">
                          <Image src={item.imageUrl} alt={item.name} fill style={{objectFit: 'cover'}} data-ai-hint={item.dataAiHint} />
                        </div>
                      )}
                      <div className="flex-grow">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        <p className="text-sm font-medium text-primary">${item.price.toFixed(2)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <PlusCircle className="h-5 w-5 text-primary" />
                      </Button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {filteredCategories.length === 0 && (
          <p className="text-center text-muted-foreground py-6">No items match your search.</p>
        )}
      </ScrollArea>
    </div>
  );
}
