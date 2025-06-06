
'use client';

import type { MenuCategory, MenuItem, Order, OrderItem, Modifier } from '@/types';
import { MenuItemSelector } from './menu-item-selector';
import { CurrentOrderSummary } from './current-order-summary';
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
  type AppOrder
} from '@backend/actions/orderActions';
import { Prisma } from '@prisma/client';

interface OrderPanelProps {
  tableIdParam: string; 
  initialOrder: Order | null;
  menuCategories: MenuCategory[];
}

// Helper to compare modifier arrays by their IDs and count
const areModifierArraysEqual = (arr1: Modifier[], arr2: Modifier[]): boolean => {
  if (!arr1 && !arr2) return true; // Both null/undefined
  if (!arr1 || !arr2) return false; // One is null/undefined
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
  n: string; // menuItemName
  q: number; // quantity (current quantity)
  oq?: number; // oldQuantity (if changed)
  m?: string[]; // selectedModifiers (formatted string list)
  s?: string; // specialRequests
  st: 'new' | 'modified' | 'deleted'; // status of the item in delta
}


export function OrderPanel({ tableIdParam, initialOrder, menuCategories }: OrderPanelProps) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [initialOrderSnapshot, setInitialOrderSnapshot] = useState<Order | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [editingOrderItem, setEditingOrderItem] = useState<OrderItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    console.log("OrderPanel useEffect: initialOrder or tableIdParam changed.");
    console.log("Current initialOrder:", initialOrder ? `ID: ${initialOrder.id}, Items: ${initialOrder.items.length}` : 'null');
    console.log("Current tableIdParam:", tableIdParam);

    if (initialOrder) {
      console.log("Setting currentOrder from initialOrder:", initialOrder);
      setCurrentOrder(initialOrder);
      setInitialOrderSnapshot(JSON.parse(JSON.stringify(initialOrder))); 
    } else if (tableIdParam) {
      console.log("initialOrder is null, creating new temp order for tableIdParam:", tableIdParam);
      const tableNumberMatch = tableIdParam.match(/\d+/);
      let tableNumber = 0;
      if (tableIdParam.startsWith('t') && tableNumberMatch) {
        tableNumber = parseInt(tableNumberMatch[0], 10);
      } else {
         // If tableIdParam is a CUID, we might need to fetch table details.
         // For now, let's assume the OrderPanel is always for a known table whose details
         // would be part of a complete Table object if initialOrder was fetched using it.
         // For this example, we'll default to 0 or parse from a 't<number>' pattern.
         console.warn(`Could not parse table number from tableIdParam: ${tableIdParam} directly. Ensure tableIdParam is a valid table ID if initialOrder is null.`);
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
    if (!currentOrder) {
      console.error("Cannot select item, currentOrder is null.");
      toast({ title: "Error", description: "Order not initialized.", variant: "destructive" });
      return;
    }

    const existingItemIndex = currentOrder.items.findIndex(
      (item) => item.menuItemId === menuItem.id && 
                 areModifierArraysEqual(item.selectedModifiers, selectedModifiers) &&
                 !item.specialRequests // Only merge if no special requests on existing
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
    if (!currentOrder) return;
    let updatedItems;
    if (newQuantity <= 0) {
      // Instead of filtering immediately, mark for deletion or handle based on whether it was persisted
      // For simplicity in delta, we'll allow setting to 0, delta logic will pick it up.
      // If an item was persisted and quantity becomes 0, it's a "delete" in delta.
      // If it was a new item (id starts with 'item-') and quantity becomes 0, it's just removed from currentOrder.
      const itemToUpdate = currentOrder.items.find(item => item.id === orderItemId);
      if (itemToUpdate && itemToUpdate.id.startsWith('item-')) { // New, unpersisted item
        updatedItems = currentOrder.items.filter(item => item.id !== orderItemId);
      } else { // Persisted item, quantity becomes 0
         updatedItems = currentOrder.items.map(item =>
          item.id === orderItemId ? { ...item, quantity: 0, totalPrice: 0 } : item // Keep it with qty 0 to detect for delta
        );
      }
    } else {
      updatedItems = currentOrder.items.map(item =>
        item.id === orderItemId ? { ...item, quantity: newQuantity, totalPrice: calculateOrderItemTotal({...item, quantity: newQuantity}) } : item
      );
    }
    updateOrderAndRecalculate(updatedItems.filter(item => item.quantity > 0 || !item.id.startsWith('item-'))); // Remove client-side items with 0 qty
  };

  const handleRemoveItem = (orderItemId: string) => {
    if (!currentOrder) return;
    const itemToRemove = currentOrder.items.find(i => i.id === orderItemId);
    if (!itemToRemove) return;

    let updatedItems;
    if (itemToRemove.id.startsWith('item-')) { // If it's a new, client-side only item
        updatedItems = currentOrder.items.filter(item => item.id !== orderItemId);
    } else { // If it's a persisted item, mark its quantity as 0 for delta calculation
        updatedItems = currentOrder.items.map(item =>
            item.id === orderItemId ? { ...item, quantity: 0, totalPrice: 0 } : item
        );
    }
    // Filter out client-side items with 0 quantity for the UI, but keep persisted items with 0 quantity for delta.
    updateOrderAndRecalculate(updatedItems.filter(item => item.quantity > 0 || !item.id.startsWith('item-')));
    toast({ title: "Item marked for removal or removed.", variant: "destructive" });
  };

  const handleEditItemModifiers = (itemToEdit: OrderItem) => {
    const menuItemDetails = menuCategories.flatMap(c => c.items).find(mi => mi.id === itemToEdit.menuItemId);
    if (menuItemDetails) {
      setEditingOrderItem({ ...itemToEdit, menuItemName: menuItemDetails.name }); 
      setIsModifierModalOpen(true);
    } else {
      toast({ title: "Error", description: "Could not find menu item details to edit modifiers.", variant: "destructive" });
    }
  };

  const handleApplyModifiers = (appliedModifiers: Modifier[], specialRequests?: string) => {
    if (!currentOrder || !editingOrderItem) return;
    
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
    if (!currentOrder || currentOrder.items.length === 0 && (!initialOrderSnapshot || initialOrderSnapshot.items.every(item => currentOrder.items.find(ci => ci.id === item.id)?.quantity === 0))) {
      const allEffectivelyEmpty = currentOrder.items.every(ci => ci.quantity === 0);
      if(allEffectivelyEmpty) {
        toast({ title: "Cannot confirm empty or fully removed order", variant: "destructive" });
        return;
      }
    }
    setIsSaving(true);

    const deltaItemsForKOT: QueryDeltaItem[] = [];
    if (currentOrder) {
        currentOrder.items.forEach(currentItem => {
            const snapshotItem = initialOrderSnapshot?.items.find(snapItem => snapItem.id === currentItem.id);
            if (!snapshotItem && currentItem.quantity > 0) { // New item
                deltaItemsForKOT.push({
                    n: currentItem.menuItemName,
                    q: currentItem.quantity,
                    m: formatModifiersForKOT(currentItem.selectedModifiers),
                    s: currentItem.specialRequests,
                    st: 'new'
                });
            } else if (snapshotItem && currentItem.quantity === 0 && snapshotItem.quantity > 0) { // Deleted item
                 deltaItemsForKOT.push({
                    n: currentItem.menuItemName,
                    q: 0, // Current quantity is 0
                    oq: snapshotItem.quantity,
                    st: 'deleted'
                });
            } else if (snapshotItem && currentItem.quantity > 0) { // Potentially modified item
                const qtyChanged = currentItem.quantity !== snapshotItem.quantity;
                const modsChanged = !areModifierArraysEqual(currentItem.selectedModifiers, snapshotItem.selectedModifiers);
                const reqsChanged = currentItem.specialRequests !== snapshotItem.specialRequests;
                if (qtyChanged || modsChanged || reqsChanged) {
                    deltaItemsForKOT.push({
                        n: currentItem.menuItemName,
                        q: currentItem.quantity,
                        oq: snapshotItem.quantity,
                        m: formatModifiersForKOT(currentItem.selectedModifiers),
                        s: currentItem.specialRequests,
                        st: 'modified'
                    });
                }
            }
        });
         // Handle items that were in snapshot but completely removed from currentOrder.items (not just qty set to 0)
        initialOrderSnapshot?.items.forEach(snapItem => {
            if (!currentOrder.items.some(currItem => currItem.id === snapItem.id)) {
                deltaItemsForKOT.push({
                    n: snapItem.menuItemName,
                    q: 0,
                    oq: snapItem.quantity,
                    st: 'deleted'
                });
            }
        });
    }

    console.log("--- OrderPanel: Calculated deltaItemsForKOT for KOT page: ---", JSON.stringify(deltaItemsForKOT, null, 2));

    const orderItemsInput: OrderItemInput[] = currentOrder.items
      .filter(item => item.quantity > 0) // Only send items with quantity > 0 to backend
      .map(item => ({
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        selectedModifiers: item.selectedModifiers.map(m => ({ id: m.id, name: m.name, priceChange: m.priceChange })) as unknown as Prisma.JsonArray,
        specialRequests: item.specialRequests,
        totalPrice: item.totalPrice,
    }));
    
    const finalTotals = calculateOrderTotals(currentOrder.items.filter(item => item.quantity > 0), currentOrder.taxRate);

    try {
      let result: AppOrder | { error: string };
      if (currentOrder.id.startsWith('temp-ord-')) { 
        if (orderItemsInput.length === 0) {
          toast({ title: "Cannot create an empty order", variant: "destructive" });
          setIsSaving(false);
          return;
        }
        const createOrderData: CreateOrderInput = {
          tableId: currentOrder.tableId,
          items: orderItemsInput,
          subtotal: finalTotals.subtotal,
          taxRate: finalTotals.taxRate,
          taxAmount: finalTotals.taxAmount,
          totalAmount: finalTotals.totalAmount,
        };
        console.log("--- OrderPanel: Creating new order with data: ---", JSON.stringify(createOrderData, null, 2));
        result = await createOrderAction(createOrderData);
      } else { 
        console.log(`--- OrderPanel: Updating existing order ${currentOrder.id} with items: ---`, JSON.stringify(orderItemsInput, null, 2));
        result = await updateOrderItemsAction(currentOrder.id, orderItemsInput, {
          subtotal: finalTotals.subtotal,
          taxAmount: finalTotals.taxAmount,
          totalAmount: finalTotals.totalAmount,
        });
      }

      if ('error' in result) {
        toast({ title: "Error Saving Order", description: result.error, variant: "destructive" });
        console.error("--- OrderPanel: Error saving order from backend: ---", result.error);
      } else {
        setCurrentOrder(result); 
        setInitialOrderSnapshot(JSON.parse(JSON.stringify(result))); 
        toast({ title: "Order Saved!", description: "KOT will be generated.", className: "bg-green-600 text-white" });
        
        let queryString = '';
        if (deltaItemsForKOT.length > 0) {
            queryString = `?delta=${encodeURIComponent(JSON.stringify(deltaItemsForKOT))}`;
            console.log("--- OrderPanel: Navigating to KOT page with queryString: ---", queryString);
        } else {
            console.log("--- OrderPanel: No delta items, navigating to KOT page without delta query param. ---");
        }
        router.push(`/dashboard/kot/${result.id}${queryString}`);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred while saving the order.", variant: "destructive" });
      console.error("--- OrderPanel: Unexpected error: ---", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToPayment = async () => {
     if (!currentOrder || currentOrder.items.filter(i => i.quantity > 0).length === 0) {
      toast({ title: "Cannot proceed to payment for empty order", variant: "destructive" });
      return;
    }
    if (currentOrder.id.startsWith('temp-ord-')) {
      toast({ title: "Order Not Saved", description: "Please confirm the order first before proceeding to payment.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      let orderForPayment = currentOrder;
      if (currentOrder.status !== 'DONE' && currentOrder.status !== 'PAID' && currentOrder.status !== 'CANCELLED') {
        const statusUpdateResult = await updateOrderStatusAction(currentOrder.id, 'DONE');
        if ('error' in statusUpdateResult) {
          toast({ title: "Error Updating Status", description: statusUpdateResult.error, variant: "destructive" });
          setIsSaving(false);
          return;
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
    if (!currentOrder) return;
    setIsSaving(true);
    if (currentOrder.id.startsWith('temp-ord-')) { 
      const tableNumberMatch = tableIdParam.match(/\d+/);
      let tableNumber = 0;
       if (tableIdParam.startsWith('t') && tableNumberMatch) {
        tableNumber = parseInt(tableNumberMatch[0], 10);
      }
      setCurrentOrder({
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

  if (!currentOrder && tableIdParam) { 
    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem))] md:flex-row bg-background text-foreground items-center justify-center">
            <p>Loading order data for table {tableIdParam}...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem))] md:flex-row bg-background text-foreground">
      <div className="w-full md:w-1/3 lg:w-2/5 xl:w-1/3 h-1/2 md:h-full border-r border-border">
        <MenuItemSelector categories={menuCategories} onSelectItem={handleSelectItem} />
      </div>
      
      <div className="w-full md:w-2/3 lg:w-3/5 xl:w-2/3 h-1/2 md:h-full order-first md:order-none">
        {currentOrder ? (
          <CurrentOrderSummary 
            order={currentOrder}
            initialOrderSnapshot={initialOrderSnapshot}
            onUpdateItemQuantity={handleUpdateItemQuantity}
            onRemoveItem={handleRemoveItem}
            onEditItemModifiers={handleEditItemModifiers}
            onConfirmOrder={handleConfirmOrder}
            onGoToPayment={handleGoToPayment}
            onCancelOrder={handleCancelOrder} 
            isSaving={isSaving}
          />
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-4">
            <p>Loading order information or select a table...</p>
          </div>
        )}
      </div>

      {editingOrderItem && menuCategories.flatMap(c => c.items).find(mi => mi.id === editingOrderItem.menuItemId) && (
        <ModifierModal
          isOpen={isModifierModalOpen}
          onClose={() => { setIsModifierModalOpen(false); setEditingOrderItem(null); }}
          menuItem={menuCategories.flatMap(c => c.items).find(mi => mi.id === editingOrderItem.menuItemId)!}
          currentSelectedOrderItem={editingOrderItem} 
          onApplyModifiers={handleApplyModifiers}
        />
      )}
    </div>
  );
}
