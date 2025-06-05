
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Grid, ClipboardList, Route, ChefHat, Settings, BookOpenText } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard/overview', // Updated to point to the new overview page
    icon: LayoutDashboard,
    label: 'Dashboard Overview',
  },
  {
    title: 'Tables',
    href: '/dashboard/tables',
    icon: Grid,
    label: 'Table Layout',
  },
  {
    title: 'Menu', // Added Menu Link to sidebar for consistency with quick menu
    href: '/dashboard/menu',
    icon: BookOpenText,
    label: 'Digital Menu',
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ClipboardList,
    label: 'Order History',
  },
  {
    title: 'Tracking',
    href: '/dashboard/tracking',
    icon: Route,
    label: 'Order Tracking',
  },
  {
    title: 'KDS',
    href: '/dashboard/kds',
    icon: ChefHat,
    label: 'Kitchen Display',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Application Settings',
  },
];
