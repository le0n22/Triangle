
'use client';

import type { Table, TableStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CalendarClock, Trash2, UsersRound, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react'; 
import { useCurrency } from '@/hooks/useCurrency'; // Import useCurrency

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
  const title = table.name ? table.name : `Table ${table.number}`; // Updated title logic
  const { formatCurrency } = useCurrency();

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    onTableDragStart(e, table.id);
  };

  const linkHref = table.status === 'available' || table.status === 'occupied'
    ? `/dashboard/order/${table.id}` 
    : '#';
  
  const isClickable = table.status !== 'dirty' && table.status !== 'reserved';
  
  const cardItself = (
    <Card
      draggable={true}
      onDragStart={handleDragStartInternal}
      className={cn(
        "hover:shadow-lg transition-all duration-200 flex flex-col w-44 h-44", 
        statusColors[table.status]
      )}
      style={{ cursor: 'grab' }}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-3 px-3">
        <CardTitle className="text-lg font-headline font-bold leading-tight">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", statusColors[table.status] ? 'text-inherit' : 'text-muted-foreground')} />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between px-3 pb-3 pt-0">
        <div className="space-y-1">
          <Badge variant="outline" className={cn("text-xs py-0.5", statusColors[table.status] ? 'text-inherit border-current' : '')}>
            {statusText[table.status]}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Capacity: {table.capacity} guests
          </p>
        </div>
        {table.status === 'occupied' && (
          <div className="mt-1.5 space-y-0.5">
            {/* Removed Order ID display */}
            {typeof table.currentOrderTotal === 'number' && (
              <div className="flex items-center text-sm font-semibold text-accent">
                {/* Removed DollarSign icon, formatCurrency will handle the symbol */}
                {formatCurrency(table.currentOrderTotal)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isClickable) {
    return (
      <Link
        href={linkHref}
        draggable={false} 
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '176px', 
          height: '176px', 
          cursor: 'pointer', 
        }}
      >
        {cardItself}
      </Link>
    );
  }

  return React.cloneElement(cardItself, {
    style: {
      ...cardItself.props.style, 
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      opacity: 0.75, 
    }
  });
}
