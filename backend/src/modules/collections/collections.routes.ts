import { Router } from 'express';
import { collectionsController } from './collections.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

const c = collectionsController;

router.get('/', c.list.bind(c));
router.post('/', c.create.bind(c));
router.get('/:id', c.getById.bind(c));
router.patch('/:id', c.update.bind(c));
router.delete('/:id', c.delete.bind(c));
router.post('/:id/items', c.addItem.bind(c));
router.delete('/:id/items/:productId', c.removeItem.bind(c));

export default router;
