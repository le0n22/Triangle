
'use client';

import { useState } from 'react';
import type { Modifier } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModifierManagementSettingsProps {
  initialModifiers: Modifier[];
}

export function ModifierManagementSettings({ initialModifiers }: ModifierManagementSettingsProps) {
  const [modifiers, setModifiers] = useState<Modifier[]>(initialModifiers.sort((a,b) => a.name.localeCompare(b.name)));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);
  const [modifierToDelete, setModifierToDelete] = useState<Modifier | null>(null);

  const [addForm, setAddForm] = useState({ name: '', priceChange: '' });
  const [editForm, setEditForm] = useState({ id: '', name: '', priceChange: '' });
  
  const { toast } = useToast();

  const handleAddModifier = () => {
    if (!addForm.name || addForm.priceChange === '') {
      toast({ title: 'Error', description: 'Modifier name and price change are required.', variant: 'destructive' });
      return;
    }
    const newModifier: Modifier = {
      id: `mod-${Date.now()}`,
      name: addForm.name,
      priceChange: parseFloat(addForm.priceChange), 
    };
    setModifiers(prev => [...prev, newModifier].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: 'Modifier Added', description: `Modifier "${newModifier.name}" has been added.` });
    setAddForm({ name: '', priceChange: '' });
    setIsAddDialogOpen(false);
  };
  
  const openEditDialog = (modifier: Modifier) => {
    setEditingModifier(modifier);
    setEditForm({ id: modifier.id, name: modifier.name, priceChange: modifier.priceChange.toString() });
    setIsEditDialogOpen(true);
  };

  const handleUpdateModifier = () => {
    if (!editForm.name || editForm.priceChange === '' || !editingModifier) {
      toast({ title: 'Error', description: 'Modifier name and price change are required.', variant: 'destructive' });
      return;
    }
    const updatedModifier: Modifier = {
      ...editingModifier,
      name: editForm.name,
      priceChange: parseFloat(editForm.priceChange),
    };
    setModifiers(prev => prev.map(m => m.id === editingModifier.id ? updatedModifier : m).sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: 'Modifier Updated', description: `Modifier "${updatedModifier.name}" has been updated.` });
    setIsEditDialogOpen(false);
    setEditingModifier(null);
  };

  const confirmDeleteModifier = (modifier: Modifier) => {
    setModifierToDelete(modifier);
  };

  const handleDeleteModifier = () => {
    if (!modifierToDelete) return;
    setModifiers(prev => prev.filter(m => m.id !== modifierToDelete.id));
    toast({ title: 'Modifier Deleted', description: `Modifier "${modifierToDelete.name}" has been deleted.` });
    setModifierToDelete(null);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Modifier Management</CardTitle>
          <CardDescription>Manage your item modifiers.</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Modifier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Add New Modifier</DialogTitle>
              <DialogDescription>Enter details for the new modifier.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="addModifierName" className="text-right">Name</Label>
                <Input id="addModifierName" value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="addPriceChange" className="text-right">Price Change</Label>
                <Input id="addPriceChange" type="number" step="0.01" value={addForm.priceChange} onChange={(e) => setAddForm({...addForm, priceChange: e.target.value})} placeholder="e.g., 1.50 or -0.50" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddModifier} className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Modifier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your item modifiers.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price Change</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modifiers.map((modifier) => (
              <TableRow key={modifier.id}>
                <TableCell className="font-medium">{modifier.name}</TableCell>
                <TableCell className="text-right">
                  {modifier.priceChange >= 0 ? `+$${modifier.priceChange.toFixed(2)}` : `-$${Math.abs(modifier.priceChange).toFixed(2)}`}
                </TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => openEditDialog(modifier)} className="mr-2">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={!!modifierToDelete && modifierToDelete.id === modifier.id} onOpenChange={(isOpen) => !isOpen && setModifierToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => confirmDeleteModifier(modifier)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the modifier "{modifierToDelete?.name}". 
                          This may affect menu items that use this modifier.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setModifierToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteModifier} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
             {modifiers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No modifiers found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Modifier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Edit Modifier: {editingModifier?.name}</DialogTitle>
            <DialogDescription>Update the details for this modifier.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editModifierName" className="text-right">Name</Label>
              <Input id="editModifierName" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPriceChange" className="text-right">Price Change</Label>
              <Input id="editPriceChange" type="number" step="0.01" value={editForm.priceChange} onChange={(e) => setEditForm({...editForm, priceChange: e.target.value})} placeholder="e.g., 1.50 or -0.50" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateModifier} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
