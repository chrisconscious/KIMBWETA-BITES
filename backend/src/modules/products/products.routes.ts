import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { productsController } from './products.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, reviewProductSchema, updateStockSchema } from './products.validators';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (_req, file, cb) => cb(null, `product-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '5')) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

/**
 * @route GET /products/public
 * @desc  List approved products, filtered by campusId (REQUIRED for campus isolation)
 * @query campusId, categoryId, search, page, limit
 * @access Public
 */
router.get('/public', productsController.listPublic.bind(productsController));

/**
 * @route GET /products
 * @desc  Admin: list all campus products (includes pending)
 * @access Admin, Super Admin
 */
router.get('/', authenticate, requireRole('admin', 'super_admin'), productsController.list.bind(productsController));

/**
 * @route POST /products
 * @desc  Campus admin creates a product (status: PENDING until super admin approves)
 * @access Admin
 */
router.post('/',
  authenticate,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  validate(createProductSchema),
  productsController.create.bind(productsController)
);

/**
 * @route PATCH /products/:id
 * @access Admin (own campus), Super Admin
 */
router.patch('/:id',
  authenticate,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  validate(updateProductSchema),
  productsController.update.bind(productsController)
);

/**
 * @route POST /products/:id/review
 * @desc  Super admin approves or rejects a product
 * @access Super Admin
 */
router.post('/:id/review',
  authenticate,
  requireRole('super_admin'),
  validate(reviewProductSchema),
  productsController.review.bind(productsController)
);

/**
 * @route PATCH /products/:id/stock
 * @desc  Update inventory
 * @access Admin, Super Admin
 */
router.patch('/:id/stock',
  authenticate,
  requireRole('admin', 'super_admin'),
  validate(updateStockSchema),
  productsController.updateStock.bind(productsController)
);

/**
 * @route DELETE /products/:id
 * @desc  Soft delete
 * @access Admin (own campus), Super Admin
 */
router.delete('/:id',
  authenticate,
  requireRole('admin', 'super_admin'),
  productsController.remove.bind(productsController)
);

export default router;
