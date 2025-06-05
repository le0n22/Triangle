'use client';

import type { Table, TableStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleUserRound, CircleCheck, CalendarClock, Trash2, UsersRound, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TableCardProps {
  table: Table;
}

const statusIcons: Record<TableStatus, React.ElementType> = {
  available: CircleCheck,
  occupied: UsersRound,
  reserved: CalendarClock,
  dirty: Trash2,
};

const statusColors: Record<TableStatus, string> = {
  available: 'bg-green-500/20 text-green-400 border-green-500/30',
  occupied: 'bg-primary/20 text-primary border-primary/30', // Using primary color for occupied
  reserved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  dirty: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const statusText: Record<TableStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  dirty: 'Needs Cleaning',
}

export function TableCard({ table }: TableCardProps) {
  const Icon = statusIcons[table.status] || Utensils; // Default icon

  // Determine link destination based on table status
  const linkHref = table.status === 'available' || table.status === 'occupied'
    ? `/dashboard/order/${table.id}` // For available, this will start a new order for this table. For occupied, it will load existing.
    : '#'; // Or some other action for reserved/dirty, e.g. a modal

  const CardWrapper = table.status !== 'dirty' && table.status !== 'reserved' ? Link : 'div';


  return (
    <CardWrapper href={linkHref} passHref={CardWrapper === Link ? true : undefined}>
      <Card className={cn(
        "hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col w-44 h-40", // Fixed width and height
        statusColors[table.status],
        (table.status === 'dirty' || table.status === 'reserved') && "cursor-not-allowed opacity-75"
      )}>
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
    </CardWrapper>
  );
}
