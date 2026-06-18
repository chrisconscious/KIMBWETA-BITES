import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { redisService, CacheKeys } from '../../services/redis.service';
import { getPaginationParams, paginate } from '../../utils/response';
import { env } from '../../config/env';
import type {
  CreateProductDto,
  UpdateProductDto,
  ApproveProductDto,
  ProductQueryDto,
} from './products.validators';

export class ProductsService {
  /**
   * Campus admin creates a product — starts in PENDING state.
   */
  async createProduct(dto: CreateProductDto, adminId: string, campusId: string) {
    const product = await prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price,
        imageUrl: dto.imageUrl ?? null,
        campusId,
        categoryId: dto.categoryId ?? null,
        createdBy: adminId,
        status: 'PENDING',
        inventory: {
          create: {
            quantity: dto.initialStock,
            lowStockThreshold: dto.lowStockThreshold,
          },
        },
      },
      include: { inventory: true, category: true },
    });

    // Bust campus product cache
    await redisService.delPattern(`products:${campusId}:*`);
    return product;
  }

  /**
   * Super admin approves or rejects a PENDING product.
   */
  async reviewProduct(productId: string, dto: ApproveProductDto, superAdminId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) throw new AppError('Product not found', 404);
    if (product.status !== 'PENDING') {
      throw new AppError('Only PENDING products can be reviewed', 400);
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        status: dto.action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedBy: dto.action === 'approve' ? superAdminId : null,
        approvedAt: dto.action === 'approve' ? new Date() : null,
        rejectionNote: dto.rejectionNote ?? null,
      },
      include: { category: true, creator: { select: { id: true, name: true } } },
    });

    await redisService.delPattern(`products:${product.campusId}:*`);
    await redisService.del(CacheKeys.product(productId));
    return updated;
  }

  /**
   * List products with caching. Customers see only APPROVED.
   */
  async listProducts(query: ProductQueryDto, requestingRole?: string) {
    const { page, limit, skip } = getPaginationParams(query as Record<string, unknown>);

    // Customers can only see approved products
    const statusFilter =
      requestingRole === 'customer' || !requestingRole
        ? 'APPROVED'
        : query.status;

    // Try cache for approved customer-facing listings
    if (statusFilter === 'APPROVED' && query.campusId && !query.search) {
      const cacheKey = CacheKeys.products(query.campusId, page);
      const cached = await redisService.get(cacheKey);
      if (cached) return cached;
    }

    const where = {
      deletedAt: null,
      ...(statusFilter && { status: statusFilter as never }),
      ...(query.campusId && { campusId: query.campusId }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' as const },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          inventory: { select: { quantity: true, lowStockThreshold: true } },
          category: { select: { id: true, name: true } },
          campus: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const result = paginate(products, total, { page, limit, skip });

    // Cache APPROVED listings
    if (statusFilter === 'APPROVED' && query.campusId && !query.search) {
      const cacheKey = CacheKeys.products(query.campusId, page);
      await redisService.set(cacheKey, result, env.CACHE_TTL_PRODUCTS);
    }

    return result;
  }

  async getProduct(productId: string) {
    const cached = await redisService.get(CacheKeys.product(productId));
    if (cached) return cached;

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: {
        inventory: true,
        category: true,
        campus: { select: { id: true, name: true, city: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!product) throw new AppError('Product not found', 404);

    await redisService.set(CacheKeys.product(productId), product, 60);
    return product;
  }

  async updateProduct(productId: string, dto: UpdateProductDto, adminId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, createdBy: adminId, deletedAt: null },
    });
    if (!product) throw new AppError('Product not found or access denied', 404);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        // Re-submit for approval if price/name changes
        ...(dto.price || dto.name ? { status: 'PENDING' } : {}),
      },
    });

    await redisService.delPattern(`products:${product.campusId}:*`);
    await redisService.del(CacheKeys.product(productId));
    return updated;
  }

  async softDeleteProduct(productId: string, adminId: string, role: string) {
    const where =
      role === 'super_admin'
        ? { id: productId, deletedAt: null }
        : { id: productId, createdBy: adminId, deletedAt: null };

    const product = await prisma.product.findFirst({ where });
    if (!product) throw new AppError('Product not found or access denied', 404);

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await redisService.delPattern(`products:${product.campusId}:*`);
    await redisService.del(CacheKeys.product(productId));
  }

  async updateStock(productId: string, quantity: number) {
    return prisma.inventory.update({
      where: { productId },
      data: { quantity },
    });
  }
}

export const productsService = new ProductsService();
