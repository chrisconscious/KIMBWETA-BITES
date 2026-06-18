import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { categoriesController } from './categories.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema, reorderCategoriesSchema } from './categories.validators';

const router = Router();
const c = categoriesController;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'categories'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cat-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
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
