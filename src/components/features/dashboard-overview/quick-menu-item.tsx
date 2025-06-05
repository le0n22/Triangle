'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickMenuItemProps {
  title: string;
  href: string;
  Icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export function QuickMenuItem({ title, href, Icon, className, iconClassName }: QuickMenuItemProps) {
  return (
    <Link href={href} className="block group">
      <Card className={cn(
        "bg-card/70 hover:bg-primary/20 backdrop-blur-sm shadow-lg hover:shadow-primary/30 transition-all duration-200 transform hover:scale-105",
        className
      )}>
        <CardContent className="flex flex-col items-center justify-center p-6 aspect-square">
          <Icon className={cn("w-12 h-12 md:w-16 md:h-16 text-primary group-hover:text-primary-foreground mb-3 transition-colors", iconClassName)} />
          <p className="text-sm md:text-base font-medium text-center text-card-foreground group-hover:text-primary-foreground transition-colors">{title}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
