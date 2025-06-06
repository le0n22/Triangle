
'use server';

import prisma from '@backend/lib/prisma';
import { Prisma } from '@prisma/client'; // Correct: Value import for Prisma namespace
import type { 
  Order as PrismaOrder, 
  OrderItem as PrismaOrderItem, 
  Table as PrismaTable,
  OrderStatus as PrismaOrderStatus,
  Modifier as PrismaModifier // Ensure Modifier is imported if used for typing selectedModifiers
} from '@prisma/client';
import { updateTableOrderDetailsAction } from './tableActions';

// Frontend-facing types
export interface AppOrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  selectedModifiers: { id: string; name: string; priceChange: number }[]; // Changed from Prisma.JsonValue to specific type
  specialRequests?: string | null;
  totalPrice: number;
}

export interface AppOrder {
  id: string;
  tableId: string;
  tableNumber: number;
  items: AppOrderItem[];
  status: Lowercase<PrismaOrderStatus>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Input types for creating/updating orders
export interface OrderItemInput {
  menuItemId: string;
  menuItemName: string; 
  quantity: number;
  unitPrice: number;    
  selectedModifiers: Prisma.JsonValue; // Keep as JsonValue for Prisma create/update
  specialRequests?: string;
  totalPrice: number; 
}

export interface CreateOrderInput {
  tableId: string;
  items: OrderItemInput[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

// Helper to safely parse selectedModifiers from JSON
function parseSelectedModifiers(jsonData: Prisma.JsonValue): { id: string; name: string; priceChange: number }[] {
  if (Array.isArray(jsonData)) {
    return jsonData.map(mod => {
      if (typeof mod === 'object' && mod !== null && 'id' in mod && 'name' in mod && 'priceChange' in mod) {
        return {
          id: String(mod.id),
          name: String(mod.name),
          priceChange: typeof mod.priceChange === 'number' ? mod.priceChange : parseFloat(String(mod.priceChange)) || 0,
        };
      }
      return { id: 'unknown', name: 'Unknown Modifier', priceChange: 0 }; // Fallback for malformed data
    }).filter(mod => mod.id !== 'unknown'); // Filter out malformed ones
  }
  return [];
}


function mapPrismaOrderItemToAppOrderItem(item: PrismaOrderItem): AppOrderItem {
  return {
    id: item.id,
    menuItemId: item.menuItemId,
    menuItemName: item.menuItemName,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toNumber(),
    selectedModifiers: parseSelectedModifiers(item.selectedModifiers), // Use helper for safe parsing
    specialRequests: item.specialRequests,
    totalPrice: item.totalPrice.toNumber(),
  };
}

function mapPrismaOrderToAppOrder(order: PrismaOrder & { items: PrismaOrderItem[], table: PrismaTable }): AppOrder {
  return {
    id: order.id,
    tableId: order.tableId,
    tableNumber: order.table.number,
    items: order.items.map(mapPrismaOrderItemToAppOrderItem),
    status: order.status.toLowerCase() as Lowercase<PrismaOrderStatus>,
    subtotal: order.subtotal.toNumber(),
    taxRate: order.taxRate.toNumber(),
    taxAmount: order.taxAmount.toNumber(),
    totalAmount: order.totalAmount.toNumber(),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function createOrderAction(input: CreateOrderInput): Promise<AppOrder | { error: string }> {
  try {
    const { tableId, items, subtotal, taxRate, taxAmount, totalAmount } = input;

    if (!tableId || items.length === 0) {
      return { error: 'Table ID and at least one item are required to create an order.' };
    }

    const tableExists = await prisma.table.findUnique({ where: { id: tableId }});
    if (!tableExists) {
        return { error: `Table with ID ${tableId} not found.`};
    }
     if (tableExists.status === 'RESERVED' || tableExists.status === 'DIRTY') {
        return { error: `Cannot create order for table ${tableExists.number} because it is ${tableExists.status.toLowerCase()}.` };
    }

    const newOrder = await prisma.order.create({
      data: {
        table: { connect: { id: tableId } },
        items: {
          create: items.map(item => ({
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            selectedModifiers: item.selectedModifiers || Prisma.JsonNull,
            specialRequests: item.specialRequests,
            totalPrice: new Prisma.Decimal(item.totalPrice),
          })),
        },
        status: 'OPEN',
        subtotal: new Prisma.Decimal(subtotal),
        taxRate: new Prisma.Decimal(taxRate),
        taxAmount: new Prisma.Decimal(taxAmount),
        totalAmount: new Prisma.Decimal(totalAmount),
      },
      include: {
        items: true,
        table: true,
      },
    });

    await updateTableOrderDetailsAction(tableId, newOrder.id, totalAmount);

    return mapPrismaOrderToAppOrder(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { 
             return { error: 'Failed to create order. Related record (e.g., table or menu item) not found.' };
        }
    }
    if (error instanceof ReferenceError && error.message.includes("Prisma is not defined")) {
        return { error: 'Internal server error: Prisma namespace not available.' };
    }
    const typedError = error as Error;
    return { error: `Failed to create order. ${typedError.message || 'Please check server logs.'}` };
  }
}

export async function getOpenOrderByTableIdAction(tableId: string): Promise<AppOrder | null | { error: string }> {
  try {
    const tableExists = await prisma.table.findUnique({ where: { id: tableId }});
    if (!tableExists) {
        return { error: `Table with ID ${tableId} not found.`};
    }

    const openOrder = await prisma.order.findFirst({
      where: {
        tableId: tableId,
        NOT: {
          status: {
            in: ['PAID', 'CANCELLED'],
          },
        },
      },
      include: {
        items: true,
        table: true,
      },
      orderBy: {
        updatedAt: 'desc', 
      },
    });

    if (!openOrder) {
      return null;
    }
    return mapPrismaOrderToAppOrder(openOrder);
  } catch (error) {
    console.error(`Error fetching open order for table ${tableId}:`, error);
    if (error instanceof ReferenceError && error.message.includes("Prisma is not defined")) {
        return { error: 'Internal server error: Prisma namespace not available.' };
    }
    const typedError = error as Error;
    return { error: `Failed to fetch open order for table ${tableId}. ${typedError.message || ''}` };
  }
}

export async function updateOrderItemsAction(
  orderId: string,
  items: OrderItemInput[],
  totals: { subtotal: number; taxAmount: number; totalAmount: number }
): Promise<AppOrder | { error: string }> {
  try {
    const orderToUpdate = await prisma.order.findUnique({ where: { id: orderId }});
    if (!orderToUpdate) {
        return { error: `Order with ID ${orderId} not found.`};
    }
    if (orderToUpdate.status === 'PAID' || orderToUpdate.status === 'CANCELLED') {
        return { error: `Cannot update items for an order that is already ${orderToUpdate.status.toLowerCase()}.` };
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { orderId: orderId },
      });

      const orderWithNewItems = await tx.order.update({
        where: { id: orderId },
        data: {
          items: {
            create: items.map(item => ({
              menuItemId: item.menuItemId,
              menuItemName: item.menuItemName,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              selectedModifiers: item.selectedModifiers || Prisma.JsonNull,
              specialRequests: item.specialRequests,
              totalPrice: new Prisma.Decimal(item.totalPrice),
            })),
          },
          subtotal: new Prisma.Decimal(totals.subtotal),
          taxAmount: new Prisma.Decimal(totals.taxAmount),
          totalAmount: new Prisma.Decimal(totals.totalAmount),
          updatedAt: new Date(), 
        },
        include: {
          items: true,
          table: true,
        },
      });
      return orderWithNewItems;
    });
    
    await updateTableOrderDetailsAction(updatedOrder.tableId, orderId, totals.totalAmount);

    return mapPrismaOrderToAppOrder(updatedOrder);
  } catch (error) {
    console.error(`Error updating items for order ${orderId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { 
             return { error: 'Failed to update order items. Order or related menu item not found.' };
        }
    }
    if (error instanceof ReferenceError && error.message.includes("Prisma is not defined")) {
        return { error: 'Internal server error: Prisma namespace not available.' };
    }
    const typedError = error as Error;
    return { error: `Failed to update items for order ${orderId}. ${typedError.message || ''}` };
  }
}

export async function updateOrderStatusAction(orderId: string, status: PrismaOrderStatus): Promise<AppOrder | { error: string }> {
  try {
    const orderToUpdate = await prisma.order.findUnique({ where: { id: orderId }});
    if (!orderToUpdate) {
        return { error: `Order with ID ${orderId} not found.`};
    }
     if (orderToUpdate.status === 'PAID' && status !== 'PAID') {
        return { error: `Cannot change status of a paid order.` };
    }
    if (orderToUpdate.status === 'CANCELLED' && status !== 'CANCELLED') {
        return { error: `Cannot change status of a cancelled order.` };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        updatedAt: new Date(), 
      },
      include: {
        items: true,
        table: true,
      },
    });

    if (status === 'PAID' || status === 'CANCELLED') {
      await updateTableOrderDetailsAction(updatedOrder.tableId, null, null);
    } else if (status === 'DONE' || status === 'IN_PROGRESS' || status === 'OPEN') {
      await updateTableOrderDetailsAction(updatedOrder.tableId, updatedOrder.id, updatedOrder.totalAmount.toNumber());
    }

    return mapPrismaOrderToAppOrder(updatedOrder);
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { 
             return { error: 'Failed to update order status. Order not found.' };
        }
    }
    if (error instanceof ReferenceError && error.message.includes("Prisma is not defined")) {
        return { error: 'Internal server error: Prisma namespace not available.' };
    }
    const typedError = error as Error;
    return { error: `Failed to update status for order ${orderId}. ${typedError.message || ''}` };
  }
}
