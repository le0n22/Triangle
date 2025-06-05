
'use client';

import { useState } from 'react';
import type { Table } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
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
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('');
  const { toast } = useToast();

  const handleAddTable = () => {
    if (!newTableNumber || !newTableCapacity) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    const newTable: Table = {
      id: `t-${Date.now()}`,
      number: parseInt(newTableNumber, 10),
      capacity: parseInt(newTableCapacity, 10),
      status: 'available', // Default status
    };
    setTables(prev => [...prev, newTable].sort((a,b) => a.number - b.number));
    toast({ title: 'Table Added', description: `Table ${newTable.number} has been added.` });
    setNewTableNumber('');
    setNewTableCapacity('');
    setIsAddDialogOpen(false);
  };
  
  const handleEditTable = (table: Table) => {
    // Placeholder for edit functionality
    console.log('Editing table:', table);
    toast({ title: 'Edit Table', description: `Edit functionality for Table ${table.number} not yet implemented.`});
  };

  const handleDeleteTable = (tableId: string) => {
    // Placeholder for delete functionality
    console.log('Deleting table ID:', tableId);
    const tableName = tables.find(t => t.id === tableId)?.number;
    // setTables(prev => prev.filter(t => t.id !== tableId)); // Actual delete logic
    toast({ title: 'Delete Table', description: `Delete functionality for Table ${tableName} not yet fully implemented.`});
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
                <Label htmlFor="tableNumber" className="text-right">Number</Label>
                <Input id="tableNumber" type="number" value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tableCapacity" className="text-right">Capacity</Label>
                <Input id="tableCapacity" type="number" value={newTableCapacity} onChange={(e) => setNewTableCapacity(e.target.value)} className="col-span-3" />
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
              <TableHead>Capacity</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.id}>
                <TableCell className="font-medium">{table.number}</TableCell>
                <TableCell>{table.capacity}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEditTable(table)} className="mr-2">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTable(table.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tables.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No tables configured.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadcnTable>
      </CardContent>
    </Card>
  );
}
