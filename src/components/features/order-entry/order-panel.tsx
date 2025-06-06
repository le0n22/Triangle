
'use client';

import type { MenuCategory, MenuItem, Order, OrderItem, Modifier, OrderStatus } from '@/types';
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
  type OrderItemInput
} from '@backend/actions/orderActions';
import type { AppOrder } from '@backend/actions/orderActions'; // Import AppOrder for backend response type
import { Prisma } from '@prisma/client'; // For Prisma.JsonNull

interface OrderPanelProps {
  tableIdParam: string; 
  initialOrder: Order | null;
  menuCategories: MenuCategory[];
}

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


export function OrderPanel({ tableIdParam, initialOrder, menuCategories }: OrderPanelProps) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [editingOrderItem, setEditingOrderItem] = useState<OrderItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    console.log("OrderPanel useEffect: initialOrder changed or tableIdParam changed.");
    console.log("Current initialOrder:", initialOrder);
    console.log("Current tableIdParam:", tableIdParam);

    if (initialOrder) {
      console.log("Setting currentOrder from initialOrder:", initialOrder);
      setCurrentOrder(initialOrder);
    } else if (tableIdParam) {
      console.log("initialOrder is null, creating new temp order for tableIdParam:", tableIdParam);
      const tableNumberMatch = tableIdParam.match(/\d+/);
      const tableNumber = tableNumberMatch ? parseInt(tableNumberMatch[0], 10) : 0;
      console.log("Parsed table number:", tableNumber);
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
    } else {
      console.log("Both initialOrder and tableIdParam are null/undefined. Setting currentOrder to null.");
      setCurrentOrder(null);
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
                 JSON.stringify(item.selectedModifiers.map(m=>m.id).sort()) === JSON.stringify(selectedModifiers.map(m=>m.id).sort()) && 
                 !item.specialRequests 
    );

    let updatedItems;
    let itemToPotentiallyOpenModalFor: OrderItem | undefined;

    if (existingItemIndex > -1 && selectedModifiers.length === 0 && !menuItem.availableModifiers?.length) { 
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
      updatedItems = currentOrder.items.filter(item => item.id !== orderItemId);
    } else {
      updatedItems = currentOrder.items.map(item =>
        item.id === orderItemId ? { ...item, quantity: newQuantity, totalPrice: calculateOrderItemTotal({...item, quantity: newQuantity}) } : item
      );
    }
    updateOrderAndRecalculate(updatedItems);
  };

  const handleRemoveItem = (orderItemId: string) => {
    if (!currentOrder) return;
    const updatedItems = currentOrder.items.filter(item => item.id !== orderItemId);
    updateOrderAndRecalculate(updatedItems);
    toast({ title: "Item removed from order.", variant: "destructive" });
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

  const handleConfirmOrder = async () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      toast({ title: "Cannot confirm empty order", variant: "destructive" });
      return;
    }
    setIsSaving(true);

    // Ensure selectedModifiers is Prisma.JsonValue or an array of plain objects
    const orderItemsInput: OrderItemInput[] = currentOrder.items.map(item => ({
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      // selectedModifiers should be an array of plain objects for Prisma JSON
      selectedModifiers: item.selectedModifiers.map(m => ({ id: m.id, name: m.name, priceChange: m.priceChange })) as unknown as Prisma.JsonArray,
      specialRequests: item.specialRequests,
      totalPrice: item.totalPrice,
    }));

    try {
      let result: AppOrder | { error: string };
      if (currentOrder.id.startsWith('temp-ord-')) { 
        const createOrderData: CreateOrderInput = {
          tableId: currentOrder.tableId,
          items: orderItemsInput,
          subtotal: currentOrder.subtotal,
          taxRate: currentOrder.taxRate,
          taxAmount: currentOrder.taxAmount,
          totalAmount: currentOrder.totalAmount,
        };
        console.log("Creating new order with data:", JSON.stringify(createOrderData, null, 2));
        result = await createOrderAction(createOrderData);
      } else { 
        console.log(`Updating existing order ${currentOrder.id} with items:`, JSON.stringify(orderItemsInput, null, 2));
        result = await updateOrderItemsAction(currentOrder.id, orderItemsInput, {
          subtotal: currentOrder.subtotal,
          taxAmount: currentOrder.taxAmount,
          totalAmount: currentOrder.totalAmount,
        });
      }

      if ('error' in result) {
        toast({ title: "Error Saving Order", description: result.error, variant: "destructive" });
        console.error("Error saving order from backend:", result.error);
      } else {
        setCurrentOrder(result); 
        toast({ title: "Order Saved!", description: "KOT will be generated.", className: "bg-green-600 text-white" });
        router.push(`/dashboard/kot/${result.id}`);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred while saving the order.", variant: "destructive" });
      console.error("Unexpected error in handleConfirmOrder:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToPayment = async () => {
     if (!currentOrder || currentOrder.items.length === 0) {
      toast({ title: "Cannot proceed to payment for empty order", variant: "destructive" });
      return;
    }
    if (currentOrder.id.startsWith('temp-ord-')) {
      toast({ title: "Order Not Saved", description: "Please confirm the order first before proceeding to payment.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (currentOrder.status !== 'DONE' && currentOrder.status !== 'PAID' && currentOrder.status !== 'CANCELLED') {
        const statusUpdateResult = await updateOrderStatusAction(currentOrder.id, 'DONE');
        if ('error' in statusUpdateResult) {
          toast({ title: "Error Updating Status", description: statusUpdateResult.error, variant: "destructive" });
          setIsSaving(false);
          return;
        }
        setCurrentOrder(statusUpdateResult); 
      }
      router.push(`/dashboard/payment/${currentOrder.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred.", variant: "destructive" });
      console.error("Unexpected error in handleGoToPayment:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    setIsSaving(true);
    if (currentOrder.id.startsWith('temp-ord-')) { 
      const tableNumberMatch = tableIdParam.match(/\d+/);
      const tableNumber = tableNumberMatch ? parseInt(tableNumberMatch[0], 10) : 0;
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
      toast({ title: "Order Cleared", description: "The unsaved order has been cleared." });
    } else { 
      const result = await updateOrderStatusAction(currentOrder.id, 'CANCELLED');
      if ('error' in result) {
        toast({ title: "Error Cancelling Order", description: result.error, variant: "destructive" });
      } else {
        setCurrentOrder(result);
        toast({ title: "Order Cancelled", description: `Order ${result.id.substring(0,8)} has been cancelled.`, variant: "destructive" });
        router.push('/dashboard/tables'); 
      }
    }
    setIsSaving(false);
  };


  if (!currentOrder && tableIdParam) { 
    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem))] md:flex-row bg-background text-foreground items-center justify-center">
            <p>Loading order data...</p>
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
