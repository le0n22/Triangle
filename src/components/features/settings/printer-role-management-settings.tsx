
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppPrinterRoleDefinition } from '@/types';
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, RefreshCw, KeyRound, Users } from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAllPrinterRoleDefinitionsAction,
  createPrinterRoleDefinitionAction,
  updatePrinterRoleDefinitionAction,
  deletePrinterRoleDefinitionAction,
} from '@backend/actions/printerRoleDefinitionActions';
import { useLanguage } from '@/hooks/use-language';

export function PrinterRoleManagementSettings() {
  const [roles, setRoles] = useState<AppPrinterRoleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AppPrinterRoleDefinition | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<AppPrinterRoleDefinition | null>(null);

  const initialFormState = { roleKey: '', displayName: '' };
  const [currentForm, setCurrentForm] = useState(initialFormState);

  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    const result = await getAllPrinterRoleDefinitionsAction();
    if ('error' in result) {
      toast({ title: t('error'), description: result.error, variant: 'destructive' });
      setRoles([]);
    } else {
      setRoles(result);
    }
    setIsLoading(false);
  }, [toast, t]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentForm(prev => ({ ...prev, [name]: value }));
  };

  const resetAndCloseDialog = () => {
    setEditingRole(null);
    setCurrentForm(initialFormState);
    setIsFormDialogOpen(false);
  };

  const handleSubmitRole = async () => {
    if (!currentForm.roleKey || !currentForm.displayName) {
      toast({ title: t('error'), description: "Role Key and Display Name are required.", variant: 'destructive' });
      return;
    }
     if (!/^[A-Z0-9_]+$/.test(currentForm.roleKey)) {
        toast({ title: t('error'), description: 'Role Key can only contain uppercase letters, numbers, and underscores (e.g., MY_ROLE_KEY).', variant: 'destructive' });
        return;
    }

    setIsMutating(true);
    try {
      let result;
      if (editingRole) {
        result = await updatePrinterRoleDefinitionAction(editingRole.id, currentForm);
      } else {
        result = await createPrinterRoleDefinitionAction(currentForm);
      }

      if ('error' in result) {
        toast({ title: t('error'), description: result.error, variant: 'destructive' });
      } else {
        toast({ title: editingRole ? 'Printer Role Updated' : 'Printer Role Added', description: `Role "${result.displayName}" was successfully ${editingRole ? 'updated' : 'added'}.` });
        resetAndCloseDialog();
        fetchRoles();
      }
    } catch (error) {
      toast({ title: t('unexpectedErrorTitle'), description: `Could not ${editingRole ? 'update' : 'add'} printer role.`, variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDeleteRole = (role: AppPrinterRoleDefinition) => {
    setRoleToDelete(role);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsMutating(true);
    try {
      const result = await deletePrinterRoleDefinitionAction(roleToDelete.id);
      if (result.success) {
        toast({ title: 'Printer Role Deleted', description: `Role "${roleToDelete.displayName}" has been deleted.` });
        fetchRoles();
      } else {
        toast({ title: t('error'), description: result.error || 'Failed to delete printer role.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: t('unexpectedErrorTitle'), description: 'Could not delete printer role.', variant: 'destructive' });
    } finally {
      setRoleToDelete(null);
      setIsMutating(false);
    }
  };
  
  const openAddDialog = () => {
    setEditingRole(null);
    setCurrentForm(initialFormState);
    setIsFormDialogOpen(true);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>{t('printerRoles')}</CardTitle>
          <CardDescription>{t('managePrinterRolesDesc')}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRoles} disabled={isLoading || isMutating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading && !isFormDialogOpen ? 'animate-spin' : ''}`} />
            {isLoading && !isFormDialogOpen ? t('refreshing') : t('refresh')}
          </Button>
          <Dialog open={isFormDialogOpen} onOpenChange={(open) => { if(!open) resetAndCloseDialog(); else setIsFormDialogOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} disabled={isLoading || isMutating}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('addPrinterRoleButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>{editingRole ? t('editPrinterRoleTitle') : t('addNewPrinterRoleTitle')}</DialogTitle>
                <DialogDescription>
                  {editingRole ? t('editPrinterRoleDesc', {name: editingRole.displayName}) : t('addNewPrinterRoleDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="roleKey">{t('roleKeyLabel')}*</Label>
                  <Input id="roleKey" name="roleKey" value={currentForm.roleKey} onChange={handleInputChange} placeholder="E.G., KITCHEN_MAIN" disabled={!!editingRole} />
                  {!!editingRole && <p className="text-xs text-muted-foreground">{t('roleKeyEditWarning')}</p>}
                   <p className="text-xs text-muted-foreground">{t('roleKeyFormatHint')}</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="displayName">{t('displayNameLabel')}*</Label>
                  <Input id="displayName" name="displayName" value={currentForm.displayName} onChange={handleInputChange} placeholder="E.g., Main Kitchen Printer" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" disabled={isMutating}>{t('cancelButton')}</Button></DialogClose>
                <Button onClick={handleSubmitRole} disabled={isMutating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isMutating ? t('savingButton') : (editingRole ? t('saveChanges') : t('addPrinterRoleButton'))}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && roles.length === 0 ? (
          <div className="text-center py-10">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">{t('loadingPrinterRoles')}</p>
          </div>
        ) : (
          <Table>
            <TableCaption>{t('printerRoleListCaption')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">{t('roleKeyLabel')}</TableHead>
                <TableHead className="w-1/3">{t('displayNameLabel')}</TableHead>
                <TableHead className="text-right w-[150px]">{t('actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono text-xs">{role.roleKey}</TableCell>
                  <TableCell className="font-medium">{role.displayName}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingRole(role); setCurrentForm({ roleKey: role.roleKey, displayName: role.displayName }); setIsFormDialogOpen(true);}} className="mr-2" disabled={isMutating || isLoading}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!roleToDelete && roleToDelete.id === role.id} onOpenChange={(isOpen) => !isOpen && setRoleToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteRole(role)} disabled={isMutating || isLoading}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('confirmDeletePrinterRoleDesc', {name: roleToDelete?.displayName || '', key: roleToDelete?.roleKey || ''})}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setRoleToDelete(null)} disabled={isMutating}>{t('cancelButton')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteRole} disabled={isMutating} className="bg-destructive hover:bg-destructive/90">
                            {isMutating ? t('deletingButton') : t('deleteButton')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">{t('noPrinterRolesFound')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
