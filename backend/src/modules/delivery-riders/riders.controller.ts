import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

class RidersController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, campusId, vehicleType, vehiclePlate, idNumber } = req.body;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found', 404);

      const campus = await prisma.campus.findUnique({ where: { id: campusId } });
      if (!campus) throw new AppError('Campus not found', 404);

      // Check rider limit per campus
      const riderCount = await prisma.deliveryRider.count({ where: { campusId, status: { in: ['PENDING_APPROVAL', 'ACTIVE'] } } });
      if (riderCount >= campus.maxRiders) throw new AppError(`Campus rider limit reached (max: ${campus.maxRiders})`, 400);

      // Update user role to rider
      await prisma.user.update({ where: { id: userId }, data: { role: 'rider' } });

      const rider = await prisma.deliveryRider.create({
        data: { userId, campusId, vehicleType, vehiclePlate, idNumber, registeredBy: req.user!.id, status: 'PENDING_APPROVAL' },
        include: { user: { select: { name: true, phoneNumber: true } } },
      });
      sendSuccess(res, rider, 'Rider registered, pending approval', 201);
    } catch (e) { next(e); }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const rider = await prisma.deliveryRider.update({
        where: { id: req.params.id },
        data: { status: 'ACTIVE', isAvailable: true, approvedBy: req.user!.id, approvedAt: new Date() },
      });
      sendSuccess(res, rider, 'Rider approved');
    } catch (e) { next(e); }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const rider = await prisma.deliveryRider.update({
        where: { id: req.params.id },
        data: { status: 'INACTIVE', rejectionNote: req.body.reason },
      });
      sendSuccess(res, rider, 'Rider rejected');
    } catch (e) { next(e); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { campusId, status } = req.query as Record<string, string>;
      const user = req.user!;
      // Campus admins can only see their campus
      const resolvedCampusId = user.role === 'admin' ? user.campusId : campusId;
      const riders = await prisma.deliveryRider.findMany({
        where: { ...(resolvedCampusId ? { campusId: resolvedCampusId } : {}), ...(status ? { status: status as any } : {}) },
        include: { user: { select: { name: true, phoneNumber: true, profileImageUrl: true } } },
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, riders);
    } catch (e) { next(e); }
  }

  async available(req: Request, res: Response, next: NextFunction) {
    try {
      const campusId = req.user!.campusId;
      if (!campusId) throw new AppError('No campus associated', 400);
      const riders = await prisma.deliveryRider.findMany({
        where: { campusId, status: 'ACTIVE', isAvailable: true },
        include: { user: { select: { name: true, phoneNumber: true, profileImageUrl: true } } },
      });
      sendSuccess(res, riders);
    } catch (e) { next(e); }
  }

  async toggleAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const rider = await prisma.deliveryRider.findUnique({ where: { userId: req.user!.id } });
      if (!rider) throw new AppError('Rider profile not found', 404);
      const updated = await prisma.deliveryRider.update({
        where: { id: rider.id },
        data: { isAvailable: !rider.isAvailable },
      });
      sendSuccess(res, { isAvailable: updated.isAvailable });
    } catch (e) { next(e); }
  }
}

export const ridersController = new RidersController();
