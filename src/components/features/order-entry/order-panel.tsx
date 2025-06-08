

'use client';

import type { MenuCategory, MenuItem, Order, OrderItem, Modifier } from '@/types';
import { MenuItemSelector } from './menu-item-selector';
import { CurrentOrderSummary } from './CurrentOrderSummary';
import { OrderActionSidebar } from './OrderActionSidebar';
import { ModifierModal } from './modifier-modal';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  createOrderAction,
  updateOrderItemsAction,
  updateOrderStatusAction,
  type CreateOrderInput,
  type OrderItemInput,
  type AppOrder,
} from '@backend/actions/orderActions';
import { Prisma } from '@prisma/client';
import { Loader2, Brain } from 'lucide-react';
import { smartUpselling, type SmartUpsellingInput, type SmartUpsellingOutput } from '@/ai/flows/smart-upselling';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ElectronKotPayload, ElectronKotItem } from '@/types';

interface OrderPanelProps {
  tableIdParam: string;
  initialOrder: Order | null;
  menuCategories: MenuCategory[];
}

const areModifierArraysEqual = (arr1: Modifier[], arr2: Modifier[]): boolean => {
  if (!arr1 && !arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  const ids1 = arr1.map(m => m.id).sort();
  const ids2 = arr2.map(m => m.id).sort();
  return ids1.every((id, index) => id === ids2[index]);
};

const calculateOrderItemTotal = (item: Omit<OrderItem, 'id' | 'totalPrice' | 'menuItemName' | 'menuItemId'> & { unitPrice: number, selectedModifiers: Modifier[], quantity: number }): number => {
  const modifiersPrice = item.selectedModifiers.reduce((sum, mod) => sum + mod.priceChange, 0);
  return item.quantity * (item.unitPrice + modifiersPrice);
};

const calculateOrderTotals = (items: OrderItem[], taxRate: number = 0.08): Pick<Order, 'subtotal' | 'taxAmount' | 'totalAmount' | 'taxRate'> => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  return { subtotal, taxRate, taxAmount, totalAmount };
};

interface QueryDeltaItem {
  n: string;
  q: number;
  oq?: number;
  m?: string[];
  s?: string;
  st: 'new' | 'modified' | 'deleted';
}


