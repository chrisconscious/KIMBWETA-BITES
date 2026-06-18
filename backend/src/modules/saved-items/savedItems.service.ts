import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { getPaginationParams, paginate } from '../../utils/response';

export class SavedItemsService {
  async list(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);
    const where = { userId };

    const [items, total] = await Promise.all([
      prisma.savedItem.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, price: true, imageUrl: true, status: true, isAvailable: true },
          },
        },
        orderBy: { savedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.savedItem.count({ where }),
    ]);

    return paginate(items, total, { page, limit, skip });
  }

  async save(userId: string, productId: string, notes?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, status: true } });
    if (!product) throw new AppError('Product not found', 404);

    const existing = await prisma.savedItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new AppError('Product already saved', 409);

    return prisma.savedItem.create({
      data: { userId, productId, notes },
      include: {
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
      },
    });
  }

  async updateNotes(userId: string, productId: string, notes?: string) {
    const item = await prisma.savedItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new AppError('Saved item not found', 404);

    return prisma.savedItem.update({
      where: { userId_productId: { userId, productId } },
      data: { notes },
    });
  }

  async remove(userId: string, productId: string) {
    const item = await prisma.savedItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new AppError('Saved item not found', 404);

    await prisma.savedItem.delete({ where: { userId_productId: { userId, productId } } });
    return { removed: true };
  }
}

export const savedItemsService = new SavedItemsService();
