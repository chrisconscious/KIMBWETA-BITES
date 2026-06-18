import { prisma } from '../../database/prisma';
import { getPaginationParams, paginate } from '../../utils/response';

export class DiscoveryAnalyticsService {
  async trending(query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);

    // Products with most orders in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'APPROVED',
          isAvailable: true,
          deletedAt: null,
          orderItems: {
            some: {
              order: {
                createdAt: { gte: sevenDaysAgo },
                status: { in: ['DELIVERED', 'ON_THE_WAY', 'PREPARING'] },
              },
            },
          },
        },
        include: {
          _count: { select: { orderItems: true, reviews: true } },
          reviews: { select: { rating: true } },
          campus: { select: { id: true, name: true } },
        },
        orderBy: { orderItems: { _count: 'desc' } },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: {
          status: 'APPROVED',
          isAvailable: true,
          deletedAt: null,
        },
      }),
    ]);

    const items = products.map((p) => {
      const avgRating = p.reviews.length
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
      const { reviews, ...rest } = p;
      return { ...rest, averageRating: Math.round(avgRating * 10) / 10 };
    });

    return paginate(items, total, { page, limit, skip });
  }

  async forYou(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);

    // Get user's campus and category preferences from order history + saved items
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { campusId: true },
    });

    // Get categories from user's past orders
    const pastCategoryIds = await prisma.orderItem.findMany({
      where: {
        order: { userId, status: { in: ['DELIVERED', 'ON_THE_WAY', 'PREPARING', 'ACCEPTED'] } },
        product: { categoryId: { not: null } },
      },
      select: { product: { select: { categoryId: true } } },
      take: 50,
    });

    const categoryIds = [...new Set(pastCategoryIds.map((i) => i.product.categoryId).filter(Boolean))] as string[];

    const where: any = {
      status: 'APPROVED',
      isAvailable: true,
      deletedAt: null,
      ...(user?.campusId ? { campusId: user.campusId } : {}),
      ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
          campus: { select: { id: true, name: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const items = products.map((p) => {
      const avgRating = p.reviews.length
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
      const { reviews, ...rest } = p;
      return { ...rest, averageRating: Math.round(avgRating * 10) / 10 };
    });

    return paginate(items, total, { page, limit, skip });
  }

  async nearMe(query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);
    const campusId = query.campusId as string;

    const where: any = {
      status: 'APPROVED',
      isAvailable: true,
      deletedAt: null,
      ...(campusId ? { campusId } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
          campus: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const items = products.map((p) => {
      const avgRating = p.reviews.length
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
      const { reviews, ...rest } = p;
      return { ...rest, averageRating: Math.round(avgRating * 10) / 10 };
    });

    return paginate(items, total, { page, limit, skip });
  }

  async popular(query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'APPROVED', isAvailable: true, deletedAt: null },
        include: {
          _count: { select: { orderItems: true, reviews: true } },
          reviews: { select: { rating: true } },
          campus: { select: { id: true, name: true } },
        },
        orderBy: { orderItems: { _count: 'desc' } },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: { status: 'APPROVED', isAvailable: true, deletedAt: null },
      }),
    ]);

    const items = products.map((p) => {
      const avgRating = p.reviews.length
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
      const { reviews, ...rest } = p;
      return { ...rest, averageRating: Math.round(avgRating * 10) / 10 };
    });

    return paginate(items, total, { page, limit, skip });
  }

  async newArrivals(query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'APPROVED', isAvailable: true, deletedAt: null },
        include: {
          campus: { select: { id: true, name: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: { status: 'APPROVED', isAvailable: true, deletedAt: null },
      }),
    ]);

    return paginate(products, total, { page, limit, skip });
  }
}

export const discoveryAnalyticsService = new DiscoveryAnalyticsService();
