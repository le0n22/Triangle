
'use client';

import { useState } from 'react';
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
  DialogClose,
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
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TableManagementSettingsProps {
  initialTables: Table[];
}

export function TableManagementSettings({ initialTables }: TableManagementSettingsProps) {
  const [tables, setTables] = useState<Table[]>(initialTables.sort((a,b) => a.number - b.number));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const [addForm, setAddForm] = useState({ name: '', number: '', capacity: '' });
  const [editForm, setEditForm] = useState({ id: '', name: '', number: '', capacity: '' });

  const { toast } = useToast();

  const handleAddTable = () => {
    if (!addForm.number || !addForm.capacity) {
      toast({ title: 'Error', description: 'Table number and capacity are required.', variant: 'destructive' });
      return;
    }
    const newTable: Table = {
      id: `t-${Date.now()}`,
      name: addForm.name || undefined,
      number: parseInt(addForm.number, 10),
      capacity: parseInt(addForm.capacity, 10),
      status: 'available',
    };
    setTables(prev => [...prev, newTable].sort((a,b) => a.number - b.number));
    toast({ title: 'Table Added', description: `Table ${newTable.number} ${newTable.name ? `(${newTable.name})` : ''} has been added.` });
    setAddForm({ name: '', number: '', capacity: '' });
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (table: Table) => {
    setEditingTable(table);
    setEditForm({ id: table.id, name: table.name || '', number: table.number.toString(), capacity: table.capacity.toString() });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTable = () => {
    if (!editForm.number || !editForm.capacity || !editingTable) {
      toast({ title: 'Error', description: 'Table number and capacity are required.', variant: 'destructive' });
      return;
    }
    const updatedTable: Table = {
      ...editingTable,
      name: editForm.name || undefined,
      number: parseInt(editForm.number, 10),
      capacity: parseInt(editForm.capacity, 10),
    };
    setTables(prev => prev.map(t => t.id === editingTable.id ? updatedTable : t).sort((a,b) => a.number - b.number));
    toast({ title: 'Table Updated', description: `Table ${updatedTable.number} ${updatedTable.name ? `(${updatedTable.name})` : ''} has been updated.` });
    setIsEditDialogOpen(false);
    setEditingTable(null);
  };
  
  const confirmDeleteTable = (table: Table) => {
    setTableToDelete(table);
  };

  const handleDeleteTable = () => {
    if (!tableToDelete) return;
    setTables(prev => prev.filter(t => t.id !== tableToDelete.id));
    toast({ title: 'Table Deleted', description: `Table ${tableToDelete.number} has been deleted.` });
    setTableToDelete(null); 
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Table Management</CardTitle>
          <CardDescription>Add, edit, or remove restaurant tables.</CardDescription>
        </div>
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
                <Label htmlFor="addTableNumber" className="text-right">Number</Label>
                <Input id="addTableNumber" type="number" value={addForm.number} onChange={(e) => setAddForm({...addForm, number: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="addTableCapacity" className="text-right">Capacity</Label>
                <Input id="addTableCapacity" type="number" value={addForm.capacity} onChange={(e) => setAddForm({...addForm, capacity: e.target.value})} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTable} className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Table</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ShadcnTable>
          <TableCaption>A list of your restaurant tables.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.id}>
                <TableCell className="font-medium">{table.number}</TableCell>
                <TableCell>{table.name || '-'}</TableCell>
                <TableCell>{table.capacity}</TableCell>
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
                <TableCell colSpan={4} className="text-center text-muted-foreground">No tables configured.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadcnTable>
      </CardContent>

      {/* Edit Table Dialog */}
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
              <Label htmlFor="editTableNumber" className="text-right">Number</Label>
              <Input id="editTableNumber" type="number" value={editForm.number} onChange={(e) => setEditForm({...editForm, number: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTableCapacity" className="text-right">Capacity</Label>
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

    
