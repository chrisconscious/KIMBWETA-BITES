import { Request, Response, NextFunction } from 'express';
import { adsService } from './ads.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';

export class AdsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const ad = await adsService.createAd(req.body, user.id);
      created(res, ad, 'Ad created');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ad = await adsService.updateAd(req.params.id, req.body);
      success(res, ad, 'Ad updated');
    } catch (err) { next(err); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adsService.deleteAd(req.params.id);
      success(res, null, 'Ad deleted');
    } catch (err) { next(err); }
  }

  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ad = await adsService.publishAd(req.params.id);
      success(res, ad, 'Ad published');
    } catch (err) { next(err); }
  }

  async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ad = await adsService.pauseAd(req.params.id);
      success(res, ad, 'Ad paused');
    } catch (err) { next(err); }
  }

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }
      const url = `/uploads/ads/${file.filename}`;
      success(res, { url, filename: file.filename, size: file.size, mimetype: file.mimetype }, 'File uploaded');
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, destination, campusId } = req.query as any;
      const ads = await adsService.listAds({ status, destination, campusId });
      success(res, ads, 'Ads retrieved');
    } catch (err) { next(err); }
  }

  async activeAds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campusId = req.query.campusId as string | undefined;
      const ads = await adsService.getActiveAds(campusId);
      success(res, ads, 'Active ads retrieved');
    } catch (err) { next(err); }
  }

  async trackEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await adsService.trackEvent(
        req.params.id,
        req.body.eventType,
        authReq.user?.id,
        req.ip,
        req.headers['user-agent']
      );
      success(res, result, 'Event tracked');
    } catch (err) { next(err); }
  }

  async performance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adsService.getAdPerformance(req.params.id);
      success(res, data, 'Ad performance');
    } catch (err) { next(err); }
  }

  async analytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adsService.getAdAnalytics();
      success(res, data, 'Ad analytics');
    } catch (err) { next(err); }
  }

  async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ad = await adsService.toggleAd(req.params.id, req.body.isActive);
      success(res, ad, 'Ad updated');
    } catch (err) { next(err); }
  }
}

export const adsController = new AdsController();
