import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { getPaginationParams, paginate } from '../../utils/response';

export class ReviewsService {
  async getByProduct(productId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);

    const where = { productId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, profileImageUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    const stats = await this.getProductStats(productId);

    return { ...paginate(reviews, total, { page, limit, skip }), stats };
  }

  async getProductStats(productId: string) {
    const result = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    // Rating distribution
    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: true,
    });

    const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => { distMap[d.rating] = d._count; });

    return {
      averageRating: result._avg.rating ?? 0,
      totalReviews: result._count,
      distribution: distMap,
    };
  }

  async create(userId: string, data: { productId: string; rating: number; title?: string; body?: string }) {
    if (data.rating < 1 || data.rating > 5) throw new AppError('Rating must be between 1 and 5', 400);

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: data.productId }, select: { id: true } });
    if (!product) throw new AppError('Product not found', 404);

    // Check for duplicate
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId: data.productId } },
    });
    if (existing) throw new AppError('You already reviewed this product', 409);

    // Check if user has ordered this product (verified purchase)
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: { userId, status: 'DELIVERED' },
      },
      select: { orderId: true },
    });

    return prisma.review.create({
      data: {
        userId,
        productId: data.productId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        isVerifiedPurchase: !!orderItem,
        orderId: orderItem?.orderId,
      },
      include: {
        user: { select: { id: true, name: true, profileImageUrl: true } },
      },
    });
  }

  async update(id: string, userId: string, data: { rating?: number; title?: string; body?: string }) {
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const review = await prisma.review.findFirst({ where: { id, userId } });
    if (!review) throw new AppError('Review not found', 404);

    return prisma.review.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, profileImageUrl: true } },
      },
    });
  }

  async delete(id: string, userId: string) {
    const review = await prisma.review.findFirst({ where: { id, userId } });
    if (!review) throw new AppError('Review not found', 404);

    await prisma.review.delete({ where: { id } });
    return { deleted: true };
  }
}

export const reviewsService = new ReviewsService();
