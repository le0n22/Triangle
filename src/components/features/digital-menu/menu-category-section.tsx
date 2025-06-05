import type { MenuCategory, MenuItem } from '@/types';
import { MenuItemCard } from './menu-item-card';
import { Separator } from '@/components/ui/separator';
import { Soup, UtensilsCrossed, CakeSlice, CupSoda, CookingPot, Star } from 'lucide-react'; // Example icons

const categoryIcons: Record<string, React.ElementType> = {
  Appetizers: Soup,
  'Main Courses': UtensilsCrossed,
  Desserts: CakeSlice,
  Beverages: CupSoda,
  Sides: CookingPot,
  default: Star,
};


interface MenuCategorySectionProps {
  category: MenuCategory;
  onAddItemToOrder: (item: MenuItem) => void;
}

export function MenuCategorySection({ category, onAddItemToOrder }: MenuCategorySectionProps) {
  const IconComponent = categoryIcons[category.name] || categoryIcons.default;

  return (
    <section id={category.id} className="py-8">
      <div className="flex items-center mb-6">
        <IconComponent className="h-8 w-8 mr-3 text-primary" />
        <h2 className="text-3xl font-headline font-semibold text-foreground">{category.name}</h2>
      </div>
      {category.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {category.items.map((item) => (
            <MenuItemCard key={item.id} item={item} onAddItem={onAddItemToOrder} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No items in this category yet.</p>
      )}
      <Separator className="my-12 bg-border/50" />
    </section>
  );
}
