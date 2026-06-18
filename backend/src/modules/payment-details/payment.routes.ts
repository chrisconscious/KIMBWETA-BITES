import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';

const router = Router();

// GET /api/payment-details?campus_id=xxx
router.get('/', async (req, res, next) => {
  try {
    const campusId = req.query.campus_id as string;
    const details = await prisma.paymentDetail.findMany({
      where: { ...(campusId ? { campusId } : {}), isActive: true },
      select: { id: true, provider: true, phoneNumber: true, accountName: true, instructions: true },
    });
    sendSuccess(res, details);
  } catch (e) { next(e); }
});

// Campus admin: manage payment details
router.post('/', authenticate, requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const user = req.user!;
    const campusId = user.role === 'admin' ? user.campusId : req.body.campusId;
    const detail = await prisma.paymentDetail.create({ data: { ...req.body, campusId } });
    sendSuccess(res, detail, 'Payment detail added', 201);
  } catch (e) { next(e); }
});

router.patch('/:id', authenticate, requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const detail = await prisma.paymentDetail.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, detail, 'Payment detail updated');
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    await prisma.paymentDetail.update({ where: { id: req.params.id }, data: { isActive: false } });
    sendSuccess(res, null, 'Payment detail removed');
  } catch (e) { next(e); }
});

export default router;
