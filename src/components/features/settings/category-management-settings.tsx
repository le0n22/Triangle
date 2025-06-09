
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppMenuCategory } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Select and related imports are removed if no longer needed for other fields
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, RefreshCw, PackageSearch, ListFilter } from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAllCategoriesAction, createCategoryAction, updateCategoryAction, deleteCategoryAction
} from '@backend/actions/categoryActions';
// getAllPrinterRoleDefinitionsAction and AppPrinterRoleDefinition are removed as they are no longer used here
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/types';

// NO_ROLE_VALUE is removed as it's no longer applicable here

export function CategoryManagementSettings() {
  const [categories, setCategories] = useState<AppMenuCategory[]>([]);
  // printerRoles state is removed
  
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  // isLoadingRoles state is removed
  const [isMutating, setIsMutating] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AppMenuCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AppMenuCategory | null>(null);

  // defaultPrinterRoleKey is removed from initialFormState
  const initialFormState = { name: '', iconName: '' };
  const [addForm, setAddForm] = useState(initialFormState);
  // defaultPrinterRoleKey is removed from editForm
  const [editForm, setEditForm] = useState({ id: '', ...initialFormState });

  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const dbCategories = await getAllCategoriesAction();
      setCategories(dbCategories.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      toast({ title: t('error'), description: t('fetchCategoriesError'), variant: 'destructive' });
      console.error("Failed to fetch categories:", error);
    }
    setIsLoadingCategories(false);
  }, [t, toast]);

  // fetchPrinterRoles function is removed

  useEffect(() => {
    fetchCategories();
    // fetchPrinterRoles call is removed
  }, [fetchCategories]);

  const handleAddCategory = async () => {
    if (!addForm.name) {
      toast({ title: t('error'), description: t('categoryNameRequired'), variant: 'destructive' });
      return;
    }
    setIsMutating(true);
    try {
      // defaultPrinterRoleKey is removed from createCategoryAction call
      const result = await createCategoryAction({
        name: addForm.name,
        iconName: addForm.iconName || undefined,
      });

      if ('error' in result) {
        toast({ title: t('addCategoryErrorTitle'), description: result.error, variant: 'destructive' });
      } else {
        toast({ title: t('categoryAddedTitle'), description: t('categoryAddedDesc', { name: result.name }) });
        setAddForm(initialFormState);
        setIsAddDialogOpen(false);
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error in handleAddCategory:", error);
      toast({ title: t('unexpectedErrorTitle'), description: t('addCategoryErrorDesc'), variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };

  const openEditDialog = (category: AppMenuCategory) => {
    setEditingCategory(category);
    // defaultPrinterRoleKey is removed from editForm state setting
    setEditForm({
      id: category.id,
      name: category.name,
      iconName: category.iconName || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editForm.name || !editingCategory) {
      toast({ title: t('error'), description: t('categoryNameRequired'), variant: 'destructive' });
      return;
    }
    setIsMutating(true);
    try {
      // defaultPrinterRoleKey is removed from updateCategoryAction call
      const result = await updateCategoryAction(editingCategory.id, {
        name: editForm.name,
        iconName: editForm.iconName || undefined,
      });

      if ('error' in result) {
        toast({ title: t('updateCategoryErrorTitle'), description: result.error, variant: 'destructive' });
      } else {
        toast({ title: t('categoryUpdatedTitle'), description: t('categoryUpdatedDesc', { name: result.name }) });
        setIsEditDialogOpen(false);
        setEditingCategory(null);
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error in handleUpdateCategory:", error);
      toast({ title: t('unexpectedErrorTitle'), description: t('updateCategoryErrorDesc'), variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDeleteCategory = (category: AppMenuCategory) => {
    setCategoryToDelete(category);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsMutating(true);
    try {
      const result = await deleteCategoryAction(categoryToDelete.id);
      if (result.success) {
        toast({ title: t('categoryDeletedTitle'), description: t('categoryDeletedDesc', { name: categoryToDelete.name }) });
        await fetchCategories();
      } else {
        toast({ title: t('deleteCategoryErrorTitle'), description: result.error || t('deleteCategoryErrorDesc'), variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error in handleDeleteCategory:", error);
      toast({ title: t('unexpectedErrorTitle'), description: t('deleteCategoryErrorDesc'), variant: 'destructive' });
    } finally {
      setCategoryToDelete(null);
      setIsMutating(false);
    }
  };

  // getRoleDisplayNameSafe function is removed

  const renderCategoryFormFields = (
    formState: typeof addForm | typeof editForm,
    setFormState: React.Dispatch<React.SetStateAction<any>> 
  ) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryFormName" className="text-right">{t('nameColumn')}*</Label>
        <Input id="categoryFormName" value={formState.name} onChange={(e) => setFormState((prev: any) => ({...prev, name: e.target.value}))} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryFormIcon" className="text-right">{t('iconNameColumn')}</Label>
        <Input id="categoryFormIcon" value={formState.iconName || ''} onChange={(e) => setFormState((prev: any) => ({...prev, iconName: e.target.value}))} placeholder="e.g., Soup (Lucide)" className="col-span-3" />
      </div>
      {/* Select dropdown for printer role is completely removed */}
      {/* isLoadingRoles related text is removed */}
    </div>
  );

  const isInitialLoading = isLoadingCategories; // Only isLoadingCategories now

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline flex items-center"><ListFilter className="mr-2 h-5 w-5 text-primary"/>{t('categoryManagementSettings')}</CardTitle>
          <CardDescription>{t('manageCategoriesDesc')}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchCategories(); /* fetchPrinterRoles call removed */ }} disabled={isInitialLoading || isMutating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${(isInitialLoading) && !isAddDialogOpen && !isEditDialogOpen ? 'animate-spin' : ''}`} />
            {isInitialLoading ? t('refreshing') : t('refresh')}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) setAddForm(initialFormState);
            }}>
            <DialogTrigger asChild>
              <Button disabled={isMutating || isInitialLoading}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('addCategoryButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>{t('addNewCategoryTitle')}</DialogTitle>
                <DialogDescription>{t('addNewCategoryDesc')}</DialogDescription>
              </DialogHeader>
              {renderCategoryFormFields(addForm, setAddForm)}
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" disabled={isMutating}>{t('cancelButton')}</Button></DialogClose>
                <Button onClick={handleAddCategory} disabled={isMutating /* || isLoadingRoles removed */} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isMutating ? t('addingButton') : t('addCategoryButton')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isInitialLoading && categories.length === 0 ? (
          <div className="text-center py-10">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">{t('loadingCategories')}</p>
          </div>
        ) : (
          <Table>
            <TableCaption>{t('categoryListCaption')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nameColumn')}</TableHead>
                <TableHead>{t('iconNameColumn')}</TableHead>
                {/* Default Printer Role column header removed */}
                <TableHead className="text-right w-[150px]">{t('actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.iconName || t('noneAbbreviation')}</TableCell>
                  {/* TableCell for defaultPrinterRoleKey removed */}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)} className="mr-2" disabled={isMutating || isInitialLoading}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!categoryToDelete && categoryToDelete.id === category.id} onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteCategory(category)} disabled={isMutating || isInitialLoading}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('confirmDeleteCategoryDesc', { name: categoryToDelete?.name || '' })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setCategoryToDelete(null)} disabled={isMutating}>{t('cancelButton')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteCategory} disabled={isMutating} className="bg-destructive hover:bg-destructive/90">
                            {isMutating ? t('deletingButton') : t('deleteButton')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isInitialLoading && categories.length === 0 && (
                <TableRow>
                  {/* ColSpan adjusted */}
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">{t('noCategoriesFound')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) setIsEditDialogOpen(false); }}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>{t('editCategoryTitle', { name: editingCategory?.name || '' })}</DialogTitle>
            <DialogDescription>{t('editCategoryDesc')}</DialogDescription>
          </DialogHeader>
          {editingCategory && renderCategoryFormFields(editForm, setEditForm)}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isMutating}>{t('cancelButton')}</Button></DialogClose>
            <Button onClick={handleUpdateCategory} disabled={isMutating /* || isLoadingRoles removed */} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             {isMutating ? t('savingButton') : t('saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
