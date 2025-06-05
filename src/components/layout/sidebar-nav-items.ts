
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Grid, ClipboardList, Route, ChefHat, Settings, BookOpenText, BarChart3 } from 'lucide-react'; // Added BarChart3

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
    href: '/dashboard/overview',
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
    title: 'Menu',
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
    title: 'Reports', // New Item
    href: '/dashboard/reports',
    icon: BarChart3,
    label: 'Sales & Performance Reports',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Application Settings',
  },
];
