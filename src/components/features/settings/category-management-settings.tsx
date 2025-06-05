
'use client';

import { useState } from 'react';
import type { MenuCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
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

interface CategoryManagementSettingsProps {
  initialCategories: MenuCategory[];
}

export function CategoryManagementSettings({ initialCategories }: CategoryManagementSettingsProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState(''); // Lucide icon name
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (!newCategoryName) {
      toast({ title: 'Error', description: 'Category name is required.', variant: 'destructive' });
      return;
    }
    const newCategory: MenuCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      iconName: newCategoryIcon || undefined,
      items: [], // New categories start with no items
    };
    setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: 'Category Added', description: `Category "${newCategory.name}" has been added.` });
    setNewCategoryName('');
    setNewCategoryIcon('');
    setIsAddDialogOpen(false);
  };
  
  const handleEditCategory = (category: MenuCategory) => {
    console.log('Editing category:', category);
    toast({ title: 'Edit Category', description: `Edit functionality for ${category.name} not yet implemented.`});
  };

  const handleDeleteCategory = (categoryId: string) => {
    console.log('Deleting category ID:', categoryId);
    const categoryName = categories.find(c => c.id === categoryId)?.name;
    // setCategories(prev => prev.filter(c => c.id !== categoryId)); // Actual delete logic
    toast({ title: 'Delete Category', description: `Delete functionality for ${categoryName} not yet fully implemented. Ensure items are reassigned.`});
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Category Management</CardTitle>
          <CardDescription>Manage your menu categories.</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Enter details for the new menu category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryName" className="text-right">Name</Label>
                <Input id="categoryName" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryIcon" className="text-right">Icon Name</Label>
                <Input id="categoryIcon" value={newCategoryIcon} onChange={(e) => setNewCategoryIcon(e.target.value)} placeholder="e.g., Soup, UtensilsCrossed (Lucide)" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your menu categories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Icon Name</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.iconName || 'N/A'}</TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)} className="mr-2">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No categories found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
