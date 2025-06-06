
'use client';

import type { MenuCategory, MenuItem, Order, OrderItem, Modifier } from '@/types';
import { MenuItemSelector } from './menu-item-selector';
import { CurrentOrderSummary } from './CurrentOrderSummary'; // PascalCase import
import { OrderActionSidebar } from './OrderActionSidebar'; // PascalCase import
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
import { Loader2 } from 'lucide-react';

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

const testVisibility = true; // H1 etiketinin görünürlüğünü kontrol etmek için

export function OrderPanel({ tableIdParam, initialOrder, menuCategories }: OrderPanelProps) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [initialOrderSnapshot, setInitialOrderSnapshot] = useState<Order | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [editingOrderItem, setEditingOrderItem] = useState<OrderItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
         console.warn(`OrderPanel: Could not parse table number from tableIdParam: ${tableIdParam}.`);
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
    const activeItemsForBackend = currentOrder.items.filter(item => item.quantity > 0);
    if (activeItemsForBackend.length === 0 && (!initialOrderSnapshot || initialOrderSnapshot.items.every(item => currentOrder.items.find(ci => ci.id === item.id)?.quantity === 0))) {
        toast({ title: "Cannot confirm empty or fully removed order", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    const deltaItemsForKOT: QueryDeltaItem[] = [];
    if (currentOrder) {
      currentOrder.items.forEach(currentItem => {
        const snapshotItem = initialOrderSnapshot?.items.find(snapItem => snapItem.id === currentItem.id);
        if (!snapshotItem && currentItem.quantity > 0) {
          deltaItemsForKOT.push({ n: currentItem.menuItemName, q: currentItem.quantity, m: formatModifiersForKOT(currentItem.selectedModifiers), s: currentItem.specialRequests, st: 'new' });
        } else if (snapshotItem && currentItem.quantity === 0 && snapshotItem.quantity > 0) {
          deltaItemsForKOT.push({ n: currentItem.menuItemName, q: 0, oq: snapshotItem.quantity, st: 'deleted' });
        } else if (snapshotItem && currentItem.quantity > 0) {
          const qtyChanged = currentItem.quantity !== snapshotItem.quantity;
          const modsChanged = !areModifierArraysEqual(currentItem.selectedModifiers, snapshotItem.selectedModifiers);
          const reqsChanged = currentItem.specialRequests !== snapshotItem.specialRequests;
          if (qtyChanged || modsChanged || reqsChanged) {
            deltaItemsForKOT.push({ n: currentItem.menuItemName, q: currentItem.quantity, oq: snapshotItem.quantity, m: formatModifiersForKOT(currentItem.selectedModifiers), s: currentItem.specialRequests, st: 'modified' });
          }
        }
      });
      initialOrderSnapshot?.items.forEach(snapItem => {
        if (snapItem.quantity > 0 && !currentOrder.items.some(currItem => currItem.id === snapItem.id && currItem.quantity > 0)) {
          if (!deltaItemsForKOT.some(di => di.n === snapItem.menuItemName && (di.st === 'deleted' || (di.st === 'modified' && di.q === 0)))) {
            deltaItemsForKOT.push({ n: snapItem.menuItemName, q: 0, oq: snapItem.quantity, st: 'deleted' });
          }
        }
      });
    }
    console.log("--- OrderPanel: Calculated deltaItemsForKOT for KOT page: ---", JSON.stringify(deltaItemsForKOT, null, 2));
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
      if (currentOrder.id.startsWith('temp-ord-')) {
        if (orderItemsInput.length === 0) {
          toast({ title: "Cannot create an empty order", variant: "destructive" });
          setIsSaving(false); return;
        }
        const createOrderData: CreateOrderInput = { tableId: currentOrder.tableId, items: orderItemsInput, ...finalTotals };
        result = await createOrderAction(createOrderData);
      } else {
        result = await updateOrderItemsAction(currentOrder.id, orderItemsInput, finalTotals);
      }
      if ('error' in result) {
        toast({ title: "Error Saving Order", description: result.error, variant: "destructive" });
      } else {
        setCurrentOrder(result);
        setInitialOrderSnapshot(JSON.parse(JSON.stringify(result)));
        toast({ title: "Order Saved!", description: "KOT will be generated.", className: "bg-accent text-accent-foreground" });
        let queryString = '';
        if (deltaItemsForKOT.length > 0) {
          queryString = `?delta=${encodeURIComponent(JSON.stringify(deltaItemsForKOT))}`;
        }
        router.push(`/dashboard/kot/${result.id}${queryString}`);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred while saving the order.", variant: "destructive" });
    } finally {
      setIsSaving(false);
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

  const handleBackToTables = () => { if (isSaving) return; router.push('/dashboard/tables'); };
  const handleSplitBill = () => { if (!currentOrder || currentOrder.items.filter(i => i.quantity > 0).length === 0 || isSaving) return; toast({ title: 'Split Bill', description: 'Not Implemented.' }); };
  const handlePrintBill = () => { if (!currentOrder || currentOrder.items.filter(i => i.quantity > 0).length === 0 || isSaving) return; toast({ title: 'Print Bill', description: 'Not Implemented.' }); };
  const handleApplyDiscount = () => { if (!currentOrder || currentOrder.items.filter(i => i.quantity > 0).length === 0 || isSaving) return; toast({ title: 'Apply Discount', description: 'Not Implemented.' }); };
  const handleTransferTable = () => { if (!currentOrder || isSaving) return; toast({ title: 'Transfer Table', description: 'Not Implemented.' }); };


  if (!currentOrder && tableIdParam) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height,4rem))] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading order data for table {tableIdParam}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-var(--header-height,4rem)-2*theme(spacing.6))] bg-background text-foreground relative">
      {testVisibility && (
        <h1 className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white p-2 text-lg z-50 rounded">
          ORDER PANEL TEST VISIBLE - File: order-panel.tsx
        </h1>
      )}
      {/* Left Column: Menu Item Selector */}
      <div className="w-full md:w-1/3 lg:w-2/5 xl:w-1/3 h-1/2 md:h-full border-r border-border">
        <MenuItemSelector
          categories={menuCategories}
          onSelectItem={handleSelectItem}
          isSaving={isSaving}
        />
      </div>

      {/* Middle Column: Current Order Summary */}
      <div className="w-full md:flex-grow h-1/2 md:h-full">
        {currentOrder ? (
          <CurrentOrderSummary
            order={currentOrder}
            initialOrderSnapshot={initialOrderSnapshot}
            onUpdateItemQuantity={handleUpdateItemQuantity}
            onRemoveItem={handleRemoveItem}
            onEditItemModifiers={handleEditItemModifiers}
            isSaving={isSaving}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground p-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mr-3" />
            Loading order...
          </div>
        )}
      </div>

      {/* Right Column: Action Sidebar */}
      <div className="w-full md:w-56 lg:w-60 md:flex-none h-auto md:h-full order-last md:order-none">
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
    
    
