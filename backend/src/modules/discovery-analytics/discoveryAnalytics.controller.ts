import { Request, Response, NextFunction } from 'express';
import { discoveryAnalyticsService } from './discoveryAnalytics.service';
import { AuthenticatedRequest } from '../../types';
import { success } from '../../utils/response';

export class DiscoveryAnalyticsController {
  async trending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await discoveryAnalyticsService.trending(req.query as Record<string, unknown>);
      success(res, result, 'Trending products retrieved');
    } catch (err) { next(err); }
  }

  async forYou(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await discoveryAnalyticsService.forYou(user.id, req.query as Record<string, unknown>);
      success(res, result, 'Personalized recommendations retrieved');
    } catch (err) { next(err); }
  }

  async nearMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await discoveryAnalyticsService.nearMe(req.query as Record<string, unknown>);
      success(res, result, 'Nearby products retrieved');
    } catch (err) { next(err); }
  }

  async popular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await discoveryAnalyticsService.popular(req.query as Record<string, unknown>);
      success(res, result, 'Popular products retrieved');
    } catch (err) { next(err); }
  }

  async newArrivals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await discoveryAnalyticsService.newArrivals(req.query as Record<string, unknown>);
      success(res, result, 'New arrivals retrieved');
    } catch (err) { next(err); }
  }
}

export const discoveryAnalyticsController = new DiscoveryAnalyticsController();
