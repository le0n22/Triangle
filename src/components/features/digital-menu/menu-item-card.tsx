import type { MenuItem } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAddItem: (item: MenuItem) => void; // Callback when item is added to order
}

export function MenuItemCard({ item, onAddItem }: MenuItemCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full bg-card text-card-foreground shadow-lg hover:shadow-primary/20 transition-shadow duration-200 group">
      {item.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{objectFit: 'cover'}}
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={item.dataAiHint}
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-headline">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground min-h-[40px] line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <p className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => onAddItem(item)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add to Order
        </Button>
      </CardFooter>
    </Card>
  );
}
