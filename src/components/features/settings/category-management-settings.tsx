
'use client';

import { useState } from 'react';
import type { MenuCategory } from '@/types';
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

interface CategoryManagementSettingsProps {
  initialCategories: MenuCategory[];
}

export function CategoryManagementSettings({ initialCategories }: CategoryManagementSettingsProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories.sort((a,b) => a.name.localeCompare(b.name)));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null);

  const [addForm, setAddForm] = useState({ name: '', iconName: '' });
  const [editForm, setEditForm] = useState({ id: '', name: '', iconName: '' });
  
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (!addForm.name) {
      toast({ title: 'Error', description: 'Category name is required.', variant: 'destructive' });
      return;
    }
    const newCategory: MenuCategory = {
      id: `cat-${Date.now()}`,
      name: addForm.name,
      iconName: addForm.iconName || undefined,
      items: [], 
    };
    setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: 'Category Added', description: `Category "${newCategory.name}" has been added.` });
    setAddForm({ name: '', iconName: '' });
    setIsAddDialogOpen(false);
  };
  
  const openEditDialog = (category: MenuCategory) => {
    setEditingCategory(category);
    setEditForm({ id: category.id, name: category.name, iconName: category.iconName || '' });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!editForm.name || !editingCategory) {
      toast({ title: 'Error', description: 'Category name is required.', variant: 'destructive' });
      return;
    }
    const updatedCategory: MenuCategory = {
      ...editingCategory,
      name: editForm.name,
      iconName: editForm.iconName || undefined,
    };
    setCategories(prev => prev.map(c => c.id === editingCategory.id ? updatedCategory : c).sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: 'Category Updated', description: `Category "${updatedCategory.name}" has been updated.` });
    setIsEditDialogOpen(false);
    setEditingCategory(null);
  };

  const confirmDeleteCategory = (category: MenuCategory) => {
    setCategoryToDelete(category);
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    // Consider implications: what happens to menu items in this category? For now, just removes category.
    setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
    toast({ title: 'Category Deleted', description: `Category "${categoryToDelete.name}" has been deleted.` });
    setCategoryToDelete(null);
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
                <Label htmlFor="addCategoryName" className="text-right">Name</Label>
                <Input id="addCategoryName" value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="addCategoryIcon" className="text-right">Icon Name</Label>
                <Input id="addCategoryIcon" value={addForm.iconName} onChange={(e) => setAddForm({...addForm, iconName: e.target.value})} placeholder="e.g., Soup (Lucide)" className="col-span-3" />
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
                   <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)} className="mr-2">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={!!categoryToDelete && categoryToDelete.id === category.id} onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => confirmDeleteCategory(category)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the category "{categoryToDelete?.name}". 
                          Menu items in this category might need to be reassigned.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Edit Category {editingCategory?.name}</DialogTitle>
            <DialogDescription>Update the details for this category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editCategoryName" className="text-right">Name</Label>
              <Input id="editCategoryName" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editCategoryIcon" className="text-right">Icon Name</Label>
              <Input id="editCategoryIcon" value={editForm.iconName} onChange={(e) => setEditForm({...editForm, iconName: e.target.value})} placeholder="e.g., Soup (Lucide)" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCategory} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    