
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppMenuCategory, AppPrinterRoleDefinition } from '@/types'; // Using AppPrinterRoleDefinition
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, RefreshCw, PackageSearch, ListFilter } from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAllCategoriesAction, createCategoryAction, updateCategoryAction, deleteCategoryAction
} from '@backend/actions/categoryActions';
import { getAllPrinterRoleDefinitionsAction } from '@backend/actions/printerRoleDefinitionActions'; // Import new action
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/types';

const NO_ROLE_VALUE = "_NONE_"; // Represents no role selected

export function CategoryManagementSettings() {
  const [categories, setCategories] = useState<AppMenuCategory[]>([]);
  const [printerRoles, setPrinterRoles] = useState<AppPrinterRoleDefinition[]>([]); // State for dynamic roles
  
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true); // Separate loading for roles
  const [isMutating, setIsMutating] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AppMenuCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AppMenuCategory | null>(null);

  const initialFormState = { name: '', iconName: '', defaultPrinterRoleKey: NO_ROLE_VALUE };
  const [addForm, setAddForm] = useState(initialFormState);
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

  const fetchPrinterRoles = useCallback(async () => { // New function to fetch roles from DB
    setIsLoadingRoles(true);
    const result = await getAllPrinterRoleDefinitionsAction();
    if ('error' in result) {
      toast({ title: t('error'), description: result.error, variant: 'destructive' });
      setPrinterRoles([]);
    } else {
      setPrinterRoles(result);
    }
    setIsLoadingRoles(false);
  }, [t, toast]);

  useEffect(() => {
    fetchCategories();
    fetchPrinterRoles(); // Fetch roles on component mount
  }, [fetchCategories, fetchPrinterRoles]);

  const handleAddCategory = async () => {
    if (!addForm.name) {
      toast({ title: t('error'), description: t('categoryNameRequired'), variant: 'destructive' });
      return;
    }
    setIsMutating(true);
    try {
      const result = await createCategoryAction({
        name: addForm.name,
        iconName: addForm.iconName || undefined,
        defaultPrinterRoleKey: addForm.defaultPrinterRoleKey === NO_ROLE_VALUE ? null : addForm.defaultPrinterRoleKey,
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
    setEditForm({
      id: category.id,
      name: category.name,
      iconName: category.iconName || '',
      defaultPrinterRoleKey: category.defaultPrinterRoleKey || NO_ROLE_VALUE
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
      const result = await updateCategoryAction(editingCategory.id, {
        name: editForm.name,
        iconName: editForm.iconName || undefined,
        defaultPrinterRoleKey: editForm.defaultPrinterRoleKey === NO_ROLE_VALUE ? null : editForm.defaultPrinterRoleKey,
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

  const getRoleDisplayNameSafe = (roleKey?: string): string => {
    if (!roleKey || roleKey === NO_ROLE_VALUE) return t('noDefaultRole');
    const role = printerRoles.find(r => r.roleKey === roleKey);
    return role ? role.displayName : roleKey; // Fallback to roleKey if not found
  };

  const renderCategoryFormFields = (
    formState: typeof addForm | typeof editForm,
    setFormState: React.Dispatch<React.SetStateAction<any>> // Using any for simplicity here
  ) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryFormName" className="text-right">{t('nameColumn')}*</Label>
        <Input id="categoryFormName" value={formState.name} onChange={(e) => setFormState((prev: any) => ({...prev, name: e.target.value}))} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryFormIcon" className="text-right">{t('iconNameColumn')}</Label>
        <Input id="categoryFormIcon" value={formState.iconName} onChange={(e) => setFormState((prev: any) => ({...prev, iconName: e.target.value}))} placeholder="e.g., Soup (Lucide)" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryFormPrinterRole" className="text-right">{t('defaultPrinterRole')}</Label>
        <Select
          value={formState.defaultPrinterRoleKey}
          onValueChange={(value) => {
            setFormState((prev: any) => ({ ...prev, defaultPrinterRoleKey: value }))
          }}
          disabled={isLoadingRoles && printerRoles.length === 0}
        >
          <SelectTrigger id="categoryFormPrinterRole" className="col-span-3">
            <SelectValue placeholder={t('selectDefaultPrinterRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_ROLE_VALUE}>{t('noDefaultRole')}</SelectItem>
            {printerRoles.map(role => (
              <SelectItem key={role.roleKey} value={role.roleKey}>
                {role.displayName} ({role.roleKey})
              </SelectItem>
            ))}
             {isLoadingRoles && printerRoles.length === 0 && <SelectItem value="loading" disabled>Loading roles...</SelectItem>}
             {!isLoadingRoles && printerRoles.length === 0 && <SelectItem value="no_roles" disabled>No printer roles defined.</SelectItem>}
          </SelectContent>
        </Select>
      </div>
       {isLoadingRoles && (
        <div className="col-span-4 text-xs text-muted-foreground text-center">
          <RefreshCw className="inline-block mr-1 h-3 w-3 animate-spin" />
          {t('loadingPrinterRoles')}...
        </div>
      )}
    </div>
  );

  const isInitialLoading = isLoadingCategories || isLoadingRoles;

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline flex items-center"><ListFilter className="mr-2 h-5 w-5 text-primary"/>{t('categoryManagementSettings')}</CardTitle>
          <CardDescription>{t('manageCategoriesDesc')}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchCategories(); fetchPrinterRoles(); }} disabled={isInitialLoading || isMutating}>
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
                <Button onClick={handleAddCategory} disabled={isMutating || isLoadingRoles} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
                <TableHead>{t('defaultPrinterRole')}</TableHead>
                <TableHead className="text-right w-[150px]">{t('actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.iconName || t('noneAbbreviation')}</TableCell>
                  <TableCell>{getRoleDisplayNameSafe(category.defaultPrinterRoleKey)}</TableCell>
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
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t('noCategoriesFound')}</TableCell>
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
            <Button onClick={handleUpdateCategory} disabled={isMutating || isLoadingRoles} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             {isMutating ? t('savingButton') : t('saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
