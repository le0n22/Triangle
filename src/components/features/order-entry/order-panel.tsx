
'use client';

import type { MenuCategory, MenuItem, Order, OrderItem, Modifier } from '@/types';
import { MenuItemSelector } from './menu-item-selector';
import { CurrentOrderSummary } from './current-order-summary';
import { ModifierModal } from './modifier-modal';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface OrderPanelProps {
  tableId: string;
  initialOrder: Order | null;
  menuCategories: MenuCategory[];
}

const calculateOrderItemTotal = (item: Omit<OrderItem, 'id' | 'totalPrice'>): number => {
  const modifiersPrice = item.selectedModifiers.reduce((sum, mod) => sum + mod.priceChange, 0);
  return item.quantity * (item.unitPrice + modifiersPrice);
};

const calculateOrderTotals = (items: OrderItem[]): Pick<Order, 'subtotal' | 'taxAmount' | 'totalAmount'> => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.08;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  return { subtotal, taxAmount, totalAmount };
};


export function OrderPanel({ tableId, initialOrder, menuCategories }: OrderPanelProps) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [editingOrderItem, setEditingOrderItem] = useState<OrderItem | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  console.log(`OrderPanel: Rendered for table ${tableId}. Received menuCategories count: ${menuCategories?.length}`);
  // console.log(`OrderPanel: Received menuCategories DATA:`, JSON.stringify(menuCategories, null, 2));


  useEffect(() => {
    if (!currentOrder && tableId) {
      setCurrentOrder({
        id: `ord-${Date.now()}`,
        tableId: tableId,
        tableNumber: parseInt(tableId.replace('t',''), 10) || 0, 
        items: [],
        status: 'OPEN', // Default to OPEN status
        subtotal: 0,
        taxRate: 0.08, 
        taxAmount: 0,
        totalAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [currentOrder, tableId]);

  const updateOrderAndRecalculate = useCallback((updatedItems: OrderItem[]) => {
    setCurrentOrder(prevOrder => {
      if (!prevOrder) return null;
      const totals = calculateOrderTotals(updatedItems);
      return {
        ...prevOrder,
        items: updatedItems,
        ...totals,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleSelectItem = (menuItem: MenuItem, selectedModifiers: Modifier[] = []) => {
    if (!currentOrder) return;

    const existingItemIndex = currentOrder.items.findIndex(
      (item) => item.menuItemId === menuItem.id && JSON.stringify(item.selectedModifiers) === JSON.stringify(selectedModifiers) && !item.specialRequests 
    );

    let updatedItems;
    let itemToPotentiallyOpenModalFor: OrderItem | undefined;

    if (existingItemIndex > -1) {
      updatedItems = currentOrder.items.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + 1, totalPrice: calculateOrderItemTotal({...item, quantity: item.quantity + 1}) } : item
      );
    } else {
      const newOrderItemBase = {
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: 1,
        unitPrice: menuItem.price,
        selectedModifiers: selectedModifiers, // Start with passed modifiers (usually empty from selector)
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

    // If the item has available modifiers and was just added (or if selectedModifiers were empty initially), open modal.
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

  const handleApplyModifiers = (appliedModifiers: Modifier[]) => {
    if (!currentOrder || !editingOrderItem) return;
    
    const updatedItems = currentOrder.items.map(item => {
      if (item.id === editingOrderItem.id) {
        const updatedItemBase = { ...item, selectedModifiers: appliedModifiers };
        return { ...updatedItemBase, totalPrice: calculateOrderItemTotal(updatedItemBase) };
      }
      return item;
    });
    updateOrderAndRecalculate(updatedItems);
    setEditingOrderItem(null);
    setIsModifierModalOpen(false);
    toast({ title: "Modifiers updated." });
  };

  const handleConfirmOrder = () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      toast({ title: "Cannot confirm empty order", variant: "destructive" });
      return;
    }
    // TODO: Persist order to backend, change status to 'pending_kitchen' or similar
    console.log("Order Confirmed (simulated):", currentOrder);
    toast({ title: "Order Confirmed!", description: "KOT will be generated.", className: "bg-green-600 text-white" });
    router.push(`/dashboard/kot/${currentOrder.id}`); // Pass currentOrder.id (temp or real)
  };

  const handleGoToPayment = () => {
     if (!currentOrder || currentOrder.items.length === 0) {
      toast({ title: "Cannot proceed to payment for empty order", variant: "destructive" });
      return;
    }
    // TODO: Ensure order is confirmed or kitchen status allows payment
    console.log("Proceeding to Payment for order (simulated):", currentOrder.id);
    router.push(`/dashboard/payment/${currentOrder.id}`);
  };


  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem))] md:flex-row bg-background text-foreground">
      <div className="w-full md:w-1/3 lg:w-2/5 xl:w-1/3 h-1/2 md:h-full border-r border-border">
        <MenuItemSelector categories={menuCategories} onSelectItem={handleSelectItem} />
      </div>
      
      <div className="w-full md:w-2/3 lg:w-3/5 xl:w-2/3 h-1/2 md:h-full order-first md:order-none">
        <CurrentOrderSummary 
          order={currentOrder}
          onUpdateItemQuantity={handleUpdateItemQuantity}
          onRemoveItem={handleRemoveItem}
          onEditItemModifiers={handleEditItemModifiers}
          onConfirmOrder={handleConfirmOrder}
          onGoToPayment={handleGoToPayment}
        />
      </div>

      {editingOrderItem && menuCategories.flatMap(c => c.items).find(mi => mi.id === editingOrderItem.menuItemId) && (
        <ModifierModal
          isOpen={isModifierModalOpen}
          onClose={() => { setIsModifierModalOpen(false); setEditingOrderItem(null); }}
          // Ensure menuItem prop passed to ModifierModal has availableModifiers
          menuItem={menuCategories.flatMap(c => c.items).find(mi => mi.id === editingOrderItem.menuItemId)!}
          currentSelectedModifiers={editingOrderItem.selectedModifiers}
          onApplyModifiers={handleApplyModifiers}
        />
      )}
    </div>
  );
}
