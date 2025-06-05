
'use client';

import type { ExternalOrder } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HorizontalOrderListItem } from './order-list-item';
import { Filter, PlusCircle } from 'lucide-react';
import type { SVGProps } from 'react';

interface OrderListPanelProps {
  orders: ExternalOrder[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  activeList: 'incoming' | 'outgoing';
  onListChange: (list: 'incoming' | 'outgoing') => void;
  incomingCount: number;
  outgoingCount: number;
  totalIncomingAmount: number;
}

export function OrderListPanel({
  orders,
  selectedOrderId,
  onSelectOrder,
  activeList,
  onListChange,
  incomingCount,
  outgoingCount,
  totalIncomingAmount,
}: OrderListPanelProps) {

  const handleNewOrder = () => {
    console.log("New Order button clicked");
    // Placeholder for new order functionality
  };

  return (
    <div className="h-full flex flex-col bg-card text-card-foreground shadow-lg rounded-l-lg">
      <div className="p-4 border-b border-border shrink-0">
        <Tabs value={activeList} onValueChange={(value) => onListChange(value as 'incoming' | 'outgoing')} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-2 w-auto">
              <TabsTrigger value="incoming">Gelen Siparişler ({incomingCount})</TabsTrigger>
              <TabsTrigger value="outgoing">Giden Siparişler ({outgoingCount})</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Filter className="h-5 w-5" />
              <span className="sr-only">Filter orders</span>
            </Button>
          </div>
        </Tabs>
      </div>

      <ScrollArea className="flex-grow min-h-0">
        {orders.length > 0 ? (
          orders.map((order) => (
            <HorizontalOrderListItem
              key={order.id}
              order={order}
              isSelected={order.id === selectedOrderId}
              onSelect={() => onSelectOrder(order.id)}
            />
          ))
        ) : (
          <p className="p-6 text-center text-muted-foreground">
            No {activeList === 'incoming' ? 'incoming' : 'outgoing'} orders.
          </p>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-border bg-accent/80 text-accent-foreground flex justify-between items-center rounded-bl-lg shrink-0">
        <Button
          onClick={handleNewOrder}
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> YENİ SİPARİŞ
        </Button>
        <div className="text-right">
          <span className="text-xs block opacity-90">TOPLAM</span>
          <span className="font-bold text-lg">₺{totalIncomingAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
