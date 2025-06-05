'use client';

import type { MenuCategory, MenuItem, Order, OrderItem, Modifier } from '@/types';
import { MenuItemSelector } from './menu-item-selector';
import { CurrentOrderSummary } from './current-order-summary';
import { SmartUpsellSuggestions } from './smart-upsell-suggestions';
import { ModifierModal } from './modifier-modal';
import { Button } from '@/components/ui/button';
import { Printer, CreditCard, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // For navigation
import Link from 'next/link';

interface OrderPanelProps {
  tableId: string;
  initialOrder: Order | null; // Could be an existing order for the table
  menuCategories: MenuCategory[]; // Full menu
}

// Helper to calculate item total price
const calculateOrderItemTotal = (item: Omit<OrderItem, 'id' | 'totalPrice'>): number => {
  const modifiersPrice = item.selectedModifiers.reduce((sum, mod) => sum + mod.priceChange, 0);
  return item.quantity * (item.unitPrice + modifiersPrice);
};

// Helper to calculate order totals
const calculateOrderTotals = (items: OrderItem[]): Pick<Order, 'subtotal' | 'taxAmount' | 'totalAmount'> => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.08; // Example tax rate (8%)
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

  useEffect(() => {
    if (!currentOrder && tableId) { // If no initial order, create a new one for the table
      setCurrentOrder({
        id: `ord-${Date.now()}`, // Temporary ID
        tableId: tableId,
        tableNumber: parseInt(tableId.replace('t',''), 10) || 0, // Assuming tableId is like 't1', 't2'
        items: [],
        status: 'pending',
        subtotal: 0,
        taxRate: 0.08, // Example tax rate
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
      (item) => item.menuItemId === menuItem.id && JSON.stringify(item.selectedModifiers) === JSON.stringify(selectedModifiers) && !item.specialRequests // Simplified check
    );

    let updatedItems;
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
        selectedModifiers: selectedModifiers,
        specialRequests: '', // Can be added later
      };
      const newOrderItem: OrderItem = {
        ...newOrderItemBase,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Unique ID for order item
        totalPrice: calculateOrderItemTotal(newOrderItemBase),
      };
      updatedItems = [...currentOrder.items, newOrderItem];
    }
    updateOrderAndRecalculate(updatedItems);
    toast({ title: `${menuItem.name} added to order.` });

    // If item has modifiers and none were pre-selected, open modal
    if (menuItem.availableModifiers && menuItem.availableModifiers.length > 0 && selectedModifiers.length === 0) {
        const justAddedItem = updatedItems.find(i => i.menuItemId === menuItem.id && i.quantity === 1 && JSON.stringify(i.selectedModifiers) === JSON.stringify(selectedModifiers) ); 
        if (justAddedItem) {
             handleEditItemModifiers(justAddedItem);
        }
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
    const menuItem = menuCategories.flatMap(c => c.items).find(mi => mi.id === itemToEdit.menuItemId);
    if (menuItem) {
      setEditingOrderItem({ ...itemToEdit, menuItemName: menuItem.name }); 
      setIsModifierModalOpen(true);
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

  const handleAddUpsellItem = (itemName: string) => {
    const foundItem = menuCategories.flatMap(cat => cat.items).find(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (foundItem) {
      handleSelectItem(foundItem);
    } else {
      toast({ title: "Upsell item not found", description: `Could not find "${itemName}" in the menu.`, variant: "destructive" });
    }
  };

  const handleConfirmOrder = () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      toast({ title: "Cannot confirm empty order", variant: "destructive" });
      return;
    }
    // In a real app: save order to backend, then navigate
    console.log("Order Confirmed:", currentOrder);
    toast({ title: "Order Confirmed!", description: "KOT will be generated.", className: "bg-green-600 text-white" });
    router.push(`/dashboard/kot/${currentOrder.id}`);
  };

  const handleGoToPayment = () => {
     if (!currentOrder || currentOrder.items.length === 0) {
      toast({ title: "Cannot proceed to payment for empty order", variant: "destructive" });
      return;
    }
    // In a real app: ensure order is saved/confirmed
    console.log("Proceeding to Payment for order:", currentOrder.id);
    router.push(`/dashboard/payment/${currentOrder.id}`);
  };


  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem))] md:flex-row bg-background text-foreground">
      <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 h-1/2 md:h-full">
        <MenuItemSelector categories={menuCategories} onSelectItem={handleSelectItem} />
      </div>
      
      <div className="w-full md:w-1/3 lg:w-2/4 xl:w-3/5 h-1/2 md:h-full order-first md:order-none">
        <CurrentOrderSummary 
          order={currentOrder}
          onUpdateItemQuantity={handleUpdateItemQuantity}
          onRemoveItem={handleRemoveItem}
          onEditItemModifiers={handleEditItemModifiers}
        />
      </div>

      <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 p-4 space-y-4 bg-card text-card-foreground md:border-l border-border h-auto md:h-full flex flex-col">
        <div className="flex-grow overflow-y-auto">
           <SmartUpsellSuggestions currentOrder={currentOrder} onAddUpsellItem={handleAddUpsellItem} />
        </div>
        <div className="mt-auto space-y-2 pt-4 border-t border-border">
            <Link href="/dashboard/tables" passHref>
                <Button variant="outline" className="w-full">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Tables
                </Button>
            </Link>
            <Button onClick={handleConfirmOrder} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Printer className="mr-2 h-4 w-4" /> Confirm Order & Print KOT
            </Button>
            <Button onClick={handleGoToPayment} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment
            </Button>
        </div>
      </div>

      {editingOrderItem && menuCategories.flatMap(c => c.items).find(mi => mi.id === editingOrderItem.menuItemId) && (
        <ModifierModal
          isOpen={isModifierModalOpen}
          onClose={() => { setIsModifierModalOpen(false); setEditingOrderItem(null); }}
          menuItem={menuCategories.flatMap(c => c.items).find(mi => mi.id === editingOrderItem.menuItemId)!}
          currentSelectedModifiers={editingOrderItem.selectedModifiers}
          onApplyModifiers={handleApplyModifiers}
        />
      )}
    </div>
  );
}
