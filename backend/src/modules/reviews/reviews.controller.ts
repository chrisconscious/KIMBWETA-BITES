import { Request, Response, NextFunction } from 'express';
import { reviewsService } from './reviews.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';

export class ReviewsController {
  async getByProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reviewsService.getByProduct(req.params.productId, req.query as Record<string, unknown>);
      success(res, result, 'Reviews retrieved');
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const review = await reviewsService.create(user.id, req.body);
      created(res, review, 'Review submitted');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const review = await reviewsService.update(req.params.id, user.id, req.body);
      success(res, review, 'Review updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await reviewsService.delete(req.params.id, user.id);
      success(res, result, 'Review deleted');
    } catch (err) { next(err); }
  }
}

export const reviewsController = new ReviewsController();
