
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ExternalOrder } from '@/types';
import { OrderListPanel } from '@/components/features/order-tracking/horizontal/order-list-panel';
import { OrderDetailPanel } from '@/components/features/order-tracking/horizontal/order-detail-panel';
import {
  TrendyolIcon,
  YemeksepetiIcon,
  GetirIcon,
} from '@/components/features/order-tracking/horizontal/platform-icons';
import { format, parseISO } from 'date-fns';

// Enhanced mock data for horizontal view
const initialMockExternalOrders: ExternalOrder[] = [
  {
    id: 'ext-hord-1', platform: 'Trendyol GO', platformOrderId: 'TG-12345', customerName: 'Emre A.',
    customerAddress: 'Eski İstanbul Cd. Kent Konut 5 Sit. 2. Blk. Daire: 9 İzmit/Kocaeli', customerPhoneNumber: '0532 633 25 80',
    items: [{ id: 'item-a1', name: 'Margherita Pizza', quantity: 1, unitPrice: 150.00, totalPrice: 150.00 }],
    subtotal: 150.00, deliveryFee: 6.00, totalAmount: 156.00, status: 'PREPARING',
    placedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), paymentServiceType: 'Nakit - Paket Servis', platformIcon: TrendyolIcon,
    notes: "Ruffles yoksa Doritos peynirli olabilir."
  },
  {
    id: 'ext-hord-2', platform: 'Trendyol GO', platformOrderId: 'TG-67890', customerName: 'Oğuzhan A.',
    customerAddress: 'Elm St. 123, Istanbul', customerPhoneNumber: '555-123-4567',
    items: [
        { id: 'item-b1', name: "Kinder Chocolate 4'lü 50gr", quantity: 2, unitPrice: 15.50, totalPrice: 31.00 },
        { id: 'item-b2', name: "Ruffles Originals Süper", quantity: 1, unitPrice: 16.50, totalPrice: 16.50 },
        { id: 'item-b3', name: "Oreo Bisküvi 220gr", quantity: 1, unitPrice: 36.00, totalPrice: 36.00 },
        { id: 'item-b4', name: "Haribo Altın Ayıcık Maxi", quantity: 2, unitPrice: 20.90, totalPrice: 41.80 },
    ],
    subtotal: 110.30, deliveryFee: 15.00, totalAmount: 125.30, status: 'PENDING_CONFIRMATION',
    placedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), paymentServiceType: 'Kart - Paket Servis', platformIcon: TrendyolIcon,
    notes: "Ruffles yoksa Doritos peynirli olabilir."
  },
  {
    id: 'ext-hord-3', platform: 'Yemeksepeti', platformOrderId: 'YS-10112', customerName: 'Fatih D.',
    customerAddress: 'Oak Ave. 45, Ankara', customerPhoneNumber: '555-987-6543',
    items: [{ id: 'item-c1', name: 'Chicken Wings Bucket', quantity: 1, unitPrice: 260.00, totalPrice: 260.00 }],
    subtotal: 260.00, deliveryFee: 7.00, totalAmount: 267.00, status: 'PREPARING',
    placedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), paymentServiceType: 'Nakit - Paket Servis', platformIcon: YemeksepetiIcon,
  },
  {
    id: 'ext-hord-4', platform: 'Yemeksepeti', platformOrderId: 'YS-13145', customerName: 'Özgür U.',
    customerAddress: 'Maple Rd. 78, Bursa', customerPhoneNumber: '555-111-2233',
    items: [{ id: 'item-d1', name: 'Large Pepperoni Pizza', quantity: 1, unitPrice: 150.00, totalPrice: 150.00 }],
    subtotal: 150.00, deliveryFee: 10.00, totalAmount: 160.00, status: 'PREPARING',
    placedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), paymentServiceType: 'Nakit - Paket Servis', platformIcon: YemeksepetiIcon,
  },
  {
    id: 'ext-hord-5', platform: 'Yemeksepeti', platformOrderId: 'YS-16178', customerName: 'Halil Y.',
    customerAddress: 'Pine Ln. 12, Izmir', customerPhoneNumber: '555-444-5566',
    items: [{ id: 'item-e1', name: 'Family Meal Deal', quantity: 1, unitPrice: 90.00, totalPrice: 90.00 }],
    subtotal: 90.00, deliveryFee: 0.00, totalAmount: 90.00, status: 'CANCELLED_BY_RESTAURANT',
    placedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), paymentServiceType: 'Ticket - Paket Servis', platformIcon: YemeksepetiIcon,
  },
  {
    id: 'ext-hord-6', platform: 'Getir', platformOrderId: 'GT-19201', customerName: 'Hülya A.',
    customerAddress: 'Birch St. 34, Adana', customerPhoneNumber: '555-777-8899',
    items: [{ id: 'item-f1', name: 'Vegan Burger Combo', quantity: 1, unitPrice: 40.00, totalPrice: 40.00 }],
    subtotal: 40.00, deliveryFee: 6.00, totalAmount: 46.00, status: 'PREPARING',
    placedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), paymentServiceType: 'Kart - Paket Servis', platformIcon: GetirIcon,
  },
   {
    id: 'ext-hord-7', platform: 'Trendyol GO', platformOrderId: 'TG-22234', customerName: 'Enes Y.',
    customerAddress: 'Willow Ave. 56, Antalya', customerPhoneNumber: '555-234-5678',
    items: [{ id: 'item-g1', name: 'Coca-Cola 1L', quantity: 2, unitPrice: 10.00, totalPrice: 20.00 }],
    subtotal: 20.00, deliveryFee: 5.00, totalAmount: 25.00, status: 'PREPARING',
    placedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), paymentServiceType: 'Kart - Paket Servis', platformIcon: TrendyolIcon,
  },
  {
    id: 'ext-hord-8', platform: 'Trendyol GO', platformOrderId: 'TG-001', customerName: 'Delivered Order User',
    customerAddress: 'Past St. 1, Old City', customerPhoneNumber: '555-000-0000',
    items: [{ id: 'item-h1', name: 'History Item', quantity: 1, unitPrice: 50.00, totalPrice: 50.00 }],
    subtotal: 50.00, deliveryFee: 5.00, totalAmount: 55.00, status: 'DELIVERED',
    placedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(), paymentServiceType: 'Card - Delivery', platformIcon: TrendyolIcon,
  }
].map(order => ({...order, shortCode: `${format(parseISO(order.placedAt), 'HH:mm')} ${order.platformOrderId.slice(-3)}`}));


