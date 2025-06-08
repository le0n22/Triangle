
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MenuCategory as AppMenuCategory, PrinterRole } from '@/types';
import { printerRoles as staticPrinterRoles } from '@/types'; // Import static printerRoles as a fallback
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
import { PlusCircle, Edit2, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
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
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/types';

const NO_ROLE_VALUE = "_NONE_";

interface ConfiguredPrinterRole {
  role: PrinterRole;
  displayName: string;
}

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

  const [configuredRoles, setConfiguredRoles] = useState<ConfiguredPrinterRole[]>([]);
  const [isFetchingRoles, setIsFetchingRoles] = useState(true);
  const [rolesFetchError, setRolesFetchError] = useState<string | null>(null);

  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchPrintServerUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('orderflow-print-server-url') || 'http://localhost:3001';
    }
    return 'http://localhost:3001';
  }, []);

  const fetchConfiguredRoles = useCallback(async () => {
    setIsFetchingRoles(true);
    setRolesFetchError(null);
    const printServerBaseUrl = fetchPrintServerUrl();
    const rolesUrl = `${printServerBaseUrl.replace(/\/print-kot$/, '')}/configured-printer-roles`;

    try {
      const response = await fetch(rolesUrl);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(t('fetchRolesErrorDetailed', { status: response.status, url: rolesUrl, message: errorText.substring(0,100) }) as string);
      }
      const data: ConfiguredPrinterRole[] = await response.json();
      setConfiguredRoles(data);
      toast({
        title: t('rolesFetchedTitle'),
        description: t('rolesFetchedDesc', { count: data.length, url: rolesUrl }),
      });
    } catch (error: any) {
      console.error("Failed to fetch configured printer roles:", error);
      setRolesFetchError(error.message || t('fetchRolesErrorGeneric'));
      toast({
        title: t('fetchRolesErrorTitle'),
        description: error.message || t('fetchRolesErrorGeneric'),
        variant: 'destructive',
        duration: 7000,
      });
      // Fallback to static roles if fetch fails
      setConfiguredRoles([]);
    } finally {
      setIsFetchingRoles(false);
    }
  }, [fetchPrintServerUrl, t, toast]);


  const fetchCategories = useCallback(async () => {
    setIsFetching(true);
    try {
      const dbCategories = await getAllCategoriesAction();
      setCategories(dbCategories.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      toast({ title: t('error'), description: t('fetchCategoriesError'), variant: 'destructive' });
      console.error("Failed to fetch categories:", error);
    }
    setIsFetching(false);
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, toast]); // Added t to dependencies

  useEffect(() => {
    fetchCategories();
    fetchConfiguredRoles();
  }, [fetchCategories, fetchConfiguredRoles]);

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
        defaultPrinterRole: addForm.defaultPrinterRole || undefined,
      });

      if ('error' in result) {
        toast({ title: t('addCategoryErrorTitle'), description: result.error, variant: 'destructive' });
      } else {
        toast({ title: t('categoryAddedTitle'), description: t('categoryAddedDesc', { name: result.name }) });
        setAddForm({ name: '', iconName: '', defaultPrinterRole: null });
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
      defaultPrinterRole: category.defaultPrinterRole || null
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
        defaultPrinterRole: editForm.defaultPrinterRole,
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

  const getRoleDisplayName = (roleValue?: PrinterRole | null): string => {
    if (!roleValue) return t('noDefaultRole'); // Default to N/A if no roleValue
    const dynamicRole = configuredRoles.find(r => r.role === roleValue);
    if (dynamicRole) return dynamicRole.displayName;

    // Fallback for static roles if not found in dynamic ones (e.g. during fetch error)
    const roleMap: Record<PrinterRole, TranslationKey> = {
      KITCHEN_KOT: 'kitchenKOT',
      BAR_KOT: 'barKOT',
      RECEIPT: 'receiptPrinting',
      REPORT: 'reportPrinting',
    };
    return t(roleMap[roleValue] || roleValue); // Use roleValue itself as a last resort
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
          disabled={isFetchingRoles && configuredRoles.length === 0 && !rolesFetchError}
        >
          <SelectTrigger id="categoryFormPrinterRole" className="col-span-3">
            <SelectValue placeholder={t('selectDefaultPrinterRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_ROLE_VALUE}>{t('noDefaultRole')}</SelectItem>
            {(configuredRoles.length > 0 ? configuredRoles : staticPrinterRoles.map(r => ({ role: r, displayName: getRoleDisplayName(r) }))).map(item => (
              <SelectItem key={item.role} value={item.role}>
                {item.displayName || item.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
       {isFetchingRoles && (
        <div className="col-span-4 text-xs text-muted-foreground text-center">
          <RefreshCw className="inline-block mr-1 h-3 w-3 animate-spin" />
          {t('fetchingRoles')}...
        </div>
      )}
      {rolesFetchError && !isFetchingRoles && (
         <div className="col-span-4 text-xs text-destructive text-center p-2 border border-destructive/50 rounded-md">
            <AlertTriangle className="inline-block mr-1 h-3 w-3" />
            {t('rolesFetchErrorWarning')}: {rolesFetchError}
         </div>
      )}
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">{t('categoryManagementSettings')}</CardTitle>
          <CardDescription>{t('manageCategoriesDesc')}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchCategories(); fetchConfiguredRoles(); }} disabled={isFetching || isMutating || isFetchingRoles}>
            <RefreshCw className={`mr-2 h-4 w-4 ${(isFetching || isFetchingRoles) && !isAddDialogOpen && !isEditDialogOpen ? 'animate-spin' : ''}`} />
            {isFetching || isFetchingRoles ? t('refreshing') : t('refresh')}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) setAddForm({ name: '', iconName: '', defaultPrinterRole: null });
            }}>
            <DialogTrigger asChild>
              <Button disabled={isMutating || isFetching || isFetchingRoles}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('addCategoryButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>{t('addNewCategoryTitle')}</DialogTitle>
                <DialogDescription>{t('addNewCategoryDesc')}</DialogDescription>
              </DialogHeader>
              {renderCategoryFormFields(addForm, setAddForm as React.Dispatch<React.SetStateAction<typeof addForm>>)}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isMutating}>{t('cancelButton')}</Button>
                </DialogClose>
                <Button onClick={handleAddCategory} disabled={isMutating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isMutating ? t('addingButton') : t('addCategoryButton')}
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
                  <TableCell>{getRoleDisplayName(category.defaultPrinterRole)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)} className="mr-2" disabled={isMutating || isFetching || isFetchingRoles}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!categoryToDelete && categoryToDelete.id === category.id} onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteCategory(category)} disabled={isMutating || isFetching || isFetchingRoles}>
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
              {!isFetching && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t('noCategoriesFound')}</TableCell>
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
            <DialogTitle>{t('editCategoryTitle', { name: editingCategory?.name || '' })}</DialogTitle>
            <DialogDescription>{t('editCategoryDesc')}</DialogDescription>
          </DialogHeader>
          {editingCategory && renderCategoryFormFields(editForm, setEditForm as React.Dispatch<React.SetStateAction<typeof editForm>>)}
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isMutating}>{t('cancelButton')}</Button>
            </DialogClose>
            <Button onClick={handleUpdateCategory} disabled={isMutating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             {isMutating ? t('savingButton') : t('saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    