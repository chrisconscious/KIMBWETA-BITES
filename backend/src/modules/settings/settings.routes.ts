import { Router } from 'express';
import multer from 'multer';
import { settingsController } from './settings.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { auditLog } from '../../middleware/audit.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const mime = allowed.test(file.mimetype);
    if (mime) return cb(null, true);
    cb(new Error('Only image files (PNG, JPG, WEBP, SVG, GIF) are allowed'));
  },
});

const router = Router();

router.get('/public', settingsController.getPublic.bind(settingsController));
router.get('/', authenticate, authorize('super_admin'), settingsController.getAll.bind(settingsController));
router.post(
  '/upload-logo',
  authenticate,
  authorize('super_admin'),
  upload.single('file'),
  auditLog('site.logo_uploaded', 'SiteSetting'),
  settingsController.uploadLogo.bind(settingsController)
);
router.delete(
  '/logo',
  authenticate,
  authorize('super_admin'),
  auditLog('site.logo_removed', 'SiteSetting'),
  settingsController.removeLogo.bind(settingsController)
);

router.post(
  '/set',
  authenticate,
  authorize('super_admin'),
  auditLog('site.setting_updated', 'SiteSetting'),
  settingsController.set.bind(settingsController)
);

router.post(
  '/preloader-logo',
  authenticate,
  authorize('super_admin'),
  upload.single('file'),
  auditLog('site.preloader_logo_uploaded', 'SiteSetting'),
  settingsController.uploadPreloaderLogo.bind(settingsController)
);

router.delete(
  '/preloader-logo',
  authenticate,
  authorize('super_admin'),
  auditLog('site.preloader_logo_removed', 'SiteSetting'),
  settingsController.removePreloaderLogo.bind(settingsController)
);

export default router;
