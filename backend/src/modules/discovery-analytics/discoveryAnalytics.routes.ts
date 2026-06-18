import { Router } from 'express';
import { discoveryAnalyticsController } from './discoveryAnalytics.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

const c = discoveryAnalyticsController;

router.get('/trending', c.trending.bind(c));
router.get('/popular', c.popular.bind(c));
router.get('/new-arrivals', c.newArrivals.bind(c));
router.get('/near-me', c.nearMe.bind(c));
router.get('/for-you', authenticate, c.forYou.bind(c));

export default router;
