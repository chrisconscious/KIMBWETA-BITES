import { Router } from 'express';
import { campusesController } from './campuses.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCampusSchema, updateCampusSchema } from './campuses.validators';

const router = Router();

// Public
router.get('/', campusesController.list.bind(campusesController));
router.get('/all', campusesController.list.bind(campusesController));
router.get('/:id', campusesController.getOne.bind(campusesController));
router.get('/:id/payment-details', campusesController.paymentDetails.bind(campusesController));

// Super admin only
router.post('/', authenticate, requireRole('super_admin'), validate(createCampusSchema), campusesController.create.bind(campusesController));
router.patch('/:id', authenticate, requireRole('super_admin'), validate(updateCampusSchema), campusesController.update.bind(campusesController));
router.delete('/:id', authenticate, requireRole('super_admin'), campusesController.remove.bind(campusesController));

// Campus admin or super admin
router.get('/:id/stats', authenticate, requireRole('admin', 'super_admin'), campusesController.stats.bind(campusesController));

// Super admin only
router.patch('/:id/toggle-active', authenticate, requireRole('super_admin'), campusesController.toggleActive.bind(campusesController));

export default router;
