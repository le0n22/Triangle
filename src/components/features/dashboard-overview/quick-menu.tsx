
'use client';

import { QuickMenuItem } from './quick-menu-item';
import { Grid, BookOpenText, ClipboardList, ChefHat, Settings, BarChart3, Route } from 'lucide-react'; // Added Route
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const menuItems = [
  { title: 'Tables', href: '/dashboard/tables', Icon: Grid },
  { title: 'Digital Menu', href: '/dashboard/menu', Icon: BookOpenText },
  { title: 'Orders', href: '/dashboard/orders', Icon: ClipboardList },
  { title: 'Tracking', href: '/dashboard/tracking', Icon: Route }, // New Item
  { title: 'KDS', href: '/dashboard/kds', Icon: ChefHat },
  { title: 'Reports', href: '/dashboard/reports', Icon: BarChart3 },
  { title: 'Settings', href: '/dashboard/settings', Icon: Settings },
];

export function QuickMenu() {
  return (
    <Card className="shadow-xl bg-card/90 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {menuItems.map(item => (
            <QuickMenuItem key={item.title} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
