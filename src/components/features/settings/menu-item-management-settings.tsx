
'use client';

import { useState } from 'react';
import type { MenuItem, MenuCategory, Modifier } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import Image from 'next/image';

interface MenuItemManagementSettingsProps {
  initialMenuItems: MenuItem[];
  categories: MenuCategory[]; // To select a category for the item
  modifiers: Modifier[]; // To select available modifiers for the item
}

interface NewMenuItemState {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  dataAiHint: string;
  // availableModifiers: string[]; // Store IDs of selected modifiers
}

export function MenuItemManagementSettings({ initialMenuItems, categories, modifiers: allModifiers }: MenuItemManagementSettingsProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const initialFormState: NewMenuItemState = {
    name: '',
    description: '',
    price: '',
    category: categories.length > 0 ? categories[0].id : '', // Default to first category if available
    imageUrl: '',
    dataAiHint: '',
    // availableModifiers: [],
  };
  const [newItemForm, setNewItemForm] = useState<NewMenuItemState>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItemForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setNewItemForm(prev => ({ ...prev, category: value }));
  };

  const handleAddMenuItem = () => {
    if (!newItemForm.name || !newItemForm.price || !newItemForm.category) {
      toast({ title: 'Error', description: 'Name, price, and category are required.', variant: 'destructive' });
      return;
    }
    const selectedCategoryInfo = categories.find(c => c.id === newItemForm.category);
    const newMenuItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: newItemForm.name,
      description: newItemForm.description,
      price: parseFloat(newItemForm.price),
      category: selectedCategoryInfo ? selectedCategoryInfo.name : 'Uncategorized', // Use category name
      imageUrl: newItemForm.imageUrl || undefined,
      dataAiHint: newItemForm.dataAiHint || undefined,
      availableModifiers: [], // Simplified for now
    };
    setMenuItems(prev => [...prev, newMenuItem].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: 'Menu Item Added', description: `"${newMenuItem.name}" has been added.` });
    setNewItemForm(initialFormState);
    setIsAddDialogOpen(false);
  };
  
  const handleEditItem = (item: MenuItem) => {
    console.log('Editing item:', item);
    toast({ title: 'Edit Item', description: `Edit functionality for ${item.name} not yet implemented.`});
  };

  const handleDeleteItem = (itemId: string) => {
    console.log('Deleting item ID:', itemId);
    const itemName = menuItems.find(item => item.id === itemId)?.name;
    // setMenuItems(prev => prev.filter(item => item.id !== itemId)); // Actual delete logic
    toast({ title: 'Delete Item', description: `Delete functionality for ${itemName} not yet fully implemented.`});
  };


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Menu Item Management</CardTitle>
          <CardDescription>Add, edit, or remove menu items.</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>Enter details for the new menu item.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={newItemForm.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={newItemForm.description} onChange={handleInputChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" value={newItemForm.price} onChange={handleInputChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select name="category" onValueChange={handleCategoryChange} defaultValue={newItemForm.category}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" value={newItemForm.imageUrl} onChange={handleInputChange} placeholder="https://placehold.co/100x100.png" />
              </div>
               <div className="space-y-1.5">
                <Label htmlFor="dataAiHint">Image AI Hint</Label>
                <Input id="dataAiHint" name="dataAiHint" value={newItemForm.dataAiHint} onChange={handleInputChange} placeholder="e.g. pizza food" />
              </div>
              {/* Modifier selection can be added here later */}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMenuItem} className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your menu items.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image 
                    src={item.imageUrl || 'https://placehold.co/50x50.png?text=N/A'} 
                    alt={item.name} 
                    width={40} height={40} 
                    className="rounded-md object-cover"
                    data-ai-hint={item.dataAiHint || 'food item'}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)} className="mr-2">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {menuItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No menu items found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
