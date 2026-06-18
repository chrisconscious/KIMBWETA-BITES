import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { getPaginationParams, paginate } from '../../utils/response';

export class CollectionsService {
  async list(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);

    const where = { userId };

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        include: {
          _count: { select: { items: true } },
        },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      prisma.collection.count({ where }),
    ]);

    return paginate(collections, total, { page, limit, skip });
  }

  async getById(id: string, userId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, imageUrl: true, status: true, isAvailable: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!collection) throw new AppError('Collection not found', 404);
    return collection;
  }

  async create(userId: string, data: { name: string; description?: string; isPublic?: boolean }) {
    return prisma.collection.create({
      data: { userId, ...data },
    });
  }

  async update(id: string, userId: string, data: { name?: string; description?: string; isPublic?: boolean; sortOrder?: number }) {
    const existing = await prisma.collection.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Collection not found', 404);

    return prisma.collection.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.collection.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Collection not found', 404);

    await prisma.collection.delete({ where: { id } });
    return { deleted: true };
  }

  async addItem(collectionId: string, userId: string, productId: string, note?: string) {
    const collection = await prisma.collection.findFirst({ where: { id: collectionId, userId } });
    if (!collection) throw new AppError('Collection not found', 404);

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new AppError('Product not found', 404);

    const existing = await prisma.collectionItem.findUnique({
      where: { collectionId_productId: { collectionId, productId } },
    });
    if (existing) throw new AppError('Product already in collection', 409);

    return prisma.collectionItem.create({
      data: { collectionId, productId, note },
      include: {
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
      },
    });
  }

  async removeItem(collectionId: string, userId: string, productId: string) {
    const collection = await prisma.collection.findFirst({ where: { id: collectionId, userId } });
    if (!collection) throw new AppError('Collection not found', 404);

    const item = await prisma.collectionItem.findUnique({
      where: { collectionId_productId: { collectionId, productId } },
    });
    if (!item) throw new AppError('Item not found in collection', 404);

    await prisma.collectionItem.delete({
      where: { collectionId_productId: { collectionId, productId } },
    });
    return { removed: true };
  }
}

export const collectionsService = new CollectionsService();
