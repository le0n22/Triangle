
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Grid, ClipboardList, Route, ChefHat, Settings, BookOpenText, BarChart3 } from 'lucide-react';
import type { TranslationKey } from '@/types';

export interface NavItemDef {
  key: TranslationKey; // Use TranslationKey for title
  href: string;
  icon: LucideIcon;
  labelKey?: TranslationKey; // Optional label, also a TranslationKey
  disabled?: boolean;
}

export const navItemDefs: NavItemDef[] = [
  {
    key: 'dashboard',
    href: '/dashboard/overview',
    icon: LayoutDashboard,
    labelKey: 'dashboard',
  },
  {
    key: 'tables',
    href: '/dashboard/tables',
    icon: Grid,
    labelKey: 'tables',
  },
  {
    key: 'menu',
    href: '/dashboard/menu',
    icon: BookOpenText,
    labelKey: 'menu',
  },
  {
    key: 'orders',
    href: '/dashboard/orders',
    icon: ClipboardList,
    labelKey: 'orders',
  },
  {
    key: 'tracking',
    href: '/dashboard/tracking',
    icon: Route,
    labelKey: 'tracking',
  },
  {
    key: 'kds',
    href: '/dashboard/kds',
    icon: ChefHat,
    labelKey: 'kds',
  },
  {
    key: 'reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    labelKey: 'reports',
  },
  {
    key: 'settings',
    href: '/dashboard/settings',
    icon: Settings,
    labelKey: 'settings',
  },
];
