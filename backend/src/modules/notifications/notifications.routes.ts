import { Router, Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';
import { success } from '../../utils/response';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = await notificationsService.getUserNotifications(
      user.id,
      req.query as Record<string, unknown>
    );
    success(res, result, 'Notifications retrieved');
  } catch (err) { next(err); }
});

router.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const count = await notificationsService.getUnreadCount(user.id);
    success(res, { count }, 'Unread count');
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await notificationsService.markAsRead(req.params.id, user.id);
    success(res, null, 'Notification marked as read');
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await notificationsService.markAllAsRead(user.id);
    success(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
});

export default router;
