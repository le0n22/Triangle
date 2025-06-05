
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

const TABLE_POSITIONS_STORAGE_KEY = 'orderflow-table-positions';

export function TableMap({ tables }: TableMapProps) {
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [draggedTableInfo, setDraggedTableInfo] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    let loadedPositions: Record<string, Position> = {};
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TABLE_POSITIONS_STORAGE_KEY);
      if (saved) {
        try {
          loadedPositions = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse table positions from localStorage", e);
          loadedPositions = {}; // Fallback to empty if parsing fails
        }
      }
    }

    const newPositions: Record<string, Position> = { ...loadedPositions };
    let defaultPositionIndex = 0;
    const existingPositionsCount = Object.keys(loadedPositions).length;
    const maxTablesPerRow = 5; 
    const cardWidthWithGap = 190; // card width (176) + gap (14)
    const cardHeightWithGap = 180; // card height (160) + gap (20)
    const initialOffsetX = 20;
    const initialOffsetY = 20;

    tables.forEach((table) => {
      if (!newPositions[table.id]) {
        const baseIndex = existingPositionsCount + defaultPositionIndex;
        newPositions[table.id] = {
          x: initialOffsetX + (baseIndex % maxTablesPerRow) * cardWidthWithGap,
          y: initialOffsetY + Math.floor(baseIndex / maxTablesPerRow) * cardHeightWithGap,
        };
        defaultPositionIndex++;
      }
    });
    
    // Ensure all current tables are in the positions state
    // Remove positions for tables that no longer exist
    const finalPositions: Record<string, Position> = {};
    tables.forEach(table => {
      if (newPositions[table.id]) {
        finalPositions[table.id] = newPositions[table.id];
      }
    });


    if (tables.length > 0) {
        setPositions(finalPositions);
    } else {
        setPositions({}); 
    }

  }, [tables]);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(positions).length > 0) {
      // Only save if there are positions to save, to avoid clearing on initial empty state
      localStorage.setItem(TABLE_POSITIONS_STORAGE_KEY, JSON.stringify(positions));
    } else if (typeof window !== 'undefined' && tables.length === 0 && Object.keys(positions).length === 0) {
      // If there are no tables and no positions, explicitly clear localStorage
      localStorage.removeItem(TABLE_POSITIONS_STORAGE_KEY);
    }
  }, [positions, tables.length]);


  const handleTableDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, tableId: string) => {
    e.dataTransfer.setData('tableId', tableId);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDraggedTableInfo({ id: tableId, offsetX, offsetY });
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOverWindow = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
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
    
    let newX = e.clientX - containerRect.left - draggedTableInfo.offsetX;
    let newY = e.clientY - containerRect.top - draggedTableInfo.offsetY;

    const cardWidth = 176;
    const cardHeight = 160;

    newX = Math.max(0, Math.min(newX, containerRect.width - cardWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - cardHeight));


    setPositions(prev => ({
      ...prev,
      [tableId]: { x: newX, y: newY },
    }));
    setDraggedTableInfo(null);
  }, [draggedTableInfo, containerRef]);


  if (!tables || tables.length === 0 && Object.keys(positions).length === 0) {
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
        <div
            className="bg-card/60 backdrop-blur-md shadow-2xl rounded-lg border border-white/10 p-6 relative min-h-[calc(100vh-18rem)] overflow-auto flex items-center justify-center"
        >
            <p className="text-xl text-muted-foreground">No tables configured.</p>
        </div>
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
      
      <div
        ref={setContainerRef}
        className="bg-card/60 backdrop-blur-md shadow-2xl rounded-lg border border-white/10 p-6 relative min-h-[calc(100vh-18rem)] overflow-auto"
        onDragOver={handleDragOverWindow}
        onDrop={handleDropInWindow}
      >
        {tables.map((table) => {
          const position = positions[table.id] || { x: 20, y: 20 }; // Default if somehow not set
          return (
            <TableCard
              key={table.id}
              table={table}
              position={position}
              onTableDragStart={handleTableDragStart}
            />
          );
        })}
         {tables.length > 0 && Object.keys(positions).length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Loading table positions...
          </p>
        )}
      </div>
    </div>
  );
}
