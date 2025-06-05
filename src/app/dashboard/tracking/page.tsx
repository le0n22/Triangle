
'use client';

import { useState } from 'react';
import type { ExternalOrder, ExternalOrderStatus } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackingOrderCard } from '@/components/features/order-tracking/tracking-order-card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, ListOrdered, Truck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockExternalOrders: ExternalOrder[] = [
  {
    id: 'ext-ord-1',
    platform: 'Trendyol GO',
    platformOrderId: 'TG-12345',
    customerName: 'Ayşe Yılmaz',
    customerAddress: 'Elm St. 123, Istanbul',
    customerPhoneNumber: '555-123-4567',
    items: [
      { id: 'item-a', name: 'Margherita Pizza', quantity: 1, unitPrice: 15.00, totalPrice: 15.00, notes: "Extra crispy" },
      { id: 'item-b', name: 'Coca-Cola', quantity: 2, unitPrice: 3.00, totalPrice: 6.00 },
    ],
    subtotal: 21.00,
    deliveryFee: 3.00,
    totalAmount: 24.00,
    status: 'PENDING_CONFIRMATION',
    placedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    notes: 'Please ring the bell twice.',
  },
  {
    id: 'ext-ord-2',
    platform: 'Yemeksepeti',
    platformOrderId: 'YS-67890',
    customerName: 'Mehmet Öztürk',
    customerAddress: 'Oak Ave. 45, Ankara',
    items: [
      { id: 'item-c', name: 'Grilled Salmon', quantity: 1, unitPrice: 22.00, totalPrice: 22.00 },
      { id: 'item-d', name: 'Garlic Bread', quantity: 1, unitPrice: 6.50, totalPrice: 6.50 },
    ],
    subtotal: 28.50,
    deliveryFee: 2.50,
    totalAmount: 31.00,
    status: 'PREPARING',
    placedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  },
  {
    id: 'ext-ord-3',
    platform: 'Migros Yemek',
    platformOrderId: 'MY-10112',
    customerName: 'Zeynep Kaya',
    customerAddress: 'Pine Rd. 7, Izmir',
    items: [
      { id: 'item-e', name: 'Chicken Pasta', quantity: 2, unitPrice: 18.50, totalPrice: 37.00 },
    ],
    subtotal: 37.00,
    deliveryFee: 0.00,
    totalAmount: 37.00,
    status: 'ON_THE_WAY',
    estimatedDeliveryTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    placedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
  },
  {
    id: 'ext-ord-4',
    platform: 'Trendyol GO',
    platformOrderId: 'TG-12377',
    customerName: 'Ali Veli',
    customerAddress: 'Maple St. 90, Bursa',
    items: [
      { id: 'item-f', name: 'Spring Rolls', quantity: 3, unitPrice: 8.99, totalPrice: 26.97 },
    ],
    subtotal: 26.97,
    deliveryFee: 3.00,
    totalAmount: 29.97,
    status: 'DELIVERED',
    placedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
];

const platforms = ['Trendyol GO', 'Yemeksepeti', 'Migros Yemek'];

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<ExternalOrder[]>(mockExternalOrders);
  const [activeTab, setActiveTab] = useState<string>('all-orders');

  const handleUpdateStatus = (orderId: string, newStatus: ExternalOrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // In a real app, this would also call an API to update the platform
    console.log(`Order ${orderId} status updated to ${newStatus} on platform ${orders.find(o=>o.id === orderId)?.platform}`);
  };

  const refreshOrders = () => {
    // Simulate fetching new orders or refreshing current ones
    console.log('Refreshing orders...');
    // For now, just re-set mock data or potentially shuffle/add new ones
    setOrders([...mockExternalOrders.sort(() => Math.random() - 0.5)]); // Example refresh
  };
  
  const filteredOrders = activeTab === 'all-orders' 
    ? orders 
    : orders.filter(order => order.platform.toLowerCase().replace(' ', '-') === activeTab);

  return (
    <div className="container mx-auto py-6 px-2 md:px-4 h-[calc(100vh-var(--header-height,4rem))] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <Truck className="w-8 h-8 mr-3 text-primary" />
          Order Tracking System
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" onClick={refreshOrders}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all-orders" className="flex-grow flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
          <TabsTrigger value="all-orders">
            <ListOrdered className="mr-2 h-4 w-4" /> All Orders
          </TabsTrigger>
          {platforms.map(platform => (
            <TabsTrigger key={platform.toLowerCase().replace(' ', '-')} value={platform.toLowerCase().replace(' ', '-')}>
              {/* Consider adding platform icons here later */}
              {platform}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-grow pr-1 -mr-1"> {/* For scrolling order cards */}
          <TabsContent value="all-orders" className="mt-0">
            {filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map(order => (
                  <TrackingOrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">No orders to display for "All Orders".</p>
            )}
          </TabsContent>

          {platforms.map(platform => (
            <TabsContent key={platform.toLowerCase().replace(' ', '-')} value={platform.toLowerCase().replace(' ', '-')} className="mt-0">
              {filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map(order => (
                    <TrackingOrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">No orders to display for {platform}.</p>
              )}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
