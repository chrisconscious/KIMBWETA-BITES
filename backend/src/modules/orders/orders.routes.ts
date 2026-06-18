import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { auditLog } from '../../middleware/audit.middleware';
import { idempotency } from '../../middleware/security.middleware';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from './orders.validators';

const router = Router();
router.use(authenticate);

const c = ordersController;

router.post('/', authorize('customer', 'admin', 'super_admin'), idempotency, validate(createOrderSchema), auditLog('order.created', 'order'), c.create.bind(c));
router.get('/', validate(orderQuerySchema, 'query'), c.list.bind(c));
router.get('/:id', c.getOne.bind(c));
router.patch('/:id/status', authorize('admin', 'super_admin'), validate(updateOrderStatusSchema), auditLog('order.status_updated', 'order'), c.updateStatus.bind(c));

export default router;
