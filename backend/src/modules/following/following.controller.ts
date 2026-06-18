import { Request, Response, NextFunction } from 'express';
import { followingService } from './following.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';

export class FollowingController {
  async getFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await followingService.getFollowing(user.id, req.query as Record<string, unknown>);
      success(res, result, 'Following list retrieved');
    } catch (err) { next(err); }
  }

  async getFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await followingService.getFollowers(user.id, req.query as Record<string, unknown>);
      success(res, result, 'Followers list retrieved');
    } catch (err) { next(err); }
  }

  async follow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await followingService.follow(user.id, req.params.userId);
      created(res, result, 'Now following user');
    } catch (err) { next(err); }
  }

  async unfollow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await followingService.unfollow(user.id, req.params.userId);
      success(res, result, 'Unfollowed user');
    } catch (err) { next(err); }
  }
}

export const followingController = new FollowingController();
