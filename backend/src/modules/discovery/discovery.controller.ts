import { Request, Response, NextFunction } from 'express';
import { discoveryService } from './discovery.service';
import { sendSuccess } from '../../utils/response';

class DiscoveryController {
  async trackEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const { events } = req.body;
      const results = await discoveryService.trackEvents(userId, events, ipAddress);
      sendSuccess(res, { tracked: results.length }, 'Events tracked', 201);
    } catch (e) { next(e); }
  }

  async scoreInterests(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const result = await discoveryService.scoreUserInterests(userId || req.user!.id);
      sendSuccess(res, result, 'Interests scored');
    } catch (e) { next(e); }
  }

  async getForYou(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20' } = req.query as Record<string, string>;
      const products = await discoveryService.getForYouFeed(req.user!.id, parseInt(page), parseInt(limit));
      sendSuccess(res, { data: products, page: parseInt(page), limit: parseInt(limit) });
    } catch (e) { next(e); }
  }

  async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'week', limit = '20' } = req.query as Record<string, string>;
      const products = await discoveryService.getTrending(period, parseInt(limit));
      sendSuccess(res, { data: products, period, limit: parseInt(limit) });
    } catch (e) { next(e); }
  }

  async getMostShared(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '20' } = req.query as Record<string, string>;
      const products = await discoveryService.getMostShared(parseInt(limit));
      sendSuccess(res, { data: products, limit: parseInt(limit) });
    } catch (e) { next(e); }
  }

  async getMostPurchased(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '20' } = req.query as Record<string, string>;
      const products = await discoveryService.getMostPurchased(parseInt(limit));
      sendSuccess(res, { data: products, limit: parseInt(limit) });
    } catch (e) { next(e); }
  }

  async getMostLoved(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '20' } = req.query as Record<string, string>;
      const products = await discoveryService.getMostLoved(parseInt(limit));
      sendSuccess(res, { data: products, limit: parseInt(limit) });
    } catch (e) { next(e); }
  }

  async getNearYou(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || null;
      const products = await discoveryService.getNearYou(userId, req.query);
      sendSuccess(res, { data: products });
    } catch (e) { next(e); }
  }

  async getFriendsRecommended(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '20' } = req.query as Record<string, string>;
      const products = await discoveryService.getFriendsRecommended(req.user!.id, parseInt(limit));
      sendSuccess(res, { data: products, limit: parseInt(limit) });
    } catch (e) { next(e); }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'week' } = req.query as Record<string, string>;
      const analytics = await discoveryService.getDiscoveryAnalytics(period);
      sendSuccess(res, analytics);
    } catch (e) { next(e); }
  }

  async getInterests(req: Request, res: Response, next: NextFunction) {
    try {
      const interests = await discoveryService.getUserInterests(req.user!.id);
      sendSuccess(res, { data: interests });
    } catch (e) { next(e); }
  }

  async shareProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, recipientUserId } = req.body;
      const share = await discoveryService.createShareEvent(productId, req.user!.id, recipientUserId);
      sendSuccess(res, { share }, 'Product shared', 201);
    } catch (e) { next(e); }
  }

  async recordShareClick(req: Request, res: Response, next: NextFunction) {
    try {
      const { shareId } = req.body;
      await discoveryService.recordShareClick(shareId);
      sendSuccess(res, null, 'Share click recorded');
    } catch (e) { next(e); }
  }

  async recordSharePurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const { shareId } = req.body;
      await discoveryService.recordSharePurchase(shareId);
      sendSuccess(res, null, 'Share purchase recorded');
    } catch (e) { next(e); }
  }
}

export const discoveryController = new DiscoveryController();