export default function HorizontalTrackingPage() {
  const [orders, setOrders] = useState<ExternalOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeList, setActiveList] = useState<'incoming' | 'outgoing'>('incoming');

  useEffect(() => {
    const sortedOrders = initialMockExternalOrders.sort((a, b) => parseISO(b.placedAt).getTime() - parseISO(a.placedAt).getTime());
    setOrders(sortedOrders);
    if (sortedOrders.length > 0) {
      const firstActiveOrder = sortedOrders.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED_BY_RESTAURANT' && o.status !== 'CANCELLED_BY_USER');
      setSelectedOrderId(firstActiveOrder?.id || sortedOrders[0].id);
    }
  }, []);


  const selectedOrder = useMemo(() => {
    return orders.find(order => order.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const { incomingOrders, outgoingOrders } = useMemo(() => {
    const incoming: ExternalOrder[] = [];
    const outgoing: ExternalOrder[] = [];
    orders.forEach(order => {
      if (order.status === 'DELIVERED' || order.status === 'CANCELLED_BY_RESTAURANT' || order.status === 'CANCELLED_BY_USER') {
        outgoing.push(order);
      } else {
        incoming.push(order);
      }
    });
    return { incomingOrders: incoming, outgoingOrders: outgoing };
  }, [orders]);

  const ordersToDisplay = activeList === 'incoming' ? incomingOrders : outgoingOrders;
  
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Main Content Area - now directly lays out the columns */}
      {/* Removed p-4, applying specific padding: pt-0 to move content up, px-4 and pb-4 for side/bottom spacing */}
      <main className="flex-1 flex flex-row gap-4 pt-0 px-4 pb-4 overflow-hidden">
        {/* Left Panel Wrapper */}
        <div className="w-2/5 min-w-[360px] max-w-[500px] flex flex-col min-h-0"> {/* min-h-0 allows shrinking */}
          <OrderListPanel
            orders={ordersToDisplay}
            selectedOrderId={selectedOrderId}
            onSelectOrder={handleSelectOrder}
            activeList={activeList}
            onListChange={setActiveList}
            incomingCount={incomingOrders.length}
            outgoingCount={outgoingOrders.length}
          />
        </div>
        {/* Right Panel Wrapper */}
        <div className="flex-grow flex flex-col min-h-0"> {/* flex-grow takes remaining width, min-h-0 allows shrinking */}
          <OrderDetailPanel order={selectedOrder} />
        </div>
      </main>
    </div>
  );
}
    