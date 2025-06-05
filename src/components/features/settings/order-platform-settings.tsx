
'use client';

import { useState } from 'react';
import type { DeliveryPlatform } from '@/types';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, Link2 } from 'lucide-react';
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

interface OrderPlatformSettingsProps {
  initialPlatforms: DeliveryPlatform[];
}

export function OrderPlatformSettings({ initialPlatforms }: OrderPlatformSettingsProps) {
  const [platforms, setPlatforms] = useState<DeliveryPlatform[]>(initialPlatforms.sort((a,b) => a.name.localeCompare(b.name)));
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<DeliveryPlatform | null>(null);
  const [platformToDelete, setPlatformToDelete] = useState<DeliveryPlatform | null>(null);

  const initialFormState: Omit<DeliveryPlatform, 'id'> = { name: '', apiKey: '', apiSecret: '', isEnabled: true };
  const [currentForm, setCurrentForm] = useState(initialFormState);
  
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEnabledChange = (checked: boolean) => {
    setCurrentForm(prev => ({ ...prev, isEnabled: checked }));
  };

  const resetAndCloseDialog = () => {
    setEditingPlatform(null);
    setCurrentForm(initialFormState);
    setIsFormDialogOpen(false);
  };

  const handleSubmitPlatform = () => {
    if (!currentForm.name) {
      toast({ title: 'Error', description: 'Platform name is required.', variant: 'destructive' });
      return;
    }

    if (editingPlatform) { // Update existing platform
      const updatedPlatform: DeliveryPlatform = { ...editingPlatform, ...currentForm };
      setPlatforms(prev => prev.map(p => p.id === editingPlatform.id ? updatedPlatform : p).sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: 'Platform Updated', description: `Platform "${updatedPlatform.name}" has been updated.` });
    } else { // Add new platform
      const newPlatform: DeliveryPlatform = {
        id: `dp-${Date.now()}`,
        ...currentForm
      };
      setPlatforms(prev => [...prev, newPlatform].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: 'Platform Added', description: `Platform "${newPlatform.name}" has been added.` });
    }
    resetAndCloseDialog();
  };
  
  const openEditDialog = (platform: DeliveryPlatform) => {
    setEditingPlatform(platform);
    setCurrentForm({ 
      name: platform.name, 
      apiKey: platform.apiKey, 
      apiSecret: platform.apiSecret, 
      isEnabled: platform.isEnabled 
    });
    setIsFormDialogOpen(true);
  };

  const confirmDeletePlatform = (platform: DeliveryPlatform) => {
    setPlatformToDelete(platform);
  };

  const handleDeletePlatform = () => {
    if (!platformToDelete) return;
    setPlatforms(prev => prev.filter(p => p.id !== platformToDelete.id));
    toast({ title: 'Platform Deleted', description: `Platform "${platformToDelete.name}" has been deleted.` });
    setPlatformToDelete(null);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline flex items-center"><Link2 className="mr-2 h-5 w-5 text-primary"/>Order Platform Integrations</CardTitle>
          <CardDescription>Manage API settings for your delivery platforms.</CardDescription>
        </div>
        <Button onClick={() => { setEditingPlatform(null); setCurrentForm(initialFormState); setIsFormDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Platform
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your integrated delivery platforms.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Platform Name</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead className="text-center">Enabled</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platforms.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell className="font-medium">{platform.name}</TableCell>
                <TableCell className="font-mono text-xs">{platform.apiKey ? `${platform.apiKey.substring(0,10)}...` : 'Not Set'}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={platform.isEnabled ? 'default' : 'outline'} className={platform.isEnabled ? 'bg-green-500/80 text-white' : ''}>
                    {platform.isEnabled ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => openEditDialog(platform)} className="mr-2">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={!!platformToDelete && platformToDelete.id === platform.id} onOpenChange={(isOpen) => !isOpen && setPlatformToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => confirmDeletePlatform(platform)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the platform "{platformToDelete?.name}" and its configuration.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPlatformToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlatform} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
             {platforms.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">No platforms configured.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => !isOpen && resetAndCloseDialog()}>
        <DialogContent className="sm:max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>{editingPlatform ? 'Edit' : 'Add New'} Delivery Platform</DialogTitle>
            <DialogDescription>
              {editingPlatform ? `Update details for ${editingPlatform.name}.` : 'Enter details for the new platform integration.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input id="platformName" name="name" value={currentForm.name} onChange={handleInputChange} placeholder="e.g., Trendyol GO" />
            </div>
             <div className="space-y-1">
              <Label htmlFor="apiKey">API Key</Label>
              <Input id="apiKey" name="apiKey" value={currentForm.apiKey} onChange={handleInputChange} placeholder="Enter API Key" />
            </div>
             <div className="space-y-1">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input id="apiSecret" name="apiSecret" type="password" value={currentForm.apiSecret} onChange={handleInputChange} placeholder="Enter API Secret" />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Switch id="isEnabled" checked={currentForm.isEnabled} onCheckedChange={handleEnabledChange} />
              <Label htmlFor="isEnabled">Enable this platform integration</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAndCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmitPlatform} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {editingPlatform ? 'Save Changes' : 'Add Platform'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
