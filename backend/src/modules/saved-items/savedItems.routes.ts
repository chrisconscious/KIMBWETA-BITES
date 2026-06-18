import { Router } from 'express';
import { savedItemsController } from './savedItems.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

const c = savedItemsController;

router.get('/', c.list.bind(c));
router.post('/', c.save.bind(c));
router.patch('/:productId', c.updateNotes.bind(c));
router.delete('/:productId', c.remove.bind(c));

export default router;
