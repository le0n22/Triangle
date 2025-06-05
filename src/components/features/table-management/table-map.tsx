
'use client';

import type { Table } from '@/types';
import { TableCard } from './table-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface TableMapProps {
  tables: Table[];
}

interface Position {
  x: number;
  y: number;
}

export function TableMap({ tables }: TableMapProps) {
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [draggedTableInfo, setDraggedTableInfo] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const initialPositions: Record<string, Position> = {};
    tables.forEach((table, index) => {
      // Stagger initial positions slightly
      initialPositions[table.id] = {
        x: 20 + (index % 5) * 190, // card width (176) + gap (14)
        y: 20 + Math.floor(index / 5) * 180, // card height (160) + gap (20)
      };
    });
    setPositions(initialPositions);
  }, [tables]);

  const handleTableDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, tableId: string) => {
    e.dataTransfer.setData('tableId', tableId);
    // Calculate offset from the top-left of the DRAGGED ELEMENT (the card)
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDraggedTableInfo({ id: tableId, offsetX, offsetY });
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOverWindow = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDropInWindow = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const tableId = e.dataTransfer.getData('tableId');

    if (!tableId || !draggedTableInfo || draggedTableInfo.id !== tableId || !containerRef) {
      setDraggedTableInfo(null);
      return;
    }

    const containerRect = containerRef.getBoundingClientRect();
    
    // Calculate new position relative to the container
    let newX = e.clientX - containerRect.left - draggedTableInfo.offsetX;
    let newY = e.clientY - containerRect.top - draggedTableInfo.offsetY;

    // Optional: Boundary checks to keep cards within the visible area of the container
    // Card dimensions: w-44 (176px), h-40 (160px)
    const cardWidth = 176;
    const cardHeight = 160;

    // Ensure card stays within bounds, accounting for scroll if overflow is auto
    // For simplicity here, we'll clip to 0,0 minimum. Max bounds depend on scroll.
    newX = Math.max(0, newX);
    newY = Math.max(0, newY);
    
    // If container can scroll, max bounds are tricky without knowing content size vs viewport.
    // For now, let's assume we don't want to drag outside initial container rect width/height.
    // This might need adjustment if the container is meant to be larger than viewport and scrollable.
    // newX = Math.min(newX, containerRect.width - cardWidth - (2*24)); // 24 is p-6
    // newY = Math.min(newY, containerRect.height - cardHeight - (2*24));


    setPositions(prev => ({
      ...prev,
      [tableId]: { x: newX, y: newY },
    }));
    setDraggedTableInfo(null);
  }, [draggedTableInfo, containerRef]);


  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No tables configured.</p>
        <Button className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Table
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-semibold">Table Layout</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Table
          </Button>
        </div>
      </div>
      
      {/* Glassy Window Container */}
      <div
        ref={setContainerRef}
        className="bg-card/60 backdrop-blur-md shadow-2xl rounded-lg border border-white/10 p-6 relative min-h-[calc(100vh-18rem)] overflow-auto"
        onDragOver={handleDragOverWindow}
        onDrop={handleDropInWindow}
      >
        {tables.map((table) => {
          const position = positions[table.id] || { x: 0, y: 0 };
          return (
            <TableCard
              key={table.id}
              table={table}
              position={position}
              onTableDragStart={handleTableDragStart}
            />
          );
        })}
         {tables.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Drag tables here to arrange them.
          </p>
        )}
      </div>
    </div>
  );
}
