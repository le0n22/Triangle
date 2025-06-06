
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { 
  MenuItem as AppMenuItem, 
  MenuCategory as AppMenuCategory, 
  Modifier as AppModifier 
} from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, RefreshCw, ImagePlus, UploadCloud } from 'lucide-react';
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
import { 
  getAllMenuItemsAction, 
  createMenuItemAction, 
  updateMenuItemAction, 
  deleteMenuItemAction 
} from '../../../../backend/actions/menuItemActions';
import { getAllCategoriesAction } from '../../../../backend/actions/categoryActions';
import { getAllModifiersAction } from '../../../../backend/actions/modifierActions';

// Frontend'in kullanacağı MenuItem tipi (categoryName ve availableModifier detaylarını içerecek)
// backend/actions/menuItemActions.ts'deki AppMenuItem ile aynı olmalı
interface MenuItemDisplay extends AppMenuItem {
  categoryName: string; 
}


export function MenuItemManagementSettings() {
  const [menuItems, setMenuItems] = useState<AppMenuItem[]>([]);
  const [categories, setCategories] = useState<AppMenuCategory[]>([]);
  const [allModifiers, setAllModifiers] = useState<AppModifier[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [isFetchingModifiers, setIsFetchingModifiers] = useState(true);
  const [isMutating, setIsMutating] = useState(false); // For add/edit/delete operations

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<AppMenuItem | null>(null);
  const [menuItemToDelete, setMenuItemToDelete] = useState<AppMenuItem | null>(null);
  
  const { toast } = useToast();

  const initialFormState = {
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    dataAiHint: '',
    category: '', // categoryId
    availableModifierIds: [] as string[],
  };
  const [currentForm, setCurrentForm] = useState(initialFormState);

  const fetchAllData = useCallback(async () => {
    console.log("FRONTEND: MenuItemManagementSettings: fetchAllData triggered.");
    setIsLoading(true);
    setIsFetchingCategories(true);
    setIsFetchingModifiers(true);
    try {
      const [menuItemsResult, categoriesResult, modifiersResult] = await Promise.all([
        getAllMenuItemsAction(),
        getAllCategoriesAction(),
        getAllModifiersAction()
      ]);

      if ('error' in menuItemsResult) {
        toast({ title: 'Error Fetching Menu Items', description: menuItemsResult.error, variant: 'destructive' });
        setMenuItems([]);
      } else {
        setMenuItems(menuItemsResult.sort((a, b) => a.name.localeCompare(b.name)));
        console.log("FRONTEND: MenuItemManagementSettings: Menu items state SET. Count:", menuItemsResult.length);
      }

      if (Array.isArray(categoriesResult)) { // Assuming categoriesResult is AppMenuCategory[]
        setCategories(categoriesResult.sort((a, b) => a.name.localeCompare(b.name)));
        console.log("FRONTEND: MenuItemManagementSettings: Categories state SET. Count:", categoriesResult.length);
      } else { // Handle if categoriesResult is { error: string } or unexpected
        toast({ title: 'Error Fetching Categories', description: (categoriesResult as any).error || 'Unexpected error', variant: 'destructive' });
        setCategories([]);
      }
      
      if (Array.isArray(modifiersResult)) { // Assuming modifiersResult is AppModifier[]
          setAllModifiers(modifiersResult.sort((a, b) => a.name.localeCompare(b.name)));
          console.log("FRONTEND: MenuItemManagementSettings: Modifiers state SET. Count:", modifiersResult.length);
      } else if (modifiersResult && typeof modifiersResult === 'object' && 'error' in modifiersResult) {
          toast({ title: 'Error Fetching Modifiers', description: (modifiersResult as {error: string}).error, variant: 'destructive' });
          setAllModifiers([]);
      } else {
          toast({ title: 'Error Fetching Modifiers', description: 'Unexpected response for modifiers.', variant: 'destructive' });
          setAllModifiers([]);
      }

    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch initial data for menu items.', variant: 'destructive' });
      console.error("FRONTEND: MenuItemManagementSettings: Failed to fetch data:", error);
      setMenuItems([]);
      setCategories([]);
      setAllModifiers([]);
    } finally {
      setIsLoading(false);
      setIsFetchingCategories(false);
      setIsFetchingModifiers(false);
      console.log("FRONTEND: MenuItemManagementSettings: fetchAllData finished.");
    }
  }, [toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentForm(prev => ({ ...prev, price: e.target.value }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setCurrentForm(prev => ({ ...prev, category: categoryId }));
  };

  const handleModifierToggle = (modifierId: string, checked: boolean) => {
    setCurrentForm(prev => {
      const newModifierIds = checked
        ? [...prev.availableModifierIds, modifierId]
        : prev.availableModifierIds.filter(id => id !== modifierId);
      return { ...prev, availableModifierIds: newModifierIds };
    });
  };
  
  const openAddDialog = () => {
    setEditingMenuItem(null);
    let defaultCategoryId = '';
    if (categories.length > 0) {
        defaultCategoryId = categories[0].id;
    }
    setCurrentForm({...initialFormState, category: defaultCategoryId });
    console.log("FRONTEND: MenuItemManagementSettings: Opening Add Dialog, currentForm state:", {...initialFormState, category: defaultCategoryId });
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (menuItem: AppMenuItem) => {
    setEditingMenuItem(menuItem);
    setCurrentForm({
      name: menuItem.name,
      description: menuItem.description || '',
      price: menuItem.price.toString(),
      imageUrl: menuItem.imageUrl || '',
      dataAiHint: menuItem.dataAiHint || '',
      category: menuItem.categoryId,
      availableModifierIds: menuItem.availableModifiers ? menuItem.availableModifiers.map(mod => mod.id) : [],
    });
    console.log("FRONTEND: MenuItemManagementSettings: Opening Edit Dialog for:", menuItem.name, "Form state:", {
        name: menuItem.name,
        description: menuItem.description || '',
        price: menuItem.price.toString(),
        imageUrl: menuItem.imageUrl || '',
        dataAiHint: menuItem.dataAiHint || '',
        category: menuItem.categoryId,
        availableModifierIds: menuItem.availableModifiers ? menuItem.availableModifiers.map(mod => mod.id) : [],
      });
    setIsFormDialogOpen(true);
  };

  const handleSubmitMenuItem = async () => {
    if (!currentForm.name || !currentForm.category || currentForm.price === '') {
      toast({ title: 'Validation Error', description: 'Name, category, and price are required.', variant: 'destructive' });
      return;
    }
    const priceNumber = parseFloat(currentForm.price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      toast({ title: 'Validation Error', description: 'Price must be a non-negative number.', variant: 'destructive' });
      return;
    }

    setIsMutating(true);
    const formData = {
      name: currentForm.name,
      description: currentForm.description || undefined,
      price: priceNumber,
      imageUrl: currentForm.imageUrl || undefined,
      dataAiHint: currentForm.dataAiHint || undefined,
      categoryId: currentForm.category,
      availableModifierIds: currentForm.availableModifierIds,
    };

    try {
      let result;
      if (editingMenuItem) {
        console.log("FRONTEND: MenuItemManagementSettings: Calling updateMenuItemAction for ID:", editingMenuItem.id, "Data:", formData);
        result = await updateMenuItemAction(editingMenuItem.id, formData);
      } else {
        console.log("FRONTEND: MenuItemManagementSettings: Calling createMenuItemAction with Data:", formData);
        result = await createMenuItemAction(formData);
      }
      console.log("FRONTEND: MenuItemManagementSettings: Action result:", result);

      if ('error' in result) {
        toast({ title: `Error ${editingMenuItem ? 'Updating' : 'Adding'} Menu Item`, description: result.error, variant: 'destructive' });
      } else {
        toast({ title: `Menu Item ${editingMenuItem ? 'Updated' : 'Added'}`, description: `"${result.name}" has been successfully ${editingMenuItem ? 'updated' : 'added'}.` });
        setIsFormDialogOpen(false);
        await fetchAllData(); // Refresh all data
      }
    } catch (error) {
      console.error("FRONTEND: MenuItemManagementSettings: Error in handleSubmitMenuItem:", error);
      toast({ title: 'Unexpected Error', description: `Could not ${editingMenuItem ? 'update' : 'add'} menu item.`, variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };
  
  const confirmDeleteMenuItem = (menuItem: AppMenuItem) => {
    setMenuItemToDelete(menuItem);
  };

  const handleDeleteMenuItem = async () => {
    if (!menuItemToDelete) return;
    setIsMutating(true);
    console.log("FRONTEND: MenuItemManagementSettings: Calling deleteMenuItemAction for ID:", menuItemToDelete.id);
    try {
      const result = await deleteMenuItemAction(menuItemToDelete.id);
      console.log("FRONTEND: MenuItemManagementSettings: deleteMenuItemAction result:", result);

      if (result.success) {
        toast({ title: 'Menu Item Deleted', description: `"${menuItemToDelete.name}" has been deleted.` });
        await fetchAllData(); // Refresh all data
      } else {
        toast({ title: 'Error Deleting Menu Item', description: result.error || 'Failed to delete menu item.', variant: 'destructive' });
      }
    } catch (error) {
      console.error("FRONTEND: MenuItemManagementSettings: Error in handleDeleteMenuItem:", error);
      toast({ title: 'Unexpected Error', description: 'Could not delete menu item.', variant: 'destructive' });
    } finally {
      setMenuItemToDelete(null);
      setIsMutating(false);
    }
  };

  const renderFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemName" className="text-right">Name*</Label>
        <Input id="itemName" name="name" value={currentForm.name} onChange={handleInputChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="itemDescription" className="text-right pt-2">Description</Label>
        <Textarea id="itemDescription" name="description" value={currentForm.description} onChange={handleInputChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemPrice" className="text-right">Price*</Label>
        <Input id="itemPrice" name="price" type="number" step="0.01" value={currentForm.price} onChange={handlePriceChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemImageUrl" className="text-right">Image URL</Label>
        <Input id="itemImageUrl" name="imageUrl" value={currentForm.imageUrl} onChange={handleInputChange} className="col-span-3" placeholder="https://placehold.co/100x100.png" />
      </div>
      {currentForm.imageUrl && (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3">
                 <Image src={currentForm.imageUrl} alt="Preview" width={80} height={80} className="rounded border" onError={(e) => (e.currentTarget.src = 'https://placehold.co/80x80.png?text=Error')}/>
            </div>
          </div>
      )}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemDataAiHint" className="text-right">AI Hint</Label>
        <Input id="itemDataAiHint" name="dataAiHint" value={currentForm.dataAiHint} onChange={handleInputChange} className="col-span-3" placeholder="e.g., burger fries (max 2 words)" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemCategory" className="text-right">Category*</Label>
        {isFetchingCategories ? (
            <div className="col-span-3 text-muted-foreground">Loading categories...</div>
        ) : categories.length === 0 ? (
            <div className="col-span-3 text-destructive">No categories available. Please add categories first.</div>
        ) : (
          <Select value={currentForm.category || ''} onValueChange={handleCategoryChange} disabled={categories.length === 0}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">Modifiers</Label>
        <div className="col-span-3 space-y-2">
          {isFetchingModifiers ? (
            <div className="text-muted-foreground">Loading modifiers...</div>
          ) : allModifiers.length === 0 ? (
             <div className="text-muted-foreground">No modifiers configured.</div>
          ) : (
            allModifiers.map(modifier => (
              <div key={modifier.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`mod-${modifier.id}`}
                  checked={currentForm.availableModifierIds.includes(modifier.id)}
                  onCheckedChange={(checked) => handleModifierToggle(modifier.id, !!checked)}
                />
                <Label htmlFor={`mod-${modifier.id}`} className="font-normal">
                  {modifier.name} ({modifier.priceChange >= 0 ? `+$${modifier.priceChange.toFixed(2)}` : `-$${Math.abs(modifier.priceChange).toFixed(2)}`})
                </Label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
  
  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'N/A';

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Menu Item Management</CardTitle>
          <CardDescription>Manage your menu items, their categories, and modifiers.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAllData} disabled={isLoading || isMutating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading && !isFormDialogOpen) ? 'animate-spin' : ''}`} /> 
            {isLoading && !isFormDialogOpen ? 'Refreshing...' : 'Refresh All'}
          </Button>
          <Dialog open={isFormDialogOpen} onOpenChange={(open) => { if(!open) setIsFormDialogOpen(false); }}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} disabled={isMutating || isLoading}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>{editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                <DialogDescription>
                  {editingMenuItem ? `Update details for "${editingMenuItem.name}".` : 'Enter details for the new menu item.'}
                </DialogDescription>
              </DialogHeader>
              {renderFormFields()}
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" disabled={isMutating}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmitMenuItem} disabled={isMutating || isFetchingCategories || isFetchingModifiers || (categories.length === 0 && !editingMenuItem) } className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isMutating ? 'Saving...' : (editingMenuItem ? 'Save Changes' : 'Add Menu Item')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-10">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading menu items...</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your menu items from the database.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Modifiers</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image 
                        src={item.imageUrl || 'https://placehold.co/60x60.png?text=NoImg'} 
                        alt={item.name} 
                        width={50} 
                        height={50} 
                        className="rounded-md object-cover"
                        data-ai-hint={item.dataAiHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">
                    {item.availableModifiers && item.availableModifiers.length > 0 
                      ? item.availableModifiers.map(m => m.name).join(', ') 
                      : 'None'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)} className="mr-2" disabled={isMutating || isLoading}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!menuItemToDelete && menuItemToDelete.id === item.id} onOpenChange={(isOpen) => !isOpen && setMenuItemToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteMenuItem(item)} disabled={isMutating || isLoading}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete the menu item "{menuItemToDelete?.name}".
                            If this item is part of existing orders, deletion might be restricted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setMenuItemToDelete(null)} disabled={isMutating}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteMenuItem} disabled={isMutating} className="bg-destructive hover:bg-destructive/90">
                            {isMutating ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && menuItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No menu items found in the database. Add some!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

    