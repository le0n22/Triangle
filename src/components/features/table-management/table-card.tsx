
'use client';

import type { Table, TableStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CalendarClock, Trash2, UsersRound, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TableCardProps {
  table: Table;
  position: { x: number; y: number };
  onTableDragStart: (event: React.DragEvent<HTMLDivElement>, tableId: string) => void;
}

const statusIcons: Record<TableStatus, React.ElementType> = {
  available: CircleCheck,
  occupied: UsersRound,
  reserved: CalendarClock,
  dirty: Trash2,
};

const statusColors: Record<TableStatus, string> = {
  available: 'bg-green-500/20 text-green-400 border-green-500/30',
  occupied: 'bg-primary/20 text-primary border-primary/30',
  reserved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  dirty: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const statusText: Record<TableStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  dirty: 'Needs Cleaning',
}

export function TableCard({ table, position, onTableDragStart }: TableCardProps) {
  const Icon = statusIcons[table.status] || Utensils;

  const linkHref = table.status === 'available' || table.status === 'occupied'
    ? `/dashboard/order/${table.id}`
    : '#';

  const isClickable = table.status !== 'dirty' && table.status !== 'reserved';
  
  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    onTableDragStart(e, table.id);
    // Optional: Use a custom drag image or hide the default one
    // const img = new Image();
    // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='; // Transparent pixel
    // e.dataTransfer.setDragImage(img, 0, 0);
  };

  const cardContent = (
    <Card
      draggable={true}
      onDragStart={handleDragStartInternal}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: 'grab',
      }}
      className={cn(
        "hover:shadow-lg transition-all duration-200 flex flex-col w-44 h-40",
        statusColors[table.status],
        !isClickable && "opacity-75" // No separate cursor-not-allowed for D&D item
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-xl font-headline font-bold">
          Table {table.number}
        </CardTitle>
        <Icon className={cn("h-5 w-5", statusColors[table.status] ? 'text-inherit' : 'text-muted-foreground')} />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between px-4 pb-4 pt-0">
        <div>
          <Badge variant="outline" className={cn("text-xs", statusColors[table.status] ? 'text-inherit border-current' : '')}>
            {statusText[table.status]}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1.5">
            Capacity: {table.capacity} guests
          </p>
        </div>
        {table.status === 'occupied' && table.currentOrderId && (
          <p className="text-xs text-primary mt-1.5">Order ID: {table.currentOrderId.substring(0,8)}...</p>
        )}
      </CardContent>
    </Card>
  );

  if (isClickable) {
    // Wrap with Link, but Link itself is not draggable. The Card inside is.
    // Clicks on the Card will navigate, drags will move.
    return (
      <Link href={linkHref} passHref legacyBehavior>
        {/* We need an intermediate element for Link with legacyBehavior if Card is function component without direct ref forwarding for `<a>` */}
        <div style={{position: 'absolute', left: `${position.x}px`, top: `${position.y}px`}} draggable={false}> 
           {/* This div is just for Link positioning, card inside is the draggable and visual element */}
           {/* The card itself will be absolutely positioned by its own style prop now, but Link also needs to "be" there. */}
           {/* Let's simplify: The Card component will handle its own position. Link needs to not interfere with D&D. */}
           {/* Let's make the card itself handle the Link behavior only if not dragging */}
           {cardContent} 
        </div>
      </Link>
    );
  }

  // For non-clickable states, just render the cardContent directly.
  // It's already styled for absolute positioning and D&D.
  return cardContent;
}
