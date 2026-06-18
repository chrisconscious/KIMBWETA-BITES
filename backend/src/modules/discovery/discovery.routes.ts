import { Router } from 'express';
import { discoveryController } from './discovery.controller';
import { authenticate, requireRole, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  trackEventSchema, shareEventSchema, shareClickSchema, sharePurchaseSchema,
  discoveryQuerySchema, analyticsPeriodSchema,
} from './discovery.validators';

const router = Router();

router.post('/track',
  optionalAuth,
  validate(trackEventSchema),
  discoveryController.trackEvent.bind(discoveryController)
);

router.post('/score-interests',
  authenticate,
  discoveryController.scoreInterests.bind(discoveryController)
);

router.get('/for-you',
  authenticate,
  discoveryController.getForYou.bind(discoveryController)
);

router.get('/trending',
  validate(discoveryQuerySchema),
  discoveryController.getTrending.bind(discoveryController)
);

router.get('/most-shared',
  discoveryController.getMostShared.bind(discoveryController)
);

router.get('/most-purchased',
  discoveryController.getMostPurchased.bind(discoveryController)
);

router.get('/most-loved',
  discoveryController.getMostLoved.bind(discoveryController)
);

router.get('/near-you',
  discoveryController.getNearYou.bind(discoveryController)
);

router.get('/friends-recommended',
  authenticate,
  discoveryController.getFriendsRecommended.bind(discoveryController)
);

router.get('/analytics',
  authenticate,
  requireRole('super_admin'),
  discoveryController.getAnalytics.bind(discoveryController)
);

router.get('/interests',
  authenticate,
  discoveryController.getInterests.bind(discoveryController)
);

router.post('/share',
  authenticate,
  validate(shareEventSchema),
  discoveryController.shareProduct.bind(discoveryController)
);

router.post('/share/click',
  authenticate,
  validate(shareClickSchema),
  discoveryController.recordShareClick.bind(discoveryController)
);

router.post('/share/purchase',
  authenticate,
  validate(sharePurchaseSchema),
  discoveryController.recordSharePurchase.bind(discoveryController)
);

export default router;
