import { Router } from 'express';
import multer from 'multer';
import { categoriesController } from './categories.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema, reorderCategoriesSchema } from './categories.validators';

const router = Router();
const c = categoriesController;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const mime = allowed.test(file.mimetype);
    if (mime) return cb(null, true);
    cb(new Error('Only image files (SVG, PNG, WEBP, JPG) are allowed'));
  },
});

router.get('/public', c.getPublic.bind(c));
router.get('/', c.getPublic.bind(c));

router.use(authenticate);

router.post('/', authorize('super_admin'), validate(createCategorySchema), c.create.bind(c));
router.post('/upload-icon', authorize('super_admin'), upload.single('file'), c.uploadIcon.bind(c));
router.post('/reorder', authorize('super_admin'), validate(reorderCategoriesSchema), c.reorder.bind(c));
router.patch('/:id', authorize('super_admin'), validate(updateCategorySchema), c.update.bind(c));
router.patch('/:id/status', authorize('super_admin'), c.toggleStatus.bind(c));
router.delete('/:id', authorize('super_admin'), c.remove.bind(c));

export default router;
