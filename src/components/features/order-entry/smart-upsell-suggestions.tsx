'use client';

import { smartUpselling } from '@/ai/flows/smart-upselling';
import type { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SmartUpsellSuggestionsProps {
  currentOrder: Order | null;
  onAddUpsellItem: (itemName: string) => void; // Callback to add suggested item
}

export function SmartUpsellSuggestions({ currentOrder, onAddUpsellItem }: SmartUpsellSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Format current order items into a string
      const orderString = currentOrder.items
        .map(item => `${item.quantity}x ${item.menuItemName}`)
        .join(', ');
      
      const result = await smartUpselling({ currentOrder: orderString });
      setSuggestions(result.upsellSuggestions || []);
    } catch (e) {
      console.error("Error fetching upsell suggestions:", e);
      setError("Could not load suggestions at this time.");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  useEffect(() => {
    // Fetch suggestions when the order changes significantly (e.g., more than 2 items or total changes)
    // For simplicity, fetch on initial load with items and allow manual refresh.
    if (currentOrder && currentOrder.items.length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [currentOrder, fetchSuggestions]);

  const handleRefresh = () => {
    fetchSuggestions();
  };

  if (!currentOrder || currentOrder.items.length === 0) {
    return (
        <Card className="bg-card text-card-foreground">
            <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                Smart Upsells
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Add items to the order to see suggestions.</p>
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-headline flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-primary" />
          Smart Upsells
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading} className="h-7 w-7">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!isLoading && !error && suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm p-2 rounded-md bg-background hover:bg-accent/10 flex justify-between items-center">
                <span>{suggestion}</span>
                <Button size="sm" variant="outline" onClick={() => onAddUpsellItem(suggestion)} className="text-xs h-7">
                  Add
                </Button>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && !error && suggestions.length === 0 && (
          <p className="text-sm text-muted-foreground">No specific suggestions right now. Try refreshing!</p>
        )}
      </CardContent>
    </Card>
  );
}
