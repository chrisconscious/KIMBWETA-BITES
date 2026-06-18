import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

class CampusesController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const campuses = await prisma.campus.findMany({
        where: { isActive: true },
        select: { id: true, name: true, shortCode: true, city: true, region: true, latitude: true, longitude: true, maxProducts: true, maxRiders: true },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, campuses);
    } catch (e) { next(e); }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await prisma.campus.findFirst({ where: { id: req.params.id, isActive: true } });
      if (!campus) throw new AppError('Campus not found', 404);
      sendSuccess(res, campus);
    } catch (e) { next(e); }
  }

  async paymentDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await prisma.paymentDetail.findMany({
        where: { campusId: req.params.id, isActive: true },
        select: { id: true, provider: true, phoneNumber: true, accountName: true, instructions: true },
      });
      sendSuccess(res, details);
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await prisma.campus.create({ data: req.body });
      sendSuccess(res, campus, 'Campus created', 201);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await prisma.campus.update({ where: { id: req.params.id }, data: req.body });
      sendSuccess(res, campus, 'Campus updated');
    } catch (e) { next(e); }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.campus.update({ where: { id: req.params.id }, data: { isActive: false } });
      sendSuccess(res, null, 'Campus deactivated');
    } catch (e) { next(e); }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await prisma.campus.findUnique({ where: { id: req.params.id } });
      if (!campus) throw new AppError('Campus not found', 404);
      const updated = await prisma.campus.update({
        where: { id: req.params.id },
        data: { isActive: !campus.isActive },
      });
      sendSuccess(res, updated, `Campus ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch (e) { next(e); }
  }

  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const campusId = req.params.id;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [products, pendingOrders, deliveredToday, activeRiders, revenueResult] = await Promise.all([
        prisma.product.count({ where: { campusId, status: 'APPROVED', isAvailable: true, deletedAt: null } }),
        prisma.order.count({ where: { campusId, status: 'PENDING' } }),
        prisma.order.count({ where: { campusId, status: 'DELIVERED', createdAt: { gte: todayStart } } }),
        prisma.deliveryRider.count({ where: { campusId, status: 'ACTIVE' } }),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { campusId, status: 'DELIVERED', createdAt: { gte: todayStart } },
        }),
      ]);

      sendSuccess(res, {
        products,
        pendingOrders,
        deliveredToday,
        activeRiders,
        revenueToday: revenueResult._sum.totalAmount ?? 0,
      });
    } catch (e) { next(e); }
  }
}

export const campusesController = new CampusesController();
