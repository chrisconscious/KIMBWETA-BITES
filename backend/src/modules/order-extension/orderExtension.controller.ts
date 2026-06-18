import { Request, Response, NextFunction } from 'express';
import { orderExtensionService } from './orderExtension.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';

export class OrderExtensionController {
  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const { reason, reasonLabel, customMessage } = req.body;
      const order = await orderExtensionService.cancelOrder(req.params.id, user.id, reason, reasonLabel, customMessage);
      success(res, order, 'Order cancelled');
    } catch (err) { next(err); }
  }

  async timeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const timeline = await orderExtensionService.getTimeline(req.params.id, user.id, user.role);
      success(res, timeline, 'Timeline retrieved');
    } catch (err) { next(err); }
  }

  async buyAgain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const order = await orderExtensionService.buyAgain(req.params.id, user.id);
      created(res, order, 'New order created');
    } catch (err) { next(err); }
  }
}

export const orderExtensionController = new OrderExtensionController();
