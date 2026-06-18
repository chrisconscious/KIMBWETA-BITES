import { prisma } from '../../database/prisma';
import { z } from 'zod';

export const trackEventSchema = z.object({
  eventType: z.string().min(1).max(100),
  sessionId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).default({}),
  platform: z.enum(['ios', 'android', 'web']).optional(),
  appVersion: z.string().max(20).optional(),
});

export type TrackEventDto = z.infer<typeof trackEventSchema>;

export class AnalyticsService {
  async trackEvent(dto: TrackEventDto, userId?: string, ip?: string) {
    // Fire-and-forget — never block the request for analytics
    prisma.analyticsEvent
      .create({
        data: {
          userId: userId ?? null,
          sessionId: dto.sessionId ?? null,
          campusId: dto.campusId ?? null,
          eventType: dto.eventType,
          metadata: dto.metadata as any,
          ipAddress: ip ?? null,
          platform: dto.platform ?? null,
          appVersion: dto.appVersion ?? null,
        },
      })
      .catch(() => {/* silently ignore */});
  }

  async getReport(campusId?: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      orderStats,
      topProducts,
      eventCounts,
      dailyOrders,
    ] = await Promise.all([
      // Order revenue summary
      prisma.order.aggregate({
        where: {
          createdAt: { gte: since },
          status: 'DELIVERED',
          ...(campusId && { campusId }),
        },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),

      // Top-selling products by order item quantity
      prisma.orderItem.groupBy({
        by: ['productId', 'productNameSnapshot'],
        _sum: { quantity: true },
        where: {
          order: {
            createdAt: { gte: since },
            status: { in: ['DELIVERED', 'PREPARING', 'ON_THE_WAY'] },
            ...(campusId && { campusId }),
          },
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      // Event counts by type
      prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        _count: { id: true },
        where: { createdAt: { gte: since }, ...(campusId && { campusId }) },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Daily order counts
      prisma.$queryRaw<{ date: string; count: number; revenue: number }[]>`
        SELECT
          DATE(created_at)::text AS date,
          COUNT(*)::int           AS count,
          SUM(total_amount)::int  AS revenue
        FROM orders
        WHERE created_at >= ${since}
          AND status = 'DELIVERED'
          ${campusId ? prisma.$queryRaw`AND campus_id = ${campusId}::uuid` : prisma.$queryRaw``}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    return {
      period: `Last ${days} days`,
      orders: {
        delivered: orderStats._count.id,
        revenue: orderStats._sum.totalAmount ?? 0,
      },
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        name: p.productNameSnapshot,
        quantitySold: p._sum.quantity,
      })),
      events: eventCounts.map((e) => ({ type: e.eventType, count: e._count.id })),
      dailyOrders,
    };
  }
}

export const analyticsService = new AnalyticsService();
