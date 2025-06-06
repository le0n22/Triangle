
'use client';

import { useState, useEffect } from 'react';
import type { Table } from '@/types';
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
  AlertDialogTrigger, // Added import
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, RefreshCw } from 'lucide-react';
import {
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllTables, createTableAction, updateTableAction, deleteTableAction } from '@backend/actions/tableActions';

export function TableManagementSettings() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const [addForm, setAddForm] = useState({ name: '', number: '', capacity: '' });
  const [editForm, setEditForm] = useState({ id: '', name: '', number: '', capacity: '' });

  const { toast } = useToast();

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const dbTables = await getAllTables();
      setTables(dbTables.sort((a, b) => a.number - b.number));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch tables.', variant: 'destructive' });
      console.error("Failed to fetch tables:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async () => {
    if (!addForm.number || !addForm.capacity) {
      toast({ title: 'Error', description: 'Table number and capacity are required.', variant: 'destructive' });
      return;
    }
    const number = parseInt(addForm.number, 10);
    const capacity = parseInt(addForm.capacity, 10);

    if (isNaN(number) || isNaN(capacity) || number <= 0 || capacity <= 0) {
      toast({ title: 'Error', description: 'Table number and capacity must be positive numbers.', variant: 'destructive' });
      return;
    }

    const result = await createTableAction({ name: addForm.name || undefined, number, capacity });
    if ('error' in result) {
      toast({ title: 'Error Adding Table', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Table Added', description: `Table ${result.number} has been added.` });
      setAddForm({ name: '', number: '', capacity: '' });
      setIsAddDialogOpen(false);
      fetchTables(); 
    }
  };

  const openEditDialog = (table: Table) => {
    setEditingTable(table);
    setEditForm({ id: table.id, name: table.name || '', number: table.number.toString(), capacity: table.capacity.toString() });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTable = async () => {
    if (!editForm.number || !editForm.capacity || !editingTable) {
      toast({ title: 'Error', description: 'Table number and capacity are required.', variant: 'destructive' });
      return;
    }
    const number = parseInt(editForm.number, 10);
    const capacity = parseInt(editForm.capacity, 10);

    if (isNaN(number) || isNaN(capacity) || number <= 0 || capacity <= 0) {
      toast({ title: 'Error', description: 'Table number and capacity must be positive numbers.', variant: 'destructive' });
      return;
    }
    
    const result = await updateTableAction(editingTable.id, { name: editForm.name || undefined, number, capacity });
    if ('error' in result) {
      toast({ title: 'Error Updating Table', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Table Updated', description: `Table ${result.number} has been updated.` });
      setIsEditDialogOpen(false);
      setEditingTable(null);
      fetchTables(); 
    }
  };
  
  const confirmDeleteTable = (table: Table) => {
    setTableToDelete(table);
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    const result = await deleteTableAction(tableToDelete.id);
    if (result.success) {
      toast({ title: 'Table Deleted', description: `Table ${tableToDelete.number} has been deleted.` });
      fetchTables(); 
    } else {
      toast({ title: 'Error Deleting Table', description: result.error || 'Failed to delete table.', variant: 'destructive' });
    }
    setTableToDelete(null); 
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Table Management</CardTitle>
          <CardDescription>Add, edit, or remove restaurant tables from the database.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTables} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Table
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
                <DialogDescription>Enter the details for the new table.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="addTableName" className="text-right">Name (Optional)</Label>
                  <Input id="addTableName" value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="col-span-3" placeholder="e.g., Window Seat"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="addTableNumber" className="text-right">Number*</Label>
                  <Input id="addTableNumber" type="number" value={addForm.number} onChange={(e) => setAddForm({...addForm, number: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="addTableCapacity" className="text-right">Capacity*</Label>
                  <Input id="addTableCapacity" type="number" value={addForm.capacity} onChange={(e) => setAddForm({...addForm, capacity: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTable} className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Table</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-10">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading tables...</p>
          </div>
        ) : (
          <ShadcnTable>
            <TableCaption>A list of your restaurant tables from the database.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">{table.number}</TableCell>
                  <TableCell>{table.name || '-'}</TableCell>
                  <TableCell>{table.capacity}</TableCell>
                  <TableCell><span className="capitalize">{table.status.toLowerCase()}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(table)} className="mr-2">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!tableToDelete && tableToDelete.id === table.id} onOpenChange={(isOpen) => !isOpen && setTableToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteTable(table)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete table {tableToDelete?.number} {tableToDelete?.name ? `(${tableToDelete.name})` : ''}.
                            Any active orders on this table might cause issues if not handled.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setTableToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteTable} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {tables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No tables found in the database. Add some!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </ShadcnTable>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Edit Table {editingTable?.number} {editingTable?.name ? `(${editingTable.name})` : ''}</DialogTitle>
            <DialogDescription>Update the details for this table.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTableName" className="text-right">Name (Optional)</Label>
                <Input id="editTableName" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="col-span-3" placeholder="e.g., Window Seat"/>
              </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTableNumber" className="text-right">Number*</Label>
              <Input id="editTableNumber" type="number" value={editForm.number} onChange={(e) => setEditForm({...editForm, number: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTableCapacity" className="text-right">Capacity*</Label>
              <Input id="editTableCapacity" type="number" value={editForm.capacity} onChange={(e) => setEditForm({...editForm, capacity: e.target.value})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTable} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
