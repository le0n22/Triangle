
'use client';

import { useState, useEffect } from 'react';
import type { MenuItem, MenuCategory, Modifier } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  categories: MenuCategory[]; 
  modifiers: Modifier[]; 
}

interface MenuItemFormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  category: string; // Category ID
  imageUrl: string;
  dataAiHint: string;
  availableModifiers: string[]; // Store IDs of selected modifiers
}

export function MenuItemManagementSettings({ initialMenuItems, categories: initialCategories, modifiers: allModifiers }: MenuItemManagementSettingsProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems.sort((a,b) => a.name.localeCompare(b.name)));
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories); // Added for dynamic updates if categories change

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuItemToDelete, setMenuItemToDelete] = useState<MenuItem | null>(null);
  
  const { toast } = useToast();

  const initialFormState: MenuItemFormState = {
    name: '',
    description: '',
    price: '',
    category: initialCategories.length > 0 ? initialCategories[0].id : '',
    imageUrl: '',
    dataAiHint: '',
    availableModifiers: [],
  };
  const [currentForm, setCurrentForm] = useState<MenuItemFormState>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setCurrentForm(prev => ({ ...prev, category: value }));
  };

  const handleModifierToggle = (modifierId: string) => {
    setCurrentForm(prev => {
      const newModifiers = prev.availableModifiers.includes(modifierId)
        ? prev.availableModifiers.filter(id => id !== modifierId)
        : [...prev.availableModifiers, modifierId];
      return { ...prev, availableModifiers: newModifiers };
    });
  };
  
  const resetAndCloseAddDialog = () => {
    setCurrentForm(initialFormState);
    setIsAddDialogOpen(false);
  };

  const resetAndCloseEditDialog = () => {
    setCurrentForm(initialFormState);
    setIsEditDialogOpen(false);
    setEditingMenuItem(null);
  };

  const handleAddMenuItem = () => {
    if (!currentForm.name || !currentForm.price || !currentForm.category) {
      toast({ title: 'Error', description: 'Name, price, and category are required.', variant: 'destructive' });
      return;
    }
    const selectedCategoryInfo = categories.find(c => c.id === currentForm.category);
    const selectedModifiers = allModifiers.filter(m => currentForm.availableModifiers.includes(m.id));

    const newMenuItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: currentForm.name,
      description: currentForm.description,
      price: parseFloat(currentForm.price),
      category: selectedCategoryInfo ? selectedCategoryInfo.name : 'Uncategorized', // Use category name for display
      imageUrl: currentForm.imageUrl || undefined,
      dataAiHint: currentForm.dataAiHint || undefined,
      availableModifiers: selectedModifiers,
    };
    setMenuItems(prev => [...prev, newMenuItem].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: 'Menu Item Added', description: `"${newMenuItem.name}" has been added.` });
    resetAndCloseAddDialog();
  };
  
  const openEditDialog = (item: MenuItem) => {
    const categoryId = categories.find(c => c.name === item.category)?.id || (categories.length > 0 ? categories[0].id : '');
    setEditingMenuItem(item);
    setCurrentForm({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: categoryId,
      imageUrl: item.imageUrl || '',
      dataAiHint: item.dataAiHint || '',
      availableModifiers: item.availableModifiers?.map(m => m.id) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMenuItem = () => {
    if (!currentForm.name || !currentForm.price || !currentForm.category || !editingMenuItem) {
      toast({ title: 'Error', description: 'Name, price, and category are required.', variant: 'destructive' });
      return;
    }
    const selectedCategoryInfo = categories.find(c => c.id === currentForm.category);
    const selectedModifiers = allModifiers.filter(m => currentForm.availableModifiers.includes(m.id));

    const updatedMenuItem: MenuItem = {
      ...editingMenuItem,
      name: currentForm.name,
      description: currentForm.description,
      price: parseFloat(currentForm.price),
      category: selectedCategoryInfo ? selectedCategoryInfo.name : 'Uncategorized',
      imageUrl: currentForm.imageUrl || undefined,
      dataAiHint: currentForm.dataAiHint || undefined,
      availableModifiers: selectedModifiers,
    };
    setMenuItems(prev => prev.map(item => item.id === editingMenuItem.id ? updatedMenuItem : item).sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: 'Menu Item Updated', description: `"${updatedMenuItem.name}" has been updated.` });
    resetAndCloseEditDialog();
  };

  const confirmDeleteMenuItem = (item: MenuItem) => {
    setMenuItemToDelete(item);
  };

  const handleDeleteMenuItem = () => {
    if (!menuItemToDelete) return;
    setMenuItems(prev => prev.filter(item => item.id !== menuItemToDelete.id));
    toast({ title: 'Menu Item Deleted', description: `"${menuItemToDelete.name}" has been deleted.` });
    setMenuItemToDelete(null);
  };

  const renderFormFields = () => (
    <div className="grid gap-3 py-2">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={currentForm.name} onChange={handleInputChange} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={currentForm.description} onChange={handleInputChange} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" value={currentForm.price} onChange={handleInputChange} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Select name="category" onValueChange={handleCategoryChange} value={currentForm.category}>
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
      </div>
      <div className="space-y-1">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" value={currentForm.imageUrl} onChange={handleInputChange} placeholder="https://placehold.co/100x100.png" />
      </div>
        <div className="space-y-1">
        <Label htmlFor="dataAiHint">Image AI Hint</Label>
        <Input id="dataAiHint" name="dataAiHint" value={currentForm.dataAiHint} onChange={handleInputChange} placeholder="e.g. pizza food" />
      </div>
      <div className="space-y-1">
        <Label>Available Modifiers</Label>
        <ScrollArea className="h-32 rounded-md border p-2">
          {allModifiers.map(modifier => (
            <div key={modifier.id} className="flex items-center space-x-2 mb-1.5">
              <Checkbox
                id={`mod-${modifier.id}-${currentForm.id || 'add'}`}
                checked={currentForm.availableModifiers.includes(modifier.id)}
                onCheckedChange={() => handleModifierToggle(modifier.id)}
              />
              <Label htmlFor={`mod-${modifier.id}-${currentForm.id || 'add'}`} className="text-sm font-normal">
                {modifier.name} (+${modifier.priceChange.toFixed(2)})
              </Label>
            </div>
          ))}
           {allModifiers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No modifiers configured.</p>}
        </ScrollArea>
      </div>
    </div>
  );


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Menu Item Management</CardTitle>
          <CardDescription>Add, edit, or remove menu items.</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetAndCloseAddDialog(); else setIsAddDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentForm(initialFormState)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>Enter details for the new menu item.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(80vh-150px)] pr-3">
              {renderFormFields()}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={resetAndCloseAddDialog}>Cancel</Button>
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
              <TableHead className="text-center">Modifiers</TableHead>
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
                <TableCell className="text-center text-xs">
                  {item.availableModifiers && item.availableModifiers.length > 0 ? item.availableModifiers.length : '0'}
                </TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)} className="mr-2">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={!!menuItemToDelete && menuItemToDelete.id === item.id} onOpenChange={(isOpen) => !isOpen && setMenuItemToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => confirmDeleteMenuItem(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the menu item "{menuItemToDelete?.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMenuItemToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMenuItem} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {menuItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No menu items found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Menu Item Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetAndCloseEditDialog(); else setIsEditDialogOpen(true); }}>
        <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Edit Menu Item: {editingMenuItem?.name}</DialogTitle>
            <DialogDescription>Update the details for this menu item.</DialogDescription>
          </DialogHeader>
           <ScrollArea className="max-h-[calc(80vh-150px)] pr-3">
            {renderFormFields()}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={resetAndCloseEditDialog}>Cancel</Button>
            <Button onClick={handleUpdateMenuItem} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    