import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.get('/me',         authenticate, usersController.me.bind(usersController));
router.patch('/me',       authenticate, usersController.updateMe.bind(usersController));
router.get('/me/orders',  authenticate, usersController.myOrders.bind(usersController));

// Admin
router.get('/',           authenticate, requireRole('admin', 'super_admin'), usersController.list.bind(usersController));
router.get('/:id',        authenticate, requireRole('admin', 'super_admin'), usersController.getOne.bind(usersController));
router.patch('/:id/block',authenticate, requireRole('super_admin'),         usersController.block.bind(usersController));

export default router;
