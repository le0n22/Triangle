
'use client';

import { useState, useEffect } from 'react';
import type { Modifier as AppModifier } from '@/types'; // Renamed to avoid conflict with Modifier type from lucide-react potentially
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
import { PlusCircle, Edit2, Trash2, RefreshCw } from 'lucide-react';
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
import { useCurrency } from '@/hooks/useCurrency'; // Import useCurrency
// Using relative path
import { 
  getAllModifiersAction, 
  createModifierAction, 
  updateModifierAction, 
  deleteModifierAction 
} from '../../../../backend/actions/modifierActions';


export function ModifierManagementSettings() {
  const [modifiers, setModifiers] = useState<AppModifier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false); // For add/edit/delete operations

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState<AppModifier | null>(null);
  const [modifierToDelete, setModifierToDelete] = useState<AppModifier | null>(null);

  const [addForm, setAddForm] = useState({ name: '', priceChange: '' });
  const [editForm, setEditForm] = useState({ id: '', name: '', priceChange: '' });
  
  const { toast } = useToast();
  const { currency } = useCurrency(); // Use the hook

  const fetchModifiers = async () => {
    setIsLoading(true);
    try {
      const dbModifiers = await getAllModifiersAction();
      
      if (Array.isArray(dbModifiers)) {
        setModifiers(dbModifiers.sort((a, b) => a.name.localeCompare(b.name)));
      } else if (dbModifiers && typeof dbModifiers === 'object' && 'error' in dbModifiers) {
        toast({ title: 'Error Fetching Modifiers', description: (dbModifiers as {error: string}).error, variant: 'destructive' });
        console.error("Error from getAllModifiersAction:", (dbModifiers as {error: string}).error);
        setModifiers([]); 
      } else {
        console.error("Unexpected response from getAllModifiersAction:", dbModifiers);
        toast({ title: 'Error', description: 'Unexpected response when fetching modifiers.', variant: 'destructive' });
        setModifiers([]); 
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch modifiers. See console for details.', variant: 'destructive' });
      console.error("CRITICAL ERROR calling getAllModifiersAction:", error);
      setModifiers([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModifiers();
  }, []); 

  const handleAddModifier = async () => {
    if (!addForm.name || addForm.priceChange === '') {
      toast({ title: 'Validation Error', description: 'Modifier name and price change are required.', variant: 'destructive' });
      return;
    }
    setIsMutating(true);
    try {
      const price = parseFloat(addForm.priceChange);
      if (isNaN(price)) {
        toast({ title: 'Validation Error', description: 'Price change must be a valid number.', variant: 'destructive' });
        setIsMutating(false);
        return;
      }
      const result = await createModifierAction({ name: addForm.name, priceChange: price });

      if ('error' in result) {
        toast({ title: 'Error Adding Modifier', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Modifier Added', description: `Modifier "${result.name}" has been added.` });
        setAddForm({ name: '', priceChange: '' });
        setIsAddDialogOpen(false);
        await fetchModifiers(); 
      }
    } catch (error) {
      console.error("Error in handleAddModifier:", error);
      toast({ title: 'Unexpected Error', description: 'Could not add modifier.', variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };
  
  const openEditDialog = (modifier: AppModifier) => {
    setEditingModifier(modifier);
    setEditForm({ id: modifier.id, name: modifier.name, priceChange: modifier.priceChange.toString() });
    setIsEditDialogOpen(true);
  };

  const handleUpdateModifier = async () => {
    if (!editForm.name || editForm.priceChange === '' || !editingModifier) {
      toast({ title: 'Validation Error', description: 'Modifier name and price change are required.', variant: 'destructive' });
      return;
    }
    setIsMutating(true);
    try {
      const price = parseFloat(editForm.priceChange);
      if (isNaN(price)) {
        toast({ title: 'Validation Error', description: 'Price change must be a valid number.', variant: 'destructive' });
        setIsMutating(false);
        return;
      }
      const result = await updateModifierAction(editingModifier.id, { name: editForm.name, priceChange: price });

      if ('error' in result) {
        toast({ title: 'Error Updating Modifier', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Modifier Updated', description: `Modifier "${result.name}" has been updated.` });
        setIsEditDialogOpen(false);
        setEditingModifier(null);
        await fetchModifiers();
      }
    } catch (error) {
      console.error("Error in handleUpdateModifier:", error);
      toast({ title: 'Unexpected Error', description: 'Could not update modifier.', variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDeleteModifier = (modifier: AppModifier) => {
    setModifierToDelete(modifier);
  };

  const handleDeleteModifier = async () => {
    if (!modifierToDelete) return;
    setIsMutating(true);
    try {
      const result = await deleteModifierAction(modifierToDelete.id);

      if (result.success) {
        toast({ title: 'Modifier Deleted', description: `Modifier "${modifierToDelete.name}" has been deleted.` });
        await fetchModifiers();
      } else {
        toast({ title: 'Error Deleting Modifier', description: result.error || 'Failed to delete modifier.', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error in handleDeleteModifier:", error);
      toast({ title: 'Unexpected Error', description: 'Could not delete modifier.', variant: 'destructive' });
    } finally {
      setModifierToDelete(null);
      setIsMutating(false);
    }
  };
  
  const formatPriceChange = (priceChange: number) => {
    const sign = priceChange >= 0 ? '+' : '-';
    return `${sign}${currency.symbol}${Math.abs(priceChange).toFixed(2)}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Modifier Management</CardTitle>
          <CardDescription>Manage your item modifiers from the database.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchModifiers} disabled={isLoading || isMutating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading && !isAddDialogOpen && !isEditDialogOpen ? 'animate-spin' : ''}`} /> 
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isMutating || isLoading}>
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
                  <Label htmlFor="addModifierName" className="text-right">Name*</Label>
                  <Input id="addModifierName" value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="addPriceChange" className="text-right">Price Change*</Label>
                  <Input id="addPriceChange" type="number" step="0.01" value={addForm.priceChange} onChange={(e) => setAddForm({...addForm, priceChange: e.target.value})} placeholder="e.g., 1.50 or -0.50" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isMutating}>Cancel</Button>
                <Button onClick={handleAddModifier} disabled={isMutating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isMutating ? 'Adding...' : 'Add Modifier'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && modifiers.length === 0 ? ( 
          <div className="text-center py-10">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading modifiers...</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your item modifiers from the database.</TableCaption>
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
                    {formatPriceChange(modifier.priceChange)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(modifier)} className="mr-2" disabled={isMutating || isLoading}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!modifierToDelete && modifierToDelete.id === modifier.id} onOpenChange={(isOpen) => !isOpen && setModifierToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteModifier(modifier)} disabled={isMutating || isLoading}>
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
                          <AlertDialogCancel onClick={() => setModifierToDelete(null)} disabled={isMutating}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteModifier} disabled={isMutating} className="bg-destructive hover:bg-destructive/90">
                            {isMutating ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && modifiers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">No modifiers found in the database. Add some!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Edit Modifier: {editingModifier?.name}</DialogTitle>
            <DialogDescription>Update the details for this modifier.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editModifierName" className="text-right">Name*</Label>
              <Input id="editModifierName" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPriceChange" className="text-right">Price Change*</Label>
              <Input id="editPriceChange" type="number" step="0.01" value={editForm.priceChange} onChange={(e) => setEditForm({...editForm, priceChange: e.target.value})} placeholder="e.g., 1.50 or -0.50" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button onClick={handleUpdateModifier} disabled={isMutating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             {isMutating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
