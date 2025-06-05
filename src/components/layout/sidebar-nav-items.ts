
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Grid, ClipboardList, Route, ChefHat, Settings } from 'lucide-react';

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
    href: '/dashboard', // This redirects to /dashboard/tables by default
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    title: 'Tables',
    href: '/dashboard/tables',
    icon: Grid, // Changed icon for distinct "Tables" menu
    label: 'Tables',
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ClipboardList,
    label: 'Orders',
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
    label: 'KDS',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Settings',
  },
];

