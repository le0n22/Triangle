
"use client" // Required because we use useLanguage hook

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { navItemDefs } from '@/components/layout/sidebar-nav-items'; // Updated import
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language'; // New import

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage(); // Use the language hook

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full">
            <SidebarMenu>
              {navItemDefs.map((itemDef) => (
                <SidebarMenuItem key={itemDef.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={false} // Add logic for active state based on current path
                    tooltip={{ children: t(itemDef.labelKey || itemDef.key), side: 'right' }}
                    disabled={itemDef.disabled}
                  >
                    <Link href={itemDef.href}>
                      <itemDef.icon />
                      <span>{t(itemDef.key)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <div className="mt-auto p-2">
          <Separator className="my-2 bg-sidebar-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto text-left">
                <div className="flex items-center w-full">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="person user" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-sidebar-foreground truncate">{t('myAccount')}</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2 w-56 bg-popover text-popover-foreground">
              <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t('logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Sidebar>
      <SidebarInset>
        <div className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/80 backdrop-blur-sm px-6 md:hidden">
          <SidebarTrigger />
        </div>
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
