import { Router } from 'express';
import { superAdminAnalyticsController } from './superAdminAnalytics.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('super_admin'));

const c = superAdminAnalyticsController;

router.get('/commerce/overview', c.overview.bind(c));
router.get('/commerce/revenue', c.revenue.bind(c));
router.get('/commerce/orders', c.ordersAnalytics.bind(c));
router.get('/commerce/top-products', c.topProducts.bind(c));
router.get('/commerce/campus-performance', c.campusPerformance.bind(c));

export default router;
