import { prisma } from '../../database/prisma';

export class SuperAdminAnalyticsService {
  async overview() {
    const [
      totalUsers,
      totalCampuses,
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersToday,
      revenueToday,
      pendingProducts,
      activeCampuses,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.campus.count({ where: { isActive: true } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.order.aggregate({
        where: { deletedAt: null, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          deletedAt: null,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.order.aggregate({
        where: {
          deletedAt: null,
          paymentStatus: 'PAID',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        _sum: { totalAmount: true },
      }),
      prisma.product.count({ where: { status: 'PENDING' } }),
      prisma.campus.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers,
      totalCampuses,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      ordersToday,
      revenueToday: revenueToday._sum.totalAmount ?? 0,
      pendingProducts,
      activeCampuses,
    };
  }

  async revenue(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailyRevenue = await prisma.$queryRaw<Array<{ date: string; total: bigint; count: bigint }>>`
      SELECT
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as total,
        COUNT(*) as count
      FROM orders
      WHERE created_at >= ${startDate}
        AND deleted_at IS NULL
        AND payment_status = 'PAID'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return dailyRevenue.map((r) => ({
      date: r.date,
      revenue: Number(r.total),
      orders: Number(r.count),
    }));
  }

  async ordersAnalytics(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const statusCounts = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE created_at >= ${startDate} AND deleted_at IS NULL
      GROUP BY status
    `;

    const paymentStatusCounts = await prisma.$queryRaw<Array<{ payment_status: string; count: bigint }>>`
      SELECT payment_status, COUNT(*) as count
      FROM orders
      WHERE created_at >= ${startDate} AND deleted_at IS NULL
      GROUP BY payment_status
    `;

    const totalOrders = await prisma.order.count({
      where: { createdAt: { gte: startDate }, deletedAt: null },
    });
    const cancelledOrders = await prisma.order.count({
      where: { createdAt: { gte: startDate }, deletedAt: null, status: 'CANCELLED' },
    });

    return {
      total: totalOrders,
      cancellationRate: totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : '0.0',
      byStatus: Object.fromEntries(statusCounts.map((s) => [s.status, Number(s.count)])),
      byPaymentStatus: Object.fromEntries(paymentStatusCounts.map((s) => [s.payment_status, Number(s.count)])),
    };
  }

  async topProducts(limit: number = 20) {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { orderItems: true } },
        campus: { select: { name: true } },
      },
      orderBy: { orderItems: { _count: 'desc' } },
      take: limit,
    });

    return products.map((p, i) => ({
      rank: i + 1,
      id: p.id,
      name: p.name,
      price: p.price,
      campus: p.campus.name,
      totalOrders: p._count.orderItems,
    }));
  }

  async campusPerformance() {
    const campuses = await prisma.campus.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { orders: true, products: true, users: true } },
      },
    });

    const performance = await Promise.all(
      campuses.map(async (campus) => {
        const revenue = await prisma.order.aggregate({
          where: { campusId: campus.id, paymentStatus: 'PAID', deletedAt: null },
          _sum: { totalAmount: true },
        });

        return {
          id: campus.id,
          name: campus.name,
          city: campus.city,
          region: campus.region,
          totalOrders: campus._count.orders,
          totalProducts: campus._count.products,
          totalUsers: campus._count.users,
          totalRevenue: revenue._sum.totalAmount ?? 0,
        };
      })
    );

    return performance;
  }
}

export const superAdminAnalyticsService = new SuperAdminAnalyticsService();
