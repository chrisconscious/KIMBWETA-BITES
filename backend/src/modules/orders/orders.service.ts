import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { getPaginationParams, paginate } from '../../utils/response';
import { socketService } from '../../sockets/socket.service';
import { notificationsService } from '../notifications/notifications.service';
import type { CreateOrderDto, UpdateOrderStatusDto } from './orders.validators';
import { OrderStatus } from '@prisma/client';

// Valid order status transitions
const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING:    ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:   ['PREPARING', 'CANCELLED'],
  PREPARING:  ['ON_THE_WAY'],
  ON_THE_WAY: ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  [],
};

export class OrdersService {
  /**
   * Create a new order atomically using a Prisma transaction:
   * 1. Validate all products exist and are in stock
   * 2. Snapshot prices and names
   * 3. Insert order + order_items
   * 4. Decrement inventory
   * 5. Emit socket event to campus admin
   */
  async createOrder(dto: CreateOrderDto, userId: string, userPhone: string) {
    // Validate campus is active
    const campus = await prisma.campus.findFirst({
      where: { id: dto.campusId, isActive: true },
    });
    if (!campus) throw new AppError('Campus not found or inactive', 404);

    // Load all products in one query
    const productIds = dto.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        campusId: dto.campusId,
        status: 'APPROVED',
        isAvailable: true,
        deletedAt: null,
      },
      include: { inventory: true },
    });

    if (products.length !== productIds.length) {
      throw new AppError(
        'One or more products are unavailable or not from this campus',
        400
      );
    }

    // Check stock for each item
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      const stock = product.inventory?.quantity ?? 0;
      if (stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Available: ${stock}`,
          400
        );
      }
    }

    // Calculate total
    const totalAmount = dto.items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    // Atomic transaction — all or nothing
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          campusId: dto.campusId,
          totalAmount,
          paymentMethod: dto.paymentMethod,
          phoneSnapshot: userPhone,
          locationLat: dto.locationLat ?? null,
          locationLng: dto.locationLng ?? null,
          locationText: dto.locationText ?? null,
          // Create all line items in nested write
          items: {
            create: dto.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: product.price,
                productNameSnapshot: product.name,
              };
            }),
          },
        },
        include: {
          items: true,
          campus: { select: { id: true, name: true } },
        },
      });

      // 2. Decrement inventory for each item
      await Promise.all(
        dto.items.map((item) =>
          tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } },
          })
        )
      );

      return newOrder;
    });

    // After transaction: emit real-time event and notification (non-blocking)
    setImmediate(async () => {
      try {
        // Notify campus admin via socket
        socketService.emitNewOrder(order.campusId, {
          orderId: order.id,
          campusId: order.campusId,
          totalAmount: order.totalAmount,
          customerPhone: userPhone,
          itemCount: dto.items.length,
          createdAt: order.createdAt.toISOString(),
        });

        // Create in-app notification for campus admins
        const admins = await prisma.campusAdmin.findMany({
          where: { campusId: dto.campusId, isActive: true },
          select: { userId: true },
        });

        await Promise.all(
          admins.map((admin) =>
            notificationsService.create({
              userId: admin.userId,
              title: 'New Order Received',
              body: `Order #${order.id.slice(0, 8)} — TZS ${order.totalAmount.toLocaleString()}`,
              type: 'new_order',
              referenceId: order.id,
              referenceType: 'order',
            })
          )
        );
      } catch { /* silently ignore post-transaction side effects */ }
    });

    return order;
  }

  /**
   * Advance order status with transition validation.
   */
  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    actorId: string,
    actorRole: string
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
    });
    if (!order) throw new AppError('Order not found', 404);

    // Campus admin can only manage their campus orders
    if (actorRole === 'admin') {
      const isAuthorized = await prisma.campusAdmin.findFirst({
        where: { userId: actorId, campusId: order.campusId, isActive: true },
      });
      if (!isAuthorized) throw new AppError('Access denied to this order', 403);
    }

    // Validate transition
    const allowed = STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(dto.status as OrderStatus)) {
      throw new AppError(
        `Cannot transition from ${order.status} to ${dto.status}`,
        400
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status as OrderStatus,
        ...(dto.cancellationReason && { cancellationReason: dto.cancellationReason }),
        ...(dto.riderNotes && { riderNotes: dto.riderNotes }),
      },
      include: { items: true, campus: { select: { id: true, name: true } } },
    });

    // If cancelled, restore inventory
    if (dto.status === 'CANCELLED') {
      await prisma.$transaction(
        updated.items.map((item) =>
          prisma.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          })
        )
      );
    }

    // Real-time notification to customer
    setImmediate(async () => {
      try {
        socketService.emitOrderUpdate(updated.userId, updated.campusId, {
          orderId: updated.id,
          userId: updated.userId,
          campusId: updated.campusId,
          status: updated.status,
          updatedAt: updated.updatedAt.toISOString(),
        });

        await notificationsService.create({
          userId: updated.userId,
          title: 'Order Update',
          body: `Your order status changed to ${updated.status.replace('_', ' ')}`,
          type: 'order_status',
          referenceId: orderId,
          referenceType: 'order',
        });
      } catch { /* non-critical */ }
    });

    return updated;
  }

  async getOrder(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
        ...(role === 'customer' && { userId }), // customers only see own orders
      },
      include: {
        items: { include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } } },
        campus: { select: { id: true, name: true, city: true } },
        user: { select: { id: true, name: true, phoneNumber: true } },
      },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async listOrders(query: Record<string, unknown>, actorId: string, role: string) {
    const { page, limit, skip } = getPaginationParams(query);

    let campusId = query.campusId as string | undefined;

    // Admins can only see their campus orders
    if (role === 'admin') {
      const ca = await prisma.campusAdmin.findFirst({
        where: { userId: actorId, isActive: true },
        select: { campusId: true },
      });
      campusId = ca?.campusId;
    }

    const where = {
      deletedAt: null,
      ...(campusId && { campusId }),
      ...(role === 'customer' && { userId: actorId }),
      ...(query.status ? { status: typeof query.status === 'string' && query.status.includes(',') ? { in: (query.status as string).split(',') } : query.status } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { select: { id: true, quantity: true, priceAtTime: true, productNameSnapshot: true, productId: true, product: { select: { id: true, name: true, imageUrl: true, price: true } } } },
          campus: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, phoneNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return paginate(orders, total, { page, limit, skip });
  }
}

export const ordersService = new OrdersService();
