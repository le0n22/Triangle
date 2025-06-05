import type { MenuCategory, MenuItem, Modifier } from '@/types';
import { MenuBrowser } from '@/components/features/digital-menu/menu-browser';

const mockModifiers: Modifier[] = [
  { id: 'mod1', name: 'Extra Cheese', priceChange: 1.50 },
  { id: 'mod2', name: 'No Onions', priceChange: 0.00 },
  { id: 'mod3', name: 'Spicy', priceChange: 0.50 },
];

// Mock data for menu items and categories
const mockMenuCategories: MenuCategory[] = [
  {
    id: 'cat1',
    name: 'Appetizers',
    iconName: 'Soup',
    items: [
      { id: 'item1', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls served with sweet chili sauce.', price: 8.99, category: 'Appetizers', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'spring rolls', availableModifiers: [mockModifiers[1]] },
      { id: 'item2', name: 'Garlic Bread', description: 'Toasted baguette with garlic butter and herbs.', price: 6.50, category: 'Appetizers', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'garlic bread', availableModifiers: [mockModifiers[0]] },
    ],
  },
  {
    id: 'cat2',
    name: 'Main Courses',
    iconName: 'UtensilsCrossed',
    items: [
      { id: 'item3', name: 'Grilled Salmon', description: 'Fresh salmon fillet grilled to perfection, served with roasted vegetables.', price: 22.00, category: 'Main Courses', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'grilled salmon', availableModifiers: [mockModifiers[2]] },
      { id: 'item4', name: 'Margherita Pizza', description: 'Classic pizza with tomato, mozzarella, and basil.', price: 15.00, category: 'Main Courses', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'pizza margherita', availableModifiers: [mockModifiers[0], mockModifiers[2]] },
      { id: 'item5', name: 'Chicken Pasta', description: 'Creamy Alfredo pasta with grilled chicken breast.', price: 18.50, category: 'Main Courses', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'chicken pasta', availableModifiers: [] },
    ],
  },
  {
    id: 'cat3',
    name: 'Desserts',
    iconName: 'CakeSlice',
    items: [
      { id: 'item6', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.', price: 9.00, category: 'Desserts', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'chocolate cake', availableModifiers: [] },
      { id: 'item7', name: 'Tiramisu', description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream.', price: 8.50, category: 'Desserts', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'tiramisu dessert', availableModifiers: [] },
    ],
  },
  {
    id: 'cat4',
    name: 'Beverages',
    iconName: 'CupSoda',
    items: [
      { id: 'item8', name: 'Coca-Cola', description: 'Classic Coke.', price: 3.00, category: 'Beverages', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'soda drink', availableModifiers: [] },
      { id: 'item9', name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice.', price: 5.00, category: 'Beverages', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'orange juice', availableModifiers: [] },
    ],
  },
];

export default function MenuPage() {
  // In a real app, fetch menu data
  const categories = mockMenuCategories;

  return (
    <div className="container mx-auto">
      <MenuBrowser categories={categories} />
    </div>
  );
}
