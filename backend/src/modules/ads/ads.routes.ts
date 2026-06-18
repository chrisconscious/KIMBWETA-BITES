import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { adsController } from './ads.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createAdSchema, updateAdSchema, trackAdEventSchema } from './ads.validators';

const router = Router();
const c = adsController;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'ads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ad-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|webm/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
    cb(new Error('Only image and video files are allowed'));
  },
});

router.get('/active', c.activeAds.bind(c));
router.post('/:id/events', validate(trackAdEventSchema), c.trackEvent.bind(c));

router.use(authenticate);

router.get('/', authorize('admin', 'super_admin'), c.list.bind(c));
router.get('/analytics', authorize('super_admin'), c.analytics.bind(c));
router.post('/', authorize('super_admin'), validate(createAdSchema), c.create.bind(c));
router.post('/upload', authorize('super_admin'), upload.single('file'), c.upload.bind(c));
router.patch('/:id', authorize('super_admin'), validate(updateAdSchema), c.update.bind(c));
router.delete('/:id', authorize('super_admin'), c.remove.bind(c));
router.post('/:id/publish', authorize('super_admin'), c.publish.bind(c));
router.post('/:id/pause', authorize('super_admin'), c.pause.bind(c));
router.get('/:id/performance', authorize('super_admin'), c.performance.bind(c));
router.patch('/:id/toggle', authorize('super_admin'), c.toggle.bind(c));

export default router;
