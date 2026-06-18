import { Router, Request, Response, NextFunction } from 'express';
import { analyticsService, trackEventSchema } from './analytics.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { AuthenticatedRequest } from '../../types';
import { success } from '../../utils/response';

const router = Router();

// Track event — public (anonymous + authenticated)
router.post('/events', validate(trackEventSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as Partial<AuthenticatedRequest>;
    await analyticsService.trackEvent(req.body, authReq.user?.id, req.ip);
    success(res, null, 'Event tracked');
  } catch (err) { next(err); }
});

// Reports — admin+
router.get('/report', authenticate, authorize('admin', 'super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const campusId = user.role === 'admin' ? user.campusId : req.query.campusId as string | undefined;
    const days = Number(req.query.days ?? 7);
    const report = await analyticsService.getReport(campusId, days);
    success(res, report, 'Report generated');
  } catch (err) { next(err); }
});

export default router;
