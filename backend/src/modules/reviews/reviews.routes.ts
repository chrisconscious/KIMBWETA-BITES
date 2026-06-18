import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

const c = reviewsController;

router.get('/product/:productId', optionalAuth, c.getByProduct.bind(c));
router.post('/', authenticate, c.create.bind(c));
router.patch('/:id', authenticate, c.update.bind(c));
router.delete('/:id', authenticate, c.delete.bind(c));

export default router;
