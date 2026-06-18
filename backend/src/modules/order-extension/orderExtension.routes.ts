import { Router } from 'express';
import { orderExtensionController } from './orderExtension.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

const c = orderExtensionController;

router.post('/:id/cancel', c.cancel.bind(c));
router.get('/:id/timeline', c.timeline.bind(c));
router.post('/:id/buy-again', c.buyAgain.bind(c));

export default router;
