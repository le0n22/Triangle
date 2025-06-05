
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ListOrdered, ShoppingCart, CreditCard, Printer, ClipboardList, ChefHat, Settings } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Tables',
    href: '/dashboard/tables',
    icon: LayoutDashboard,
    label: 'Tables',
  },
  {
    title: 'Menu',
    href: '/dashboard/menu',
    icon: ListOrdered,
    label: 'Menu',
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ClipboardList,
    label: 'Orders',
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
  // These are placeholders for direct navigation if needed, but usually accessed contextually
  // {
  //   title: 'Order Entry',
  //   href: '/dashboard/order/new', // Example: new order, usually context based from table
  //   icon: ShoppingCart,
  //   label: 'Order',
  //   disabled: true, // Usually not a direct nav item
  // },
  // {
  //   title: 'Payment',
  //   href: '/dashboard/payment', // Needs an orderId
  //   icon: CreditCard,
  //   label: 'Payment',
  //   disabled: true,
  // },
  // {
  //   title: 'KOT',
  //   href: '/dashboard/kot', // Needs an orderId
  //   icon: Printer,
  //   label: 'KOT',
  //   disabled: true,
  // },
];
