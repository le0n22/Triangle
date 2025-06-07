
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PrinterConfiguration, PrinterConnectionType, PrinterRole } from '@/types';
import { printerConnectionTypes, printerRoles } from '@/types'; // Import arrays for mapping

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription, DialogTrigger, DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, RefreshCw, Printer as PrinterIconLucide } from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';

import {
  getAllPrinterConfigurationsAction,
  createPrinterConfigurationAction,
  updatePrinterConfigurationAction,
  deletePrinterConfigurationAction,
} from '../../../../backend/actions/printerActions';


export function PrinterSettings() {
  const [printers, setPrinters] = useState<PrinterConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfiguration | null>(null);
  const [printerToDelete, setPrinterToDelete] = useState<PrinterConfiguration | null>(null);

  const { toast } = useToast();
  const { t } = useLanguage();

  const initialFormState = {
    name: '',
    connectionType: 'NETWORK' as PrinterConnectionType,
    connectionInfo: '',
    roles: [] as PrinterRole[],
  };
  const [currentForm, setCurrentForm] = useState(initialFormState);

  const fetchPrinters = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAllPrinterConfigurationsAction();
      if ('error' in result) {
        toast({ title: t('error'), description: result.error, variant: 'destructive' });
        setPrinters([]);
      } else {
        setPrinters(result.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to fetch printer configurations.', variant: 'destructive' });
      setPrinters([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleConnectionTypeChange = (value: string) => {
    setCurrentForm(prev => ({ ...prev, connectionType: value as PrinterConnectionType }));
  };

  const handleRoleToggle = (role: PrinterRole, checked: boolean | 'indeterminate') => {
    if (checked === 'indeterminate') return; // Should not happen with basic checkbox
    setCurrentForm(prev => {
      const newRoles = checked
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role);
      return { ...prev, roles: newRoles };
    });
  };

  const openAddDialog = () => {
    setEditingPrinter(null);
    setCurrentForm(initialFormState);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (printer: PrinterConfiguration) => {
    setEditingPrinter(printer);
    setCurrentForm({
      name: printer.name,
      connectionType: printer.connectionType,
      connectionInfo: printer.connectionInfo,
      roles: [...printer.roles], 
    });
    setIsFormDialogOpen(true);
  };

  const handleSubmitPrinter = async () => {
    if (!currentForm.name || !currentForm.connectionType || !currentForm.connectionInfo) {
      toast({ title: t('error'), description: 'Name, connection type, and connection info are required.', variant: 'destructive' });
      return;
    }
    if (currentForm.roles.length === 0) {
      toast({ title: t('error'), description: 'At least one role must be selected for the printer.', variant: 'destructive' });
      return;
    }

    setIsMutating(true);
    const formData = {
      name: currentForm.name,
      connectionType: currentForm.connectionType,
      connectionInfo: currentForm.connectionInfo,
      roles: currentForm.roles,
    };

    try {
      let result;
      if (editingPrinter) {
        result = await updatePrinterConfigurationAction(editingPrinter.id, formData);
      } else {
        result = await createPrinterConfigurationAction(formData);
      }

      if ('error' in result) {
        toast({ title: `${editingPrinter ? t('error') : t('error')}`, description: result.error, variant: 'destructive' });
      } else {
        toast({ title: `${editingPrinter ? 'Printer Updated' : 'Printer Added'}`, description: `Printer "${result.name}" has been successfully ${editingPrinter ? 'updated' : 'added'}.` });
        setIsFormDialogOpen(false);
        fetchPrinters();
      }
    } catch (error) {
      toast({ title: t('error'), description: `Could not ${editingPrinter ? 'update' : 'add'} printer.`, variant: 'destructive' });
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDeletePrinter = (printer: PrinterConfiguration) => {
    setPrinterToDelete(printer);
  };

  const handleDeletePrinter = async () => {
    if (!printerToDelete) return;
    setIsMutating(true);
    try {
      const result = await deletePrinterConfigurationAction(printerToDelete.id);
      if (result.success) {
        toast({ title: 'Printer Deleted', description: `Printer "${printerToDelete.name}" has been deleted.` });
        fetchPrinters();
      } else {
        toast({ title: t('error'), description: result.error || 'Failed to delete printer.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: t('error'), description: 'Could not delete printer.', variant: 'destructive' });
    } finally {
      setPrinterToDelete(null);
      setIsMutating(false);
    }
  };

  const getRoleDisplayName = (role: PrinterRole): string => {
    const roleMap: Record<PrinterRole, TranslationKey> = {
      KITCHEN_KOT: 'kitchenKOT',
      BAR_KOT: 'barKOT',
      RECEIPT: 'receiptPrinting',
      REPORT: 'reportPrinting',
    };
    return t(roleMap[role]);
  };
  
  const getConnectionTypeDisplayName = (type: PrinterConnectionType): string => {
    const typeMap: Record<PrinterConnectionType, TranslationKey> = {
      NETWORK: 'network',
      BLUETOOTH: 'bluetooth',
      USB: 'usb',
      OTHER: 'other_connection',
    };
    return t(typeMap[type]);
  }

  const renderFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="printerFormName" className="text-right">{t('printerName')}*</Label>
        <Input id="printerFormName" name="name" value={currentForm.name} onChange={handleInputChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="printerFormConnectionType" className="text-right">{t('connectionType')}*</Label>
        <Select value={currentForm.connectionType} onValueChange={handleConnectionTypeChange}>
          <SelectTrigger id="printerFormConnectionType" className="col-span-3">
            <SelectValue placeholder="Select connection type" />
          </SelectTrigger>
          <SelectContent>
            {printerConnectionTypes.map(type => (
              <SelectItem key={type} value={type}>{getConnectionTypeDisplayName(type)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="printerFormConnectionInfo" className="text-right">{t('connectionInfo')}*</Label>
        <Input id="printerFormConnectionInfo" name="connectionInfo" value={currentForm.connectionInfo} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 192.168.1.100, COM3, My BT Printer"/>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">{t('printerRoles')}*</Label>
        <div className="col-span-3 space-y-2">
          {printerRoles.map(role => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={`role-${role}`}
                checked={currentForm.roles.includes(role)}
                onCheckedChange={(checked) => handleRoleToggle(role, checked)}
              />
              <Label htmlFor={`role-${role}`} className="font-normal">{getRoleDisplayName(role)}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline flex items-center">
            <PrinterIconLucide className="mr-2 h-5 w-5 text-primary" />{t('printers')}
          </CardTitle>
          <CardDescription>Manage printer configurations and their roles.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPrinters} disabled={isLoading || isMutating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading && !isFormDialogOpen ? 'animate-spin' : ''}`} />
            {isLoading && !isFormDialogOpen ? 'Refreshing...' : t('refresh')}
          </Button>
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} disabled={isMutating || isLoading}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Printer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>{editingPrinter ? 'Edit Printer' : 'Add New Printer'}</DialogTitle>
                <DialogDescription>
                  {editingPrinter ? `Update details for "${editingPrinter.name}".` : 'Enter details for the new printer configuration.'}
                </DialogDescription>
              </DialogHeader>
              {renderFormFields()}
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" disabled={isMutating}>Cancel</Button></DialogClose>
                <Button onClick={handleSubmitPrinter} disabled={isMutating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isMutating ? 'Saving...' : (editingPrinter ? 'Save Changes' : 'Add Printer')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && printers.length === 0 ? (
          <div className="text-center py-10">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading printers...</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your configured printers.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t('printerName')}</TableHead>
                <TableHead>{t('connectionType')}</TableHead>
                <TableHead>{t('connectionInfo')}</TableHead>
                <TableHead>{t('printerRoles')}</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printers.map((printer) => (
                <TableRow key={printer.id}>
                  <TableCell className="font-medium">{printer.name}</TableCell>
                  <TableCell>{getConnectionTypeDisplayName(printer.connectionType)}</TableCell>
                  <TableCell>{printer.connectionInfo}</TableCell>
                  <TableCell className="text-xs">{printer.roles.map(getRoleDisplayName).join(', ')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(printer)} className="mr-2" disabled={isMutating || isLoading}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={!!printerToDelete && printerToDelete.id === printer.id} onOpenChange={(isOpen) => !isOpen && setPrinterToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeletePrinter(printer)} disabled={isMutating || isLoading}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete the printer configuration "{printerToDelete?.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setPrinterToDelete(null)} disabled={isMutating}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeletePrinter} disabled={isMutating} className="bg-destructive hover:bg-destructive/90">
                            {isMutating ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && printers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No printers configured. Add one to get started.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
