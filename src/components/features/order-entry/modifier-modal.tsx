'use client';

import type { MenuItem, Modifier } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem?: MenuItem;
  currentSelectedModifiers: Modifier[];
  onApplyModifiers: (selectedModifiers: Modifier[]) => void;
}

export function ModifierModal({ isOpen, onClose, menuItem, currentSelectedModifiers, onApplyModifiers }: ModifierModalProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (menuItem && menuItem.availableModifiers) {
      const initialSelected: Record<string, boolean> = {};
      menuItem.availableModifiers.forEach(mod => {
        initialSelected[mod.id] = currentSelectedModifiers.some(sm => sm.id === mod.id);
      });
      setSelected(initialSelected);
    }
  }, [menuItem, currentSelectedModifiers, isOpen]);


  if (!menuItem) return null;

  const handleToggleModifier = (modifierId: string) => {
    setSelected(prev => ({ ...prev, [modifierId]: !prev[modifierId] }));
  };

  const handleApply = () => {
    if (menuItem && menuItem.availableModifiers) {
      const appliedModifiers = menuItem.availableModifiers.filter(mod => selected[mod.id]);
      onApplyModifiers(appliedModifiers);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline">Customize {menuItem.name}</DialogTitle>
          <DialogDescription>Select modifiers for your item.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {menuItem.availableModifiers && menuItem.availableModifiers.length > 0 ? (
            menuItem.availableModifiers.map((modifier) => (
              <div key={modifier.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`mod-${modifier.id}`}
                  checked={selected[modifier.id] || false}
                  onCheckedChange={() => handleToggleModifier(modifier.id)}
                />
                <Label htmlFor={`mod-${modifier.id}`} className="flex-grow text-sm">
                  {modifier.name}
                </Label>
                <span className="text-sm text-muted-foreground">
                  {modifier.priceChange !== 0 ? `${modifier.priceChange > 0 ? '+' : '-'}$${Math.abs(modifier.priceChange).toFixed(2)}` : 'No charge'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No modifiers available for this item.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply} className="bg-primary hover:bg-primary/90 text-primary-foreground">Apply Modifiers</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
