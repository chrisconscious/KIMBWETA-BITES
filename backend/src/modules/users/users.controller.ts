import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

class UsersController {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true, name: true, email: true, phoneNumber: true,
          role: true, status: true, campusId: true, profileImageUrl: true, lastLoginAt: true,
          campusAdminOf: { where: { isActive: true }, select: { campusId: true } },
        },
      });
      if (!user) throw new AppError('User not found', 404);

      const campusId = user.campusAdminOf[0]?.campusId || user.campusId;
      sendSuccess(res, { ...user, campusId });
    } catch (e) { next(e); }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, campusId } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
          ...(campusId ? { campusId } : {}),
        },
        select: { id: true, name: true, email: true, phoneNumber: true, role: true, campusId: true },
      });
      sendSuccess(res, user);
    } catch (e) { next(e); }
  }

  async myOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10' } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId: req.user!.id, deletedAt: null },
          include: {
            items: { select: { productNameSnapshot: true, quantity: true, priceAtTime: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip, take,
        }),
        prisma.order.count({ where: { userId: req.user!.id, deletedAt: null } }),
      ]);
      sendSuccess(res, { data: orders, pagination: { total, page: parseInt(page), limit: take } });
    } catch (e) { next(e); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, status, campusId } = req.query as Record<string, string>;
      const user = req.user!;
      const resolvedCampusId = user.role === 'admin' ? user.campusId : campusId;
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          ...(role ? { role: role as any } : {}),
          ...(status ? { status: status as any } : {}),
          ...(resolvedCampusId ? { campusId: resolvedCampusId } : {}),
        },
        select: { id: true, name: true, phoneNumber: true, email: true, role: true, status: true, createdAt: true, campusId: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      sendSuccess(res, users);
    } catch (e) { next(e); }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: req.params.id, deletedAt: null },
        select: { id: true, name: true, phoneNumber: true, email: true, role: true, status: true, campusId: true, createdAt: true },
      });
      if (!user) throw new AppError('User not found', 404);
      sendSuccess(res, user);
    } catch (e) { next(e); }
  }

  async block(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!['active','blocked'].includes(status)) throw new AppError('Invalid status', 400);
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { status },
        select: { id: true, name: true, status: true },
      });
      sendSuccess(res, user, `User ${status}`);
    } catch (e) { next(e); }
  }
}

export const usersController = new UsersController();
