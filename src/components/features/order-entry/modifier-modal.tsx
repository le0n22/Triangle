
'use client';

import type { MenuItem, Modifier, OrderItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem?: MenuItem;
  currentSelectedOrderItem?: OrderItem;
  onApplyModifiers: (selectedModifiers: Modifier[], specialRequests?: string) => void;
  isSaving: boolean;
}

export function ModifierModal({
    isOpen,
    onClose,
    menuItem,
    currentSelectedOrderItem,
    onApplyModifiers,
    isSaving
}: ModifierModalProps) {
  const [selectedModifierIds, setSelectedModifierIds] = useState<Record<string, boolean>>({});
  const [specialRequests, setSpecialRequests] = useState<string>('');

  useEffect(() => {
    if (isOpen && menuItem && menuItem.availableModifiers) {
      const initialSelected: Record<string, boolean> = {};
      menuItem.availableModifiers.forEach(mod => {
        initialSelected[mod.id] = currentSelectedOrderItem?.selectedModifiers.some(sm => sm.id === mod.id) || false;
      });
      setSelectedModifierIds(initialSelected);
      setSpecialRequests(currentSelectedOrderItem?.specialRequests || '');
    } else if (!isOpen) {
      setSelectedModifierIds({});
      setSpecialRequests('');
    }
  }, [isOpen, menuItem, currentSelectedOrderItem]);


  if (!menuItem) return null;

  const handleToggleModifier = (modifierId: string) => {
    if (isSaving) return;
    setSelectedModifierIds(prev => ({ ...prev, [modifierId]: !prev[modifierId] }));
  };

  const handleApply = () => {
    if (isSaving || !menuItem || !menuItem.availableModifiers) return;
    const appliedModifiers = menuItem.availableModifiers.filter(mod => selectedModifierIds[mod.id]);
    onApplyModifiers(appliedModifiers, specialRequests.trim() === '' ? undefined : specialRequests.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline">Customize {menuItem.name}</DialogTitle>
          <DialogDescription>Select modifiers and add any special requests.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {menuItem.availableModifiers && menuItem.availableModifiers.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                <h4 className="text-sm font-medium text-muted-foreground">Available Modifiers:</h4>
                {menuItem.availableModifiers.map((modifier) => (
                <div key={modifier.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                    <Checkbox
                    id={`mod-modal-${modifier.id}`}
                    checked={selectedModifierIds[modifier.id] || false}
                    onCheckedChange={() => handleToggleModifier(modifier.id)}
                    disabled={isSaving}
                    />
                    <Label htmlFor={`mod-modal-${modifier.id}`} className="flex-grow text-sm cursor-pointer">
                    {modifier.name}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                       {modifier.priceChange !== 0 && ` (${modifier.priceChange > 0 ? '+' : '-'} $${Math.abs(modifier.priceChange).toFixed(2)})`}
                    </span>
                </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center text-sm">No modifiers available for this item.</p>
          )}

          <div className="mt-4 space-y-2">
            <Label htmlFor="specialRequests" className="text-sm font-medium text-muted-foreground">Special Requests (Optional)</Label>
            <Textarea
              id="specialRequests"
              placeholder="e.g., Extra crispy, no onions..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="min-h-[60px]"
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleApply} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
