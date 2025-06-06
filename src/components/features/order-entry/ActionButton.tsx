
'use client';

import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  iconClassName?: string;
}

export function ActionButton({
  Icon,
  label,
  onClick,
  disabled,
  className,
  iconClassName,
}: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "flex flex-col items-center justify-center h-24 w-full p-2 shadow-md hover:shadow-lg transition-shadow bg-card text-card-foreground hover:bg-primary/10 focus:ring-2 focus:ring-primary",
        disabled && "opacity-50 cursor-not-allowed hover:bg-card",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={cn("h-8 w-8 mb-1 text-primary", iconClassName, disabled && "text-muted-foreground")} />
      <span className={cn("text-xs text-center font-medium", disabled && "text-muted-foreground")}>{label}</span>
    </Button>
  );
}
