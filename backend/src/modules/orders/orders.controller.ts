import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';

export class OrdersController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const fullUser = await import('../../database/prisma').then(m =>
        m.prisma.user.findUnique({ where: { id: user.id }, select: { phoneNumber: true } })
      );
      const order = await ordersService.createOrder(req.body, user.id, fullUser!.phoneNumber);
      created(res, order, 'Order placed successfully');
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await ordersService.listOrders(req.query as Record<string, unknown>, user.id, user.role);
      success(res, result, 'Orders retrieved');
    } catch (err) { next(err); }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const order = await ordersService.getOrder(req.params.id, user.id, user.role);
      success(res, order, 'Order retrieved');
    } catch (err) { next(err); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const order = await ordersService.updateOrderStatus(req.params.id, req.body, user.id, user.role);
      success(res, order, 'Order status updated');
    } catch (err) { next(err); }
  }
}

export const ordersController = new OrdersController();
