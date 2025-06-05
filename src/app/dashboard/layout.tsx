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
import { navItems } from '@/components/layout/sidebar-nav-items';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={false} // Add logic for active state based on current path
                    tooltip={{ children: item.label || item.title, side: 'right' }}
                    disabled={item.disabled}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        {/* User Account Section at the bottom of the sidebar */}
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
                    <span className="text-sm font-medium text-sidebar-foreground truncate">My Account</span>
                    {/* Optional: Add email or role here if desired */}
                    {/* <span className="text-xs text-sidebar-foreground/70 truncate">user@example.com</span> */}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2 w-56 bg-popover text-popover-foreground">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Sidebar>
      <SidebarInset>
        {/* Minimal top bar for mobile sidebar trigger */}
        <div className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/80 backdrop-blur-sm px-6 md:hidden">
          <SidebarTrigger />
          {/* Optional: Add page title or breadcrumbs here for mobile if needed */}
        </div>
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
