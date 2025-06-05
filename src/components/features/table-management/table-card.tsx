
'use client';

import type { Table, TableStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CalendarClock, Trash2, UsersRound, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react'; // Import React for cloneElement

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

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    onTableDragStart(e, table.id);
  };

  const linkHref = table.status === 'available' || table.status === 'occupied'
    ? `/dashboard/order/${table.id}`
    : '#';
  
  const isClickable = table.status !== 'dirty' && table.status !== 'reserved';
  
  // Define the core card structure once. It should not have absolute positioning itself
  // as that will be handled by its wrapper (Link or direct clone).
  const cardItself = (
    <Card
      draggable={true}
      onDragStart={handleDragStartInternal}
      className={cn(
        "hover:shadow-lg transition-all duration-200 flex flex-col w-44 h-40", // Fixed size
        statusColors[table.status]
        // Opacity will be handled by the wrapper or cloneElement logic
      )}
      style={{ cursor: 'grab' }} // The card is always grabbable
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
    // Link component will be absolutely positioned.
    // cardItself is a child and will fill the Link area.
    return (
      <Link
        href={linkHref}
        draggable={false} // Prevent the Link itself from being dragged
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '176px', // Corresponds to w-44
          height: '160px', // Corresponds to h-40
          cursor: 'pointer', // Link is clickable
        }}
      >
        {cardItself}
      </Link>
    );
  }

  // Not clickable: The Card itself is the root and needs absolute positioning and dimming.
  // We clone cardItself to add these specific styles for this case.
  return React.cloneElement(cardItself, {
    style: {
      ...cardItself.props.style, // Keep existing styles like cursor: 'grab'
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      opacity: 0.75, // Dim non-clickable cards
    }
  });
}
