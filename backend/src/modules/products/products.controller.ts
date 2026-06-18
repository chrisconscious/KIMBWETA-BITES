import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';
import type { CreateProductDto, UpdateProductDto, ReviewProductDto, UpdateStockDto } from './products.validators';
import { env } from '../../config/env';

class ProductsController {
  /** Public listing — campus-filtered, approved only */
  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { campusId, categoryId, search, page = '1', limit = '20' } = req.query as Record<string, string>;
      const skip  = (parseInt(page) - 1) * parseInt(limit);
      const take  = Math.min(parseInt(limit), 50);

      const where: any = {
        status: 'APPROVED',
        isAvailable: true,
        deletedAt: null,
        ...(campusId   ? { campusId }   : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(search     ? { name: { contains: search, mode: 'insensitive' } } : {}),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          select: {
            id: true, name: true, description: true, price: true,
            imageUrl: true, campusId: true,
            category: { select: { id: true, name: true } },
            inventory: { select: { quantity: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip, take,
        }),
        prisma.product.count({ where }),
      ]);

      sendSuccess(res, { data: products, pagination: { total, page: parseInt(page), limit: take, pages: Math.ceil(total / take) } });
    } catch (e) { next(e); }
  }

  /** Admin listing — includes pending, scoped to campus */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { campusId, status, page = '1', limit = '20' } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = Math.min(parseInt(limit), 100);

      // Campus admins see only their campus
      const resolvedCampusId = user.role === 'admin' ? user.campusId : campusId;

      const where: any = {
        deletedAt: null,
        ...(resolvedCampusId ? { campusId: resolvedCampusId } : {}),
        ...(status ? { status } : {}),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: { select: { name: true } },
            inventory: { select: { quantity: true } },
            creator: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip, take,
        }),
        prisma.product.count({ where }),
      ]);

      sendSuccess(res, { data: products, pagination: { total, page: parseInt(page), limit: take, pages: Math.ceil(total / take) } });
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const body = req.body as CreateProductDto;

      // Campus admins can only create for their campus
      const campusId = user.role === 'admin' ? user.campusId! : (body.campusId || user.campusId!);

      // Enforce product limit per campus
      const campus = await prisma.campus.findUnique({ where: { id: campusId } });
      if (!campus) throw new AppError('Campus not found', 404);

      const count = await prisma.product.count({ where: { campusId, deletedAt: null } });
      if (count >= campus.maxProducts) throw new AppError(`Campus product limit reached (max: ${campus.maxProducts})`, 400);

      const imageUrl = req.file
        ? `${env.NODE_ENV === 'production' ? '' : `http://localhost:${env.PORT ?? 3000}`}/uploads/${req.file.filename}`
        : null;

      const product = await prisma.product.create({
        data: {
          name: body.name,
          description: body.description,
          price: body.price,
          categoryId: body.categoryId,
          campusId,
          createdBy: user.id,
          imageUrl,
          status: user.role === 'super_admin' ? 'APPROVED' : 'PENDING',
          ...(user.role === 'super_admin' ? { approvedBy: user.id, approvedAt: new Date() } : {}),
        },
        include: { category: { select: { name: true } } },
      });

      // Create inventory entry
      await prisma.inventory.create({
        data: { productId: product.id, quantity: body.quantity ?? 99, lowStockThreshold: 5 },
      });

      sendSuccess(res, product, 'Product created', 201);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const product = await prisma.product.findFirst({ where: { id: req.params.id, deletedAt: null } });
      if (!product) throw new AppError('Product not found', 404);
      if (user.role === 'admin' && product.campusId !== user.campusId) throw new AppError('Access denied', 403);

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const body = req.body as UpdateProductDto;

      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          ...(body.name ? { name: body.name } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.price !== undefined ? { price: body.price } : {}),
          ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
          ...(body.isAvailable !== undefined ? { isAvailable: body.isAvailable } : {}),
          ...(imageUrl ? { imageUrl } : {}),
          status: 'PENDING', // Re-review on edit (except super admin)
          ...(user.role === 'super_admin' ? { status: product.status } : {}),
        },
        include: { category: { select: { name: true } }, inventory: true },
      });

      sendSuccess(res, updated);
    } catch (e) { next(e); }
  }

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as ReviewProductDto;
      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          status: body.status,
          approvedBy: req.user!.id,
          approvedAt: body.status === 'APPROVED' ? new Date() : null,
          rejectionNote: body.status === 'REJECTED' ? body.note : null,
        },
      });
      sendSuccess(res, product, `Product ${body.status.toLowerCase()}`);
    } catch (e) { next(e); }
  }

  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { quantity } = req.body as UpdateStockDto;
      await prisma.inventory.upsert({
        where: { productId: req.params.id },
        update: { quantity },
        create: { productId: req.params.id, quantity },
      });
      sendSuccess(res, { quantity }, 'Stock updated');
    } catch (e) { next(e); }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const product = await prisma.product.findFirst({ where: { id: req.params.id, deletedAt: null } });
      if (!product) throw new AppError('Product not found', 404);
      if (user.role === 'admin' && product.campusId !== user.campusId) throw new AppError('Access denied', 403);
      await prisma.product.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
      sendSuccess(res, null, 'Product removed');
    } catch (e) { next(e); }
  }
}

export const productsController = new ProductsController();
