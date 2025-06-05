import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ListOrdered, ShoppingCart, CreditCard, Printer } from 'lucide-react';

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
