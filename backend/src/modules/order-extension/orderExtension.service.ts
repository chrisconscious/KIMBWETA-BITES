import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { OrderStatus } from '@prisma/client';

const CANCELLABLE_STATUSES: OrderStatus[] = ['PENDING', 'ACCEPTED'];

export class OrderExtensionService {
  async cancelOrder(orderId: string, userId: string, reason: string, reasonLabel: string, customMessage?: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId, deletedAt: null },
      include: { items: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (!CANCELLABLE_STATUSES.includes(order.status as OrderStatus)) {
      throw new AppError('Order cannot be cancelled in its current status', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reasonLabel,
        },
        include: { items: true },
      });

      // Restore inventory
      await Promise.all(
        updated.items.map((item) =>
          tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          })
        )
      );

      // Create cancellation detail
      await tx.cancellationDetail.create({
        data: {
          orderId,
          userId,
          reason,
          reasonLabel,
          customMessage,
          cancelledBy: 'customer',
        },
      });

      // Add timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId,
          status: 'CANCELLED',
          label: 'Order Cancelled',
          note: reasonLabel,
          createdBy: userId,
        },
      });

      return updated;
    });

    return result;
  }

  async getTimeline(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
        ...(role === 'customer' && { userId }),
      },
      select: { id: true },
    });
    if (!order) throw new AppError('Order not found', 404);

    const timeline = await prisma.orderTimeline.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });

    // If no timeline entries exist, create the initial one
    if (timeline.length === 0) {
      const fullOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, createdAt: true, userId: true },
      });
      if (fullOrder) {
        const entry = await prisma.orderTimeline.create({
          data: {
            orderId,
            status: fullOrder.status,
            label: this.getStatusLabel(fullOrder.status),
            createdAt: fullOrder.createdAt,
            createdBy: fullOrder.userId,
          },
        });
        return [entry];
      }
    }

    return timeline;
  }

  async buyAgain(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId, deletedAt: null },
      include: { items: true },
    });
    if (!order) throw new AppError('Order not found', 404);

    // Get current product info for items that still exist
    const productIds = order.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'APPROVED',
        isAvailable: true,
        deletedAt: null,
      },
      include: { inventory: true },
    });

    const availableProducts = new Map(products.map((p) => [p.id, p]));
    const itemsToRecreate = order.items
      .filter((i) => {
        const product = availableProducts.get(i.productId);
        if (!product) return false;
        const stock = product.inventory?.quantity ?? 0;
        return stock >= i.quantity;
      })
      .map((i) => {
        const product = availableProducts.get(i.productId)!;
        return {
          productId: i.productId,
          quantity: i.quantity,
          priceAtTime: product.price,
          productNameSnapshot: product.name,
        };
      });

    if (itemsToRecreate.length === 0) {
      throw new AppError('No items from your previous order are currently available', 400);
    }

    const totalAmount = itemsToRecreate.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0
    );

    const newOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          campusId: order.campusId,
          totalAmount,
          paymentMethod: order.paymentMethod,
          phoneSnapshot: order.phoneSnapshot,
          locationText: order.locationText,
          locationLat: order.locationLat,
          locationLng: order.locationLng,
          items: { create: itemsToRecreate },
        },
        include: { items: true, campus: { select: { id: true, name: true } } },
      });

      await Promise.all(
        itemsToRecreate.map((item) =>
          tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } },
          })
        )
      );

      return created;
    });

    return newOrder;
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Order Placed',
      ACCEPTED: 'Order Confirmed',
      PREPARING: 'Preparing',
      ON_THE_WAY: 'On the Way',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
    };
    return labels[status] || status;
  }
}

export const orderExtensionService = new OrderExtensionService();
