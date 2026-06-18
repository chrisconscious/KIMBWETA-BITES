import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';

const router = Router();

router.post('/:productId/share', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { shareReason, sharePlatform } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, campusId: true } });
    if (!product) return sendSuccess(res, null, 'Product not found', 404);
    const share = await prisma.productShare.create({
      data: { productId, userId: req.user!.id, campusId: product.campusId, shareReason, sharePlatform },
    });
    sendSuccess(res, share, 'Share recorded', 201);
  } catch (e) { next(e); }
});

export default router;
