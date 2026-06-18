import { Request, Response, NextFunction } from 'express';
import { superAdminAnalyticsService } from './superAdminAnalytics.service';
import { success } from '../../utils/response';

export class SuperAdminAnalyticsController {
  async overview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await superAdminAnalyticsService.overview();
      success(res, data, 'Overview retrieved');
    } catch (err) { next(err); }
  }

  async revenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await superAdminAnalyticsService.revenue(days);
      success(res, data, 'Revenue data retrieved');
    } catch (err) { next(err); }
  }

  async ordersAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await superAdminAnalyticsService.ordersAnalytics(days);
      success(res, data, 'Order analytics retrieved');
    } catch (err) { next(err); }
  }

  async topProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await superAdminAnalyticsService.topProducts(limit);
      success(res, data, 'Top products retrieved');
    } catch (err) { next(err); }
  }

  async campusPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await superAdminAnalyticsService.campusPerformance();
      success(res, data, 'Campus performance retrieved');
    } catch (err) { next(err); }
  }
}

export const superAdminAnalyticsController = new SuperAdminAnalyticsController();