export function OrderPanel({ tableIdParam, initialOrder, menuCategories }: OrderPanelProps) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [initialOrderSnapshot, setInitialOrderSnapshot] = useState<Order | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [editingOrderItem, setEditingOrderItem] = useState<OrderItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [upsellSuggestions, setUpsellSuggestions] = useState<string[]>([]);
  const [isFetchingUpsells, setIsFetchingUpsells] = useState(false);
  const [upsellError, setUpsellError] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (initialOrder) {
      setCurrentOrder(initialOrder);
      setInitialOrderSnapshot(JSON.parse(JSON.stringify(initialOrder)));
    } else if (tableIdParam) {
      const tableNumberMatch = tableIdParam.match(/\d+/);
      let tableNumber = 0;
      if (tableIdParam.startsWith('t') && tableNumberMatch) {
        tableNumber = parseInt(tableNumberMatch[0], 10);
      } else {
         console.warn(`OrderPanel: Could not parse table number from tableIdParam: ${tableIdParam}. Defaulting to 0.`);
      }
      const newTempOrder: Order = {
        id: `temp-ord-${Date.now()}`,
        tableId: tableIdParam,
        tableNumber: tableNumber,
        items: [],
        status: 'OPEN',
        subtotal: 0,
        taxRate: 0.08,
        taxAmount: 0,
        totalAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentOrder(newTempOrder);
      setInitialOrderSnapshot(null);
    } else {
        setCurrentOrder(null);
        setInitialOrderSnapshot(null);
    }
  }, [initialOrder, tableIdParam]);

  const updateOrderAndRecalculate = useCallback((updatedItems: OrderItem[]) => {
    setCurrentOrder(prevOrder => {
      if (!prevOrder) return null;
      const totals = calculateOrderTotals(updatedItems, prevOrder.taxRate);
      return {
        ...prevOrder,
        items: updatedItems,
        ...totals,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleSelectItem = (menuItem: MenuItem, selectedModifiers: Modifier[] = []) => {
    if (!currentOrder || currentOrder.status === 'PAID' || currentOrder.status === 'CANCELLED' || isSaving) return;

    const existingItemIndex = currentOrder.items.findIndex(
      (item) => item.menuItemId === menuItem.id &&
                 areModifierArraysEqual(item.selectedModifiers, selectedModifiers) &&
                 !item.specialRequests
    );

    let updatedItems;
    let itemToPotentiallyOpenModalFor: OrderItem | undefined;

    if (existingItemIndex > -1 && selectedModifiers.length === 0 && (!menuItem.availableModifiers || menuItem.availableModifiers.length === 0)) {
      updatedItems = currentOrder.items.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + 1;
          return { ...item, quantity: newQuantity, totalPrice: calculateOrderItemTotal({...item, quantity: newQuantity}) };
        }
        return item;
      });
    } else {
      const newOrderItemBase = {
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: 1,
        unitPrice: menuItem.price,
        selectedModifiers: selectedModifiers,
        specialRequests: '',
      };
      const newOrderItem: OrderItem = {
        ...newOrderItemBase,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        totalPrice: calculateOrderItemTotal(newOrderItemBase),
      };
      updatedItems = [...currentOrder.items, newOrderItem];
      itemToPotentiallyOpenModalFor = newOrderItem;
    }

    updateOrderAndRecalculate(updatedItems);
    toast({ title: `${menuItem.name} added to order.` });

    if (itemToPotentiallyOpenModalFor && menuItem.availableModifiers && menuItem.availableModifiers.length > 0) {
        handleEditItemModifiers(itemToPotentiallyOpenModalFor);
    }
  };

  const handleUpdateItemQuantity = (orderItemId: string, newQuantity: number) => {
    if (!currentOrder || currentOrder.status === 'PAID' || currentOrder.status === 'CANCELLED' || isSaving) return;

    let updatedItems;
    if (newQuantity <= 0) {
      const itemToUpdate = currentOrder.items.find(item => item.id === orderItemId);
      if (itemToUpdate && itemToUpdate.id.startsWith('item-')) {
        updatedItems = currentOrder.items.filter(item => item.id !== orderItemId);
      } else {
         updatedItems = currentOrder.items.map(item =>
          item.id === orderItemId ? { ...item, quantity: 0, totalPrice: 0 } : item
        );
      }
    } else {
      updatedItems = currentOrder.items.map(item =>
        item.id === orderItemId ? { ...item, quantity: newQuantity, totalPrice: calculateOrderItemTotal({...item, quantity: newQuantity}) } : item
      );
    }
    updateOrderAndRecalculate(updatedItems.filter(item => item.quantity > 0 || !item.id.startsWith('item-')));
  };

  const handleRemoveItem = (orderItemId: string) => {
    if (!currentOrder || currentOrder.status === 'PAID' || currentOrder.status === 'CANCELLED' || isSaving) return;
    const itemToRemove = currentOrder.items.find(i => i.id === orderItemId);
    if (!itemToRemove) return;

    let updatedItems;
    if (itemToRemove.id.startsWith('item-')) {
        updatedItems = currentOrder.items.filter(item => item.id !== orderItemId);
    } else {
        updatedItems = currentOrder.items.map(item =>
            item.id === orderItemId ? { ...item, quantity: 0, totalPrice: 0 } : item
        );
    }
    updateOrderAndRecalculate(updatedItems.filter(item => item.quantity > 0 || !item.id.startsWith('item-')));
    toast({ title: "Item marked for removal or removed.", variant: "destructive" });
  };

  const handleEditItemModifiers = (itemToEdit: OrderItem) => {
    if (currentOrder?.status === 'PAID' || currentOrder?.status === 'CANCELLED' || isSaving) return;
    const menuItemDetails = menuCategories.flatMap(c => c.items).find(mi => mi.id === itemToEdit.menuItemId);
    if (menuItemDetails) {
      setEditingOrderItem({ ...itemToEdit, menuItemName: menuItemDetails.name });
      setIsModifierModalOpen(true);
    } else {
      toast({ title: "Error", description: "Could not find menu item details to edit modifiers.", variant: "destructive" });
    }
  };

  const handleApplyModifiers = (appliedModifiers: Modifier[], specialRequests?: string) => {
    if (!currentOrder || !editingOrderItem || isSaving) return;

    const updatedItems = currentOrder.items.map(item => {
      if (item.id === editingOrderItem.id) {
        const updatedItemBase = { ...item, selectedModifiers: appliedModifiers, specialRequests: specialRequests || item.specialRequests };
        return { ...updatedItemBase, totalPrice: calculateOrderItemTotal(updatedItemBase) };
      }
      return item;
    });
    updateOrderAndRecalculate(updatedItems);
    setEditingOrderItem(null);
    setIsModifierModalOpen(false);
    toast({ title: "Modifiers updated." });
  };

  const formatModifiersForKOT = (modifiers: Modifier[]): string[] => {
    if (!modifiers || modifiers.length === 0) return [];
    return modifiers.map(m => `${m.name}${m.priceChange !== 0 ? ` (${m.priceChange > 0 ? '+' : '-'}$${Math.abs(m.priceChange).toFixed(2)})` : ''}`);
  };
  
  const handleConfirmOrder = async () => {
    if (!currentOrder || isSaving) return;
    console.log("--- OrderPanel: handleConfirmOrder START ---");

    const activeItemsForBackend = currentOrder.items.filter(item => item.quantity > 0);
    const allItemsMarkedForRemoval = currentOrder.items.every(item => item.quantity === 0);

    if (activeItemsForBackend.length === 0 && allItemsMarkedForRemoval && !currentOrder.id.startsWith('temp-ord-')) {
        toast({ title: "Cannot confirm order", description: "No active items in the order to confirm. All items were marked for removal.", variant: "destructive" });
        console.log("--- OrderPanel: Confirm order aborted - all items marked for removal on a persisted order. ---");
        return;
    }
     if (activeItemsForBackend.length === 0 && currentOrder.id.startsWith('temp-ord-')) {
        toast({ title: "Cannot confirm empty order", description: "Add items to the order first.", variant: "destructive" });
        console.log("--- OrderPanel: Confirm order aborted - empty temporary order. ---");
        return;
    }

    setIsSaving(true);
    const deltaItemsForKOTPageDisplay: QueryDeltaItem[] = [];
    const deltaForKotPrinting: ElectronKotItem[] = [];

    currentOrder.items.forEach(currentItem => {
      const snapshotItem = initialOrderSnapshot?.items.find(snapItem => snapItem.id === currentItem.id);
      const isNewItem = !snapshotItem && currentItem.id.startsWith('item-');

      if (isNewItem && currentItem.quantity > 0) {
        deltaItemsForKOTPageDisplay.push({ n: currentItem.menuItemName, q: currentItem.quantity, m: formatModifiersForKOT(currentItem.selectedModifiers), s: currentItem.specialRequests, st: 'new' });
        deltaForKotPrinting.push({ name: `(NEW) ${currentItem.menuItemName}`, quantity: currentItem.quantity, modifiers: formatModifiersForKOT(currentItem.selectedModifiers), specialRequests: currentItem.specialRequests });
      } else if (snapshotItem) {
        const qtyChanged = currentItem.quantity !== snapshotItem.quantity;
        const modsChanged = !areModifierArraysEqual(currentItem.selectedModifiers, snapshotItem.selectedModifiers);
        const reqsChanged = currentItem.specialRequests !== snapshotItem.specialRequests;

        if (currentItem.quantity === 0 && snapshotItem.quantity > 0) {
          deltaItemsForKOTPageDisplay.push({ n: currentItem.menuItemName, q: 0, oq: snapshotItem.quantity, st: 'deleted' });
        } else if (currentItem.quantity > 0 && (qtyChanged || modsChanged || reqsChanged)) {
          let modifiedPrefix = "(MODIFIED) ";
          if(qtyChanged) modifiedPrefix = `(MOD ${snapshotItem.quantity} -> ${currentItem.quantity}) `;
          
          deltaItemsForKOTPageDisplay.push({ n: currentItem.menuItemName, q: currentItem.quantity, oq: snapshotItem.quantity, m: formatModifiersForKOT(currentItem.selectedModifiers), s: currentItem.specialRequests, st: 'modified' });
          deltaForKotPrinting.push({ name: `${modifiedPrefix}${currentItem.menuItemName}`, quantity: currentItem.quantity, modifiers: formatModifiersForKOT(currentItem.selectedModifiers), specialRequests: currentItem.specialRequests });
        }
      }
    });
    initialOrderSnapshot?.items.forEach(snapItem => {
        if (snapItem.id.startsWith('item-') && !currentOrder.items.some(ci => ci.id === snapItem.id) && snapItem.quantity > 0) {
            if (!deltaItemsForKOTPageDisplay.some(di => di.n === snapItem.menuItemName && di.st === 'deleted')) {
                 deltaItemsForKOTPageDisplay.push({ n: snapItem.menuItemName, q: 0, oq: snapItem.quantity, st: 'deleted' });
            }
        }
    });

    console.log("--- OrderPanel: Calculated deltaForKotPrinting for actual KOT: ---", JSON.stringify(deltaForKotPrinting, null, 2));
    console.log("--- OrderPanel: Calculated deltaItemsForKOTPageDisplay for KOT page display: ---", JSON.stringify(deltaItemsForKOTPageDisplay, null, 2));

    const orderItemsInput: OrderItemInput[] = activeItemsForBackend.map(item => ({
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      selectedModifiers: item.selectedModifiers.map(m => ({ id: m.id, name: m.name, priceChange: m.priceChange })) as unknown as Prisma.JsonArray,
      specialRequests: item.specialRequests,
      totalPrice: item.totalPrice,
    }));

    const finalTotals = calculateOrderTotals(activeItemsForBackend, currentOrder.taxRate);

    try {
      let result: AppOrder | { error: string };
      console.log("--- OrderPanel: Saving order to backend... ---");
      if (currentOrder.id.startsWith('temp-ord-')) {
        const createOrderData: CreateOrderInput = { tableId: currentOrder.tableId, items: orderItemsInput, ...finalTotals };
        result = await createOrderAction(createOrderData);
      } else {
        result = await updateOrderItemsAction(currentOrder.id, orderItemsInput, finalTotals);
      }
      console.log("--- OrderPanel: Backend save result: ---", result);

      if ('error' in result) {
        toast({ title: "Error Saving Order", description: result.error, variant: "destructive" });
      } else {
        const savedOrder = result;
        setCurrentOrder(savedOrder);
        setInitialOrderSnapshot(JSON.parse(JSON.stringify(savedOrder)));
        
        if (deltaForKotPrinting.length > 0) {
            console.log("--- OrderPanel: Order saved successfully. Preparing KOTs based on delta. ---");
            const kotsByRole = new Map<string, ElectronKotItem[]>();
            
            for (const deltaItem of deltaForKotPrinting) {
                // Find the original menu item details (which now includes defaultPrinterRole object)
                const originalMenuItemDetails = menuCategories
                    .flatMap(cat => cat.items)
                    .find(mi => mi.name === deltaItem.name.replace(/^\((NEW|MODIFIED|MOD \d+ -> \d+)\)\s*/, ''));

                let itemPrinterRoleKey: string = 'NO_ROLE_DEFINED';

                if (originalMenuItemDetails) {
                    // Priority 1: Menu item's own default printer role
                    if (originalMenuItemDetails.defaultPrinterRole?.roleKey) {
                        itemPrinterRoleKey = originalMenuItemDetails.defaultPrinterRole.roleKey;
                    } else {
                        // Priority 2: Category's default printer role
                        const categoryOfItem = menuCategories.find(cat => cat.id === originalMenuItemDetails.categoryId);
                        if (categoryOfItem?.defaultPrinterRole?.roleKey) {
                            itemPrinterRoleKey = categoryOfItem.defaultPrinterRole.roleKey;
                        }
                    }
                }
                console.log(`--- OrderPanel: KOT Item "${deltaItem.name}" assigned to printer role key: ${itemPrinterRoleKey} ---`);
                            
                if (!kotsByRole.has(itemPrinterRoleKey)) {
                    kotsByRole.set(itemPrinterRoleKey, []);
                }
                kotsByRole.get(itemPrinterRoleKey)?.push(deltaItem);
            }

            const kotsToSendToElectron: ElectronKotPayload[] = [];
            kotsByRole.forEach((items, roleKey) => {
                if (items.length > 0) {
                    kotsToSendToElectron.push({
                        printerRole: roleKey, // This is now the roleKey string
                        orderId: savedOrder.id,
                        tableNumber: savedOrder.tableNumber,
                        items: items,
                        timestamp: new Date().toISOString(),
                    });
                }
            });
            
            const printServerUrlFromStorage = localStorage.getItem('orderflow-print-server-url');
            const printServerUrl = printServerUrlFromStorage || 'http://localhost:3001/print-kot';

            if (kotsToSendToElectron.length > 0) {
              console.log("--- OrderPanel: KOTs Prepared for Electron App ---", kotsToSendToElectron);
              for (const kotPayload of kotsToSendToElectron) {
                 console.log(`--- OrderPanel: Preparing to send KOT for Role: ${kotPayload.printerRole} to ${printServerUrl}. ---`);
                toast({ title: `Sending KOT for ${kotPayload.printerRole}`, description: `Order ${savedOrder.id.substring(0,6)}... Table ${savedOrder.tableNumber}` });
                try {
                  const response = await fetch(printServerUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(kotPayload),
                  });
                  const responseBody = await response.text();
                  console.log(`--- OrderPanel: Print Server Response for ${kotPayload.printerRole} KOT: Status ${response.status}, Body: ${responseBody.substring(0, 200)}... ---`);
                  if (response.ok) {
                    toast({ title: `KOT Sent: ${kotPayload.printerRole}`, description: `Order ${savedOrder.id.substring(0,6)}... sent. Resp: ${responseBody.substring(0,50)}...`, className: "bg-accent text-accent-foreground" });
                  } else {
                    toast({ title: `KOT Send Error: ${kotPayload.printerRole}`, description: `Server at ${printServerUrl} resp: ${response.status}. Body: ${responseBody.substring(0, 100)}...`, variant: "destructive", duration: 7000 });
                  }
                } catch (fetchError: any) {
                  console.error(`--- OrderPanel: Failed to send KOT for ${kotPayload.printerRole} to ${printServerUrl}: ---`, fetchError);
                  toast({ title: `KOT Send Failed: ${kotPayload.printerRole}`, description: `Network error: ${fetchError.message}. Is print server at ${printServerUrl} OK? See console.`, variant: "destructive", duration: 7000 });
                }
              }
            } else {
              toast({ title: "Order Saved", description: "No new or modified items to print for KOT.", className: "bg-accent text-accent-foreground"});
            }
        } else {
             toast({ title: "Order Saved", description: "No new or modified items to print for KOT.", className: "bg-accent text-accent-foreground"});
        }

        let queryString = '';
        if (deltaItemsForKOTPageDisplay.length > 0) {
          queryString = `?delta=${encodeURIComponent(JSON.stringify(deltaItemsForKOTPageDisplay))}`;
        }
        console.log(`--- OrderPanel: Redirecting to KOT page: /dashboard/kot/${savedOrder.id}${queryString} ---`);
        router.push(`/dashboard/kot/${savedOrder.id}${queryString}`);
      }
    } catch (e: any) {
      console.error("--- OrderPanel: CRITICAL ERROR in handleConfirmOrder: ---", e);
      toast({ title: "Error", description: e.message || "An unexpected error occurred while saving the order.", variant: "destructive" });
    } finally {
      setIsSaving(false);
      console.log("--- OrderPanel: handleConfirmOrder END ---");
    }
  };

  const handleGoToPayment = async () => {
    if (!currentOrder || isSaving || currentOrder.items.filter(i => i.quantity > 0).length === 0) {
      toast({ title: "Cannot proceed to payment for empty order", variant: "destructive" }); return;
    }
    if (currentOrder.id.startsWith('temp-ord-')) {
      toast({ title: "Order Not Saved", description: "Please confirm the order first before proceeding to payment.", variant: "destructive" }); return;
    }
    setIsSaving(true);
    try {
      let orderForPayment = currentOrder;
      if (currentOrder.status !== 'DONE' && currentOrder.status !== 'PAID' && currentOrder.status !== 'CANCELLED') {
        const statusUpdateResult = await updateOrderStatusAction(currentOrder.id, 'DONE');
        if ('error' in statusUpdateResult) {
          toast({ title: "Error Updating Status", description: statusUpdateResult.error, variant: "destructive" });
          setIsSaving(false); return;
        }
        setCurrentOrder(statusUpdateResult); 
        setInitialOrderSnapshot(JSON.parse(JSON.stringify(statusUpdateResult))); 
        orderForPayment = statusUpdateResult;
      }
      router.push(`/dashboard/payment/${orderForPayment.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder || isSaving) return;
    setIsSaving(true);
    if (currentOrder.id.startsWith('temp-ord-')) {
      const tableNumberMatch = tableIdParam.match(/\d+/);
      let tableNumber = 0;
       if (tableIdParam.startsWith('t') && tableNumberMatch) tableNumber = parseInt(tableNumberMatch[0], 10);
      setCurrentOrder({
        id: `temp-ord-${Date.now()}`, tableId: tableIdParam, tableNumber: tableNumber, items: [],
        status: 'OPEN', subtotal: 0, taxRate: 0.08, taxAmount: 0, totalAmount: 0,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      setInitialOrderSnapshot(null);
      toast({ title: "Order Cleared", description: "The unsaved order has been cleared." });
    } else {
      const result = await updateOrderStatusAction(currentOrder.id, 'CANCELLED');
      if ('error' in result) {
        toast({ title: "Error Cancelling Order", description: result.error, variant: "destructive" });
      } else {
        setCurrentOrder(result);
        setInitialOrderSnapshot(JSON.parse(JSON.stringify(result)));
        toast({ title: "Order Cancelled", description: `Order ${result.id.substring(0,8)} has been cancelled.`, variant: "destructive" });
        router.push('/dashboard/tables');
      }
    }
    setIsSaving(false);
  };

  const handleFetchUpsells = async () => {
    if (!currentOrder || currentOrder.items.length === 0 || isFetchingUpsells) return;
    setIsFetchingUpsells(true);
    setUpsellError(null);
    try {
      const orderString = currentOrder.items
        .filter(item => item.quantity > 0)
        .map(item => `${item.quantity}x ${item.menuItemName}`)
        .join(', ');

      if (!orderString) {
        setUpsellSuggestions([]);
        setIsFetchingUpsells(false);
        return;
      }

      const input: SmartUpsellingInput = { currentOrder: orderString };
      const result: SmartUpsellingOutput = await smartUpselling(input);
      setUpsellSuggestions(result.upsellSuggestions || []);
    } catch (error: any) {
      console.error("Error fetching upsell suggestions:", error);
      setUpsellError(error.message || "Failed to get suggestions.");
      toast({ title: "Upsell Error", description: error.message || "Could not fetch smart suggestions.", variant: "destructive" });
      setUpsellSuggestions([]);
    } finally {
      setIsFetchingUpsells(false);
    }
  };

  const handleAddUpsellItem = (suggestion: string) => {
    if (isSaving) return;
    const suggestedItemName = suggestion.split('(')[0].trim();
    const menuItem = menuCategories.flatMap(c => c.items).find(mi => mi.name.toLowerCase() === suggestedItemName.toLowerCase());
    if (menuItem) {
      handleSelectItem(menuItem);
    } else {
      toast({ title: "Item Not Found", description: `"${suggestedItemName}" could not be found in the menu.`, variant: "destructive" });
    }
  };

  const handleBackToTables = () => { if (isSaving) return; router.push('/dashboard/tables'); };
  const handleSplitBill = () => { if (!currentOrder || currentOrder.items.filter(i => i.quantity > 0).length === 0 || isSaving) return; toast({ title: 'Split Bill', description: 'This feature is not yet implemented.' }); };
  const handlePrintBill = () => { if (!currentOrder || currentOrder.items.filter(i => i.quantity > 0).length === 0 || isSaving) return; toast({ title: 'Print Bill', description: 'This feature is not yet implemented.' }); };
  const handleApplyDiscount = () => { if (!currentOrder || currentOrder.items.filter(i => i.quantity > 0).length === 0 || isSaving) return; toast({ title: 'Apply Discount', description: 'This feature is not yet implemented.' }); };
  const handleTransferTable = () => { if (!currentOrder || isSaving) return; toast({ title: 'Transfer Table', description: 'This feature is not yet implemented.' }); };

  if (!currentOrder && tableIdParam) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height,4rem))] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading order data for table {tableIdParam}...</p>
      </div>
    );
  }

  const noItemsInOrder = !currentOrder || currentOrder.items.filter(item => item.quantity > 0).length === 0;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-var(--header-height,4rem)-2*theme(spacing.6))] bg-background text-foreground relative">
      <div className="w-full md:w-9/12 h-1/2 md:h-full border-r border-border">
        <MenuItemSelector
          categories={menuCategories}
          onSelectItem={handleSelectItem}
          isSaving={isSaving}
        />
      </div>

      <div className="w-full md:flex-grow h-1/2 md:h-full flex flex-col">
        {currentOrder ? (
          <>
            <div className="flex-grow min-h-0">
              <CurrentOrderSummary
                order={currentOrder}
                initialOrderSnapshot={initialOrderSnapshot}
                onUpdateItemQuantity={handleUpdateItemQuantity}
                onRemoveItem={handleRemoveItem}
                onEditItemModifiers={handleEditItemModifiers}
                isSaving={isSaving}
              />
            </div>
            <div className="p-3 border-t border-border shrink-0 bg-card">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Smart Upsell Suggestions
                </h4>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleFetchUpsells} 
                  disabled={isFetchingUpsells || noItemsInOrder || (currentOrder?.status === 'PAID' || currentOrder?.status === 'CANCELLED')}
                >
                  {isFetchingUpsells ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Suggestions"}
                </Button>
              </div>
              {upsellError && <p className="text-xs text-destructive">{upsellError}</p>}
              {!isFetchingUpsells && !upsellError && upsellSuggestions.length > 0 && (
                <ScrollArea className="h-20">
                  <div className="flex flex-wrap gap-1.5">
                    {upsellSuggestions.map((suggestion, index) => (
                      <Button 
                        key={index} 
                        size="xs" 
                        variant="ghost" 
                        className="bg-accent/20 hover:bg-accent/40 text-accent-foreground text-xs h-auto py-1 px-2"
                        onClick={() => handleAddUpsellItem(suggestion)}
                        disabled={isSaving || (currentOrder?.status === 'PAID' || currentOrder?.status === 'CANCELLED')}
                      >
                        + {suggestion}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {!isFetchingUpsells && !upsellError && upsellSuggestions.length === 0 && !noItemsInOrder && (
                <p className="text-xs text-muted-foreground text-center py-2">No suggestions available or already fetched.</p>
              )}
              {noItemsInOrder && (
                 <p className="text-xs text-muted-foreground text-center py-2">Add items to the order to get suggestions.</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground p-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mr-3" />
            Loading order...
          </div>
        )}
      </div>

      <div className="w-full md:w-28 md:flex-none h-auto md:h-full order-last md:order-none">
         <OrderActionSidebar
            order={currentOrder}
            isSaving={isSaving}
            onSplitBill={handleSplitBill}
            onPrintBill={handlePrintBill}
            onApplyDiscount={handleApplyDiscount}
            onTransferTable={handleTransferTable}
            onCancelOrder={handleCancelOrder}
            onBackToTables={handleBackToTables}
            onConfirmOrder={handleConfirmOrder}
            onGoToPayment={handleGoToPayment}
          />
      </div>

      {editingOrderItem && menuCategories.flatMap(c => c.items).find(mi => mi.id === editingOrderItem.menuItemId) && (
        <ModifierModal
          isOpen={isModifierModalOpen}
          onClose={() => { setIsModifierModalOpen(false); setEditingOrderItem(null); }}
          menuItem={menuCategories.flatMap(c => c.items).find(mi => mi.id === editingOrderItem.menuItemId)!}
          currentSelectedOrderItem={editingOrderItem}
          onApplyModifiers={handleApplyModifiers}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

    