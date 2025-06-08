
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { 
  AppMenuItem, 
  AppMenuCategory, 
  AppModifier,
  AppPrinterRoleDefinition // Import AppPrinterRoleDefinition
} from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, RefreshCw, PackageSearch, ListFilter } from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useCurrency } from '@/hooks/useCurrency';
import { 
  getAllMenuItemsAction, createMenuItemAction, updateMenuItemAction, deleteMenuItemAction,
  type MenuItemFormData
} from '@backend/actions/menuItemActions';
import { getAllCategoriesAction } from '@backend/actions/categoryActions';
import { getAllModifiersAction } from '@backend/actions/modifierActions';
import { getAllPrinterRoleDefinitionsAction } from '@backend/actions/printerRoleDefinitionActions'; // Import
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/types';

const NO_ROLE_VALUE = "_NONE_";

export function MenuItemManagementSettings() {
  const [menuItems, setMenuItems] = useState<AppMenuItem[]>([]);
  const [categories, setCategories] = useState<AppMenuCategory[]>([]);
  const [allModifiers, setAllModifiers] = useState<AppModifier[]>([]);
  const [printerRoles, setPrinterRoles] = useState<AppPrinterRoleDefinition[]>([]); // State for dynamic roles
  
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingModifiers, setIsLoadingModifiers] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true); // Separate loading for roles
  const [isMutating, setIsMutating] = useState(false);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<AppMenuItem | null>(null);
  const [menuItemToDelete, setMenuItemToDelete] = useState<AppMenuItem | null>(null);
  
  const { toast } = useToast();
  const { formatCurrency, currency } = useCurrency();
  const { t } = useLanguage();

  const initialFormState: MenuItemFormData = {
    name: '', description: '', price: 0, imageUrl: '', dataAiHint: '',
    categoryId: '', availableModifierIds: [], defaultPrinterRoleKey: NO_ROLE_VALUE,
  };
  const [currentForm, setCurrentForm] = useState(initialFormState);

  const fetchMenuItems = useCallback(async () => {
    setIsLoadingItems(true);
    const result = await getAllMenuItemsAction();
    if ('error' in result) {
      toast({ title: t('error'), description: result.error, variant: 'destructive' });
      setMenuItems([]);
    } else {
      setMenuItems(result.sort((a, b) => a.name.localeCompare(b.name)));
    }
    setIsLoadingItems(false);
  }, [toast, t]);

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    const result = await getAllCategoriesAction();
    if (Array.isArray(result)) {
      setCategories(result.sort((a, b) => a.name.localeCompare(b.name)));
      if (result.length > 0 && !currentForm.categoryId) {
          // Set default category if none is selected (for add form)
          if(!editingMenuItem) setCurrentForm(prev => ({ ...prev, categoryId: result[0].id }));
      }
    } else {
      toast({ title: t('error'), description: result.error || 'Unexpected error fetching categories', variant: 'destructive' });
      setCategories([]);
    }
    setIsLoadingCategories(false);
  }, [toast, t, currentForm.categoryId, editingMenuItem]);

  const fetchModifiers = useCallback(async () => {
    setIsLoadingModifiers(true);
    const result = await getAllModifiersAction();
    if (Array.isArray(result)) {
      setAllModifiers(result.sort((a, b) => a.name.localeCompare(b.name)));
    } else if (result && 'error' in result) {
      toast({ title: t('error'), description: result.error, variant: 'destructive' });
      setAllModifiers([]);
    } else {
      toast({ title: t('error'), description: 'Unexpected error fetching modifiers.', variant: 'destructive' });
      setAllModifiers([]);
    }
    setIsLoadingModifiers(false);
  }, [toast, t]);

  const fetchPrinterRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    const result = await getAllPrinterRoleDefinitionsAction();
    if ('error' in result) {
      toast({ title: t('error'), description: result.error, variant: 'destructive' });
      setPrinterRoles([]);
    } else {
      setPrinterRoles(result);
    }
    setIsLoadingRoles(false);
  }, [toast, t]);
  
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchModifiers();
    fetchPrinterRoles();
  }, [fetchMenuItems, fetchCategories, fetchModifiers, fetchPrinterRoles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setCurrentForm(prev => ({ ...prev, categoryId: categoryId }));
  };

  const handleModifierToggle = (modifierId: string, checked: boolean) => {
    setCurrentForm(prev => {
      const currentIds = prev.availableModifierIds || [];
      const newModifierIds = checked
        ? [...currentIds, modifierId]
        : currentIds.filter(id => id !== modifierId);
      return { ...prev, availableModifierIds: newModifierIds };
    });
  };

  const handleDefaultPrinterRoleChange = (roleKey: string) => {
    setCurrentForm(prev => ({ ...prev, defaultPrinterRoleKey: roleKey }));
  };
  
  const openAddDialog = () => {
    setEditingMenuItem(null);
    let defaultCatId = '';
    if (categories.length > 0 && !isLoadingCategories) {
        defaultCatId = categories[0].id;
    }
    setCurrentForm({...initialFormState, categoryId: defaultCatId, defaultPrinterRoleKey: NO_ROLE_VALUE });
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (menuItem: AppMenuItem) => {
    setEditingMenuItem(menuItem);
    setCurrentForm({
      name: menuItem.name,
      description: menuItem.description || '',
      price: menuItem.price,
      imageUrl: menuItem.imageUrl || '',
      dataAiHint: menuItem.dataAiHint || '',
      categoryId: menuItem.categoryId,
      availableModifierIds: menuItem.availableModifiers ? menuItem.availableModifiers.map(mod => mod.id) : [],
      defaultPrinterRoleKey: menuItem.defaultPrinterRoleKey || NO_ROLE_VALUE,
    });
    setIsFormDialogOpen(true);
  };

  const handleSubmitMenuItem = async () => {
    if (!currentForm.name || !currentForm.categoryId || currentForm.price === null || currentForm.price === undefined) {
      toast({ title: t('error'), description: 'Name, category, and price are required.', variant: 'destructive' });
      return;
    }
    if (isNaN(currentForm.price) || currentForm.price < 0) {
      toast({ title: t('error'), description: 'Price must be a non-negative number.', variant: 'destructive' });
      return;
    }

    setIsMutating(true);
    const formData: MenuItemFormData = {
      ...currentForm,
      description: currentForm.description || undefined,
      imageUrl: currentForm.imageUrl || undefined,
      dataAiHint: currentForm.dataAiHint || undefined,
      defaultPrinterRoleKey: currentForm.defaultPrinterRoleKey === NO_ROLE_VALUE ? null : currentForm.defaultPrinterRoleKey,
    };

    try {
      const result = editingMenuItem
        ? await updateMenuItemAction(editingMenuItem.id, formData)
        : await createMenuItemAction(formData);

      if ('error' in result) {
        toast({ title: t('error'), description: result.error, variant: 'destructive' });
      } else {
        toast({ title: `Menu Item ${editingMenuItem ? 'Updated' : 'Added'}`, description: `"${result.name}" was successfully ${editingMenuItem ? 'updated' : 'added'}.` });
        setIsFormDialogOpen(false);
        fetchMenuItems(); 
      }
    } catch (error) {
      toast({ title: t('unexpectedErrorTitle'), description: `Could not ${editingMenuItem ? 'update' : 'add'} menu item.`, variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };
  
  const confirmDeleteMenuItem = (menuItem: AppMenuItem) => setMenuItemToDelete(menuItem);

  const handleDeleteMenuItem = async () => {
    if (!menuItemToDelete) return;
    setIsMutating(true);
    try {
      const result = await deleteMenuItemAction(menuItemToDelete.id);
      if (result.success) {
        toast({ title: 'Menu Item Deleted', description: `"${menuItemToDelete.name}" has been deleted.` });
        fetchMenuItems(); 
      } else {
        toast({ title: t('error'), description: result.error || 'Failed to delete menu item.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: t('unexpectedErrorTitle'), description: 'Could not delete menu item.', variant: 'destructive' });
    } finally {
      setMenuItemToDelete(null);
      setIsMutating(false);
    }
  };
  
  const formatModifierPriceChange = (priceChange: number) => {
    const sign = priceChange >= 0 ? '+' : '-';
    return `${sign}${currency.symbol}${Math.abs(priceChange).toFixed(2)}`;
  };

  const getRoleDisplayNameSafe = (roleKey?: string): string => {
    if (!roleKey || roleKey === NO_ROLE_VALUE) return t('noDefaultRole');
    const role = printerRoles.find(r => r.roleKey === roleKey);
    return role ? role.displayName : roleKey;
  };

  const renderFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemName" className="text-right">{t('nameColumn')}*</Label>
        <Input id="itemName" name="name" value={currentForm.name} onChange={handleInputChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="itemDescription" className="text-right pt-2">Description</Label>
        <Textarea id="itemDescription" name="description" value={currentForm.description || ''} onChange={handleInputChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemPrice" className="text-right">{t('priceColumn')}*</Label>
        <Input id="itemPrice" name="price" type="number" step="0.01" value={currentForm.price.toString()} onChange={handlePriceChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemImageUrl" className="text-right">Image URL</Label>
        <Input id="itemImageUrl" name="imageUrl" value={currentForm.imageUrl || ''} onChange={handleInputChange} className="col-span-3" placeholder="https://placehold.co/100x100.png" />
      </div>
      {currentForm.imageUrl && (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3">
                 <Image src={currentForm.imageUrl} alt="Preview" width={80} height={80} className="rounded border" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/80x80.png?text=Error')}/>
            </div>
          </div>
      )}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemDataAiHint" className="text-right">AI Hint</Label>
        <Input id="itemDataAiHint" name="dataAiHint" value={currentForm.dataAiHint || ''} onChange={handleInputChange} className="col-span-3" placeholder="e.g., burger fries (max 2 words)" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemCategory" className="text-right">{t('categoryColumn')}*</Label>
        {isLoadingCategories ? (
            <div className="col-span-3 text-muted-foreground">Loading categories...</div>
        ) : categories.length === 0 ? (
            <div className="col-span-3 text-destructive">No categories. Add categories first.</div>
        ) : (
          <Select value={currentForm.categoryId || ''} onValueChange={handleCategoryChange} disabled={categories.length === 0}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemDefaultPrinterRole" className="text-right">{t('defaultPrinterRole')}</Label>
        <Select
          value={currentForm.defaultPrinterRoleKey || NO_ROLE_VALUE}
          onValueChange={handleDefaultPrinterRoleChange}
          disabled={isLoadingRoles && printerRoles.length === 0}
        >
          <SelectTrigger id="itemDefaultPrinterRole" className="col-span-3">
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
            {!isLoadingRoles && printerRoles.length === 0 && <SelectItem value="no_roles_defined" disabled>No printer roles defined.</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">{t('modifiersColumn')}</Label>
        <div className="col-span-3 space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
          {isLoadingModifiers ? (
            <div className="text-muted-foreground">Loading modifiers...</div>
          ) : allModifiers.length === 0 ? (
             <div className="text-muted-foreground">No modifiers configured.</div>
          ) : (
            allModifiers.map(modifier => (
              <div key={modifier.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`mod-menuitem-${modifier.id}`}
                  checked={(currentForm.availableModifierIds || []).includes(modifier.id)}
                  onCheckedChange={(checked) => handleModifierToggle(modifier.id, !!checked)}
                />
                <Label htmlFor={`mod-menuitem-${modifier.id}`} className="font-normal">
                  {modifier.name} ({formatModifierPriceChange(modifier.priceChange)})
                </Label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
  
  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'N/A';
  const isInitialLoading = isLoadingItems || isLoadingCategories || isLoadingModifiers || isLoadingRoles;

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline flex items-center"><PackageSearch className="mr-2 h-5 w-5 text-primary"/>{t('menuItemManagementSettings')}</CardTitle>
          <CardDescription>{t('manageMenuItemsDesc')}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchMenuItems(); fetchCategories(); fetchModifiers(); fetchPrinterRoles(); }} disabled={isInitialLoading || isMutating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isInitialLoading && !isFormDialogOpen ? 'animate-spin' : ''}`} /> 
            { isInitialLoading && !isFormDialogOpen ? t('refreshing') : t('refresh')}
          </Button>
          <Dialog open={isFormDialogOpen} onOpenChange={(open) => { if(!open) setIsFormDialogOpen(false); }}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} disabled={isMutating || isInitialLoading}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('addMenuItemButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>{editingMenuItem ? t('editMenuItemTitle') : t('addNewMenuItemTitle')}</DialogTitle>
                <DialogDescription>
                  {editingMenuItem ? t('editMenuItemDesc', {name: editingMenuItem.name}) : t('addNewMenuItemDesc')}
                </DialogDescription>
              </DialogHeader>
              {renderFormFields()}
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" disabled={isMutating}>{t('cancelButton')}</Button></DialogClose>
                <Button onClick={handleSubmitMenuItem} disabled={isMutating || isLoadingCategories || isLoadingModifiers || isLoadingRoles || (categories.length === 0 && !editingMenuItem) } className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isMutating ? t('savingButton') : (editingMenuItem ? t('saveChanges') : t('addMenuItemButton'))}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isInitialLoading && menuItems.length === 0 ? (
          <div className="text-center py-10">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">{t('loadingMenuItems')}</p>
          </div>
        ) : (
          <Table>
            <TableCaption>{t('menuItemListCaption')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">{t('imageColumn')}</TableHead>
                <TableHead>{t('nameColumn')}</TableHead>
                <TableHead>{t('categoryColumn')}</TableHead>
                <TableHead className="text-right">{t('priceColumn')}</TableHead>
                <TableHead>{t('modifiersColumn')}</TableHead>
                <TableHead>{t('defaultPrinterRole')}</TableHead>
                <TableHead className="text-right w-[150px]">{t('actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image 
                        src={item.imageUrl || 'https://placehold.co/60x60.png?text=NoImg'} 
                        alt={item.name} width={50} height={50} className="rounded-md object-cover"
                        data-ai-hint={item.dataAiHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-xs">
                    {item.availableModifiers && item.availableModifiers.length > 0 
                      ? item.availableModifiers.map(m => m.name).join(', ') : t('noneAbbreviation')}
                  </TableCell>
                  <TableCell>{getRoleDisplayNameSafe(item.defaultPrinterRoleKey)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)} className="mr-2" disabled={isMutating || isInitialLoading}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!menuItemToDelete && menuItemToDelete.id === item.id} onOpenChange={(isOpen) => !isOpen && setMenuItemToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteMenuItem(item)} disabled={isMutating || isInitialLoading}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('confirmDeleteMenuItemDesc', {name: menuItemToDelete?.name || ''})}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setMenuItemToDelete(null)} disabled={isMutating}>{t('cancelButton')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteMenuItem} disabled={isMutating} className="bg-destructive hover:bg-destructive/90">
                            {isMutating ? t('deletingButton') : t('deleteButton')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isInitialLoading && menuItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">{t('noMenuItemsFound')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
