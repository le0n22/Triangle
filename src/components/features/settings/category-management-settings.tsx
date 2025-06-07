
'use client';

import { useState, useEffect } from 'react';
import type { MenuCategory as AppMenuCategory, PrinterRole } from '@/types'; // Renamed to avoid conflict
import { printerRoles } from '@/types'; // Import printerRoles array
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { 
  getAllCategoriesAction, 
  createCategoryAction, 
  updateCategoryAction, 
  deleteCategoryAction 
} from '../../../../backend/actions/categoryActions';
import { useLanguage } from '@/hooks/use-language'; // Import useLanguage
import type { TranslationKey } from '@/types';

const NO_ROLE_VALUE = "_NONE_"; // Special value for "No Default Role"

export function CategoryManagementSettings() {
  const [categories, setCategories] = useState<AppMenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AppMenuCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AppMenuCategory | null>(null);

  const [addForm, setAddForm] = useState({ name: '', iconName: '', defaultPrinterRole: null as PrinterRole | null });
  const [editForm, setEditForm] = useState({ id: '', name: '', iconName: '', defaultPrinterRole: null as PrinterRole | null });
  
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchCategories = async () => {
    console.log('CategoryManagementSettings: fetchCategories called');
    setIsFetching(true); 
    try {
      const dbCategories = await getAllCategoriesAction();
      console.log('CategoryManagementSettings: Fetched categories from DB:', dbCategories);
      setCategories(dbCategories.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch categories.', variant: 'destructive' });
      console.error("CategoryManagementSettings: Failed to fetch categories:", error);
    }
    setIsFetching(false); 
    setIsLoading(false); 
  };

  useEffect(() => {
    console.log('CategoryManagementSettings: useEffect running, calling fetchCategories.');
    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCategory = async () => {
    console.log('CategoryManagementSettings: handleAddCategory called with form:', addForm);
    if (!addForm.name) {
      toast({ title: 'Error', description: 'Category name is required.', variant: 'destructive' });
      return;
    }
    setIsMutating(true);
    try {
      const result = await createCategoryAction({
        name: addForm.name,
        iconName: addForm.iconName || undefined,
        defaultPrinterRole: addForm.defaultPrinterRole || undefined,
      });
      console.log('CategoryManagementSettings: createCategoryAction result:', result);

      if ('error' in result) {
        toast({ title: 'Error Adding Category', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Category Added', description: `Category "${result.name}" has been added.` });
        setAddForm({ name: '', iconName: '', defaultPrinterRole: null });
        setIsAddDialogOpen(false);
        await fetchCategories(); 
      }
    } catch (error) {
      console.error("CategoryManagementSettings: Error in handleAddCategory:", error);
      toast({ title: 'Unexpected Error', description: 'Could not add category.', variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };
  
  const openEditDialog = (category: AppMenuCategory) => {
    setEditingCategory(category);
    setEditForm({ 
      id: category.id, 
      name: category.name, 
      iconName: category.iconName || '', 
      defaultPrinterRole: category.defaultPrinterRole || null 
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    console.log('CategoryManagementSettings: handleUpdateCategory called with form:', editForm);
    if (!editForm.name || !editingCategory) {
      toast({ title: 'Error', description: 'Category name is required.', variant: 'destructive' });
      return;
    }
    setIsMutating(true);
    try {
      const result = await updateCategoryAction(editingCategory.id, {
        name: editForm.name,
        iconName: editForm.iconName || undefined,
        defaultPrinterRole: editForm.defaultPrinterRole, // Pass null directly if that's the state
      });
      console.log('CategoryManagementSettings: updateCategoryAction result:', result);

      if ('error' in result) {
        toast({ title: 'Error Updating Category', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Category Updated', description: `Category "${result.name}" has been updated.` });
        setIsEditDialogOpen(false);
        setEditingCategory(null);
        await fetchCategories();
      }
    } catch (error) {
      console.error("CategoryManagementSettings: Error in handleUpdateCategory:", error);
      toast({ title: 'Unexpected Error', description: 'Could not update category.', variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDeleteCategory = (category: AppMenuCategory) => {
    setCategoryToDelete(category);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    console.log('CategoryManagementSettings: handleDeleteCategory called for:', categoryToDelete.name);
    setIsMutating(true);
    try {
      const result = await deleteCategoryAction(categoryToDelete.id);
      console.log('CategoryManagementSettings: deleteCategoryAction result:', result);

      if (result.success) {
        toast({ title: 'Category Deleted', description: `Category "${categoryToDelete.name}" has been deleted.` });
        await fetchCategories();
      } else {
        toast({ title: 'Error Deleting Category', description: result.error || 'Failed to delete category.', variant: 'destructive' });
      }
    } catch (error) {
      console.error("CategoryManagementSettings: Error in handleDeleteCategory:", error);
      toast({ title: 'Unexpected Error', description: 'Could not delete category.', variant: 'destructive' });
    } finally {
      setCategoryToDelete(null);
      setIsMutating(false);
    }
  };

  const getRoleDisplayName = (roleValue?: PrinterRole | null): string => {
    if (!roleValue) return 'N/A';
    const roleMap: Record<PrinterRole, TranslationKey> = {
      KITCHEN_KOT: 'kitchenKOT',
      BAR_KOT: 'barKOT',
      RECEIPT: 'receiptPrinting',
      REPORT: 'reportPrinting',
    };
    return t(roleMap[roleValue]);
  };

  const renderCategoryFormFields = (
    formState: typeof addForm | typeof editForm, 
    setFormState: React.Dispatch<React.SetStateAction<typeof addForm>> | React.Dispatch<React.SetStateAction<typeof editForm>>
  ) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryFormName" className="text-right">Name*</Label>
        <Input id="categoryFormName" value={formState.name} onChange={(e) => setFormState(prev => ({...prev, name: e.target.value}))} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryFormIcon" className="text-right">Icon Name</Label>
        <Input id="categoryFormIcon" value={formState.iconName} onChange={(e) => setFormState(prev => ({...prev, iconName: e.target.value}))} placeholder="e.g., Soup (Lucide)" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryFormPrinterRole" className="text-right">{t('defaultPrinterRole')}</Label>
        <Select
          value={formState.defaultPrinterRole || NO_ROLE_VALUE}
          onValueChange={(value) => {
            setFormState(prev => ({ ...prev, defaultPrinterRole: value === NO_ROLE_VALUE ? null : value as PrinterRole }))
          }}
        >
          <SelectTrigger id="categoryFormPrinterRole" className="col-span-3">
            <SelectValue placeholder={t('selectDefaultPrinterRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_ROLE_VALUE}>{t('noDefaultRole') || 'No Default Role'}</SelectItem>
            {printerRoles.map(role => (
              <SelectItem key={role} value={role}>{getRoleDisplayName(role)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Category Management</CardTitle>
          <CardDescription>Manage your menu categories and their default printer roles.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCategories} disabled={isFetching || isMutating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching && !isAddDialogOpen && !isEditDialogOpen ? 'animate-spin' : ''}`} /> 
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) setAddForm({ name: '', iconName: '', defaultPrinterRole: null });
            }}>
            <DialogTrigger asChild>
              <Button disabled={isMutating || isFetching}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Enter details for the new menu category.</DialogDescription>
              </DialogHeader>
              {renderCategoryFormFields(addForm, setAddForm as React.Dispatch<React.SetStateAction<typeof addForm>>)}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isMutating}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddCategory} disabled={isMutating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isMutating ? 'Adding...' : 'Add Category'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isFetching && categories.length === 0 ? (
          <div className="text-center py-10">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading categories...</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your menu categories from the database.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Icon Name</TableHead>
                <TableHead>{t('defaultPrinterRole')}</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.iconName || 'N/A'}</TableCell>
                  <TableCell>{getRoleDisplayName(category.defaultPrinterRole)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)} className="mr-2" disabled={isMutating || isFetching}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!categoryToDelete && categoryToDelete.id === category.id} onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteCategory(category)} disabled={isMutating || isFetching}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete the category "{categoryToDelete?.name}". 
                            Menu items in this category will also be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setCategoryToDelete(null)} disabled={isMutating}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteCategory} disabled={isMutating} className="bg-destructive hover:bg-destructive/90">
                            {isMutating ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isFetching && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No categories found in the database. Add some!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          if (!open) setIsEditDialogOpen(false);
        }}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Edit Category: {editingCategory?.name}</DialogTitle>
            <DialogDescription>Update the details for this category.</DialogDescription>
          </DialogHeader>
          {editingCategory && renderCategoryFormFields(editForm, setEditForm as React.Dispatch<React.SetStateAction<typeof editForm>>)}
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isMutating}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateCategory} disabled={isMutating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             {isMutating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
