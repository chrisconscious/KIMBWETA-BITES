import { Router } from 'express';
import { ridersController } from './riders.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Campus admin: register a new rider
router.post('/', authenticate, requireRole('admin', 'super_admin'), ridersController.register.bind(ridersController));

// Super admin: approve/reject
router.patch('/:id/approve', authenticate, requireRole('super_admin'), ridersController.approve.bind(ridersController));
router.patch('/:id/reject', authenticate, requireRole('super_admin'), ridersController.reject.bind(ridersController));

// Campus admin or super admin: list campus riders
router.get('/', authenticate, requireRole('admin', 'super_admin'), ridersController.list.bind(ridersController));

// Public (filtered by campus from JWT): available riders
router.get('/available', authenticate, ridersController.available.bind(ridersController));

// Rider: toggle own availability
router.patch('/availability', authenticate, requireRole('rider'), ridersController.toggleAvailability.bind(ridersController));

export default router;
