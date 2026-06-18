import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const { productName, message } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { campusId: true } });
    const request = await prisma.requestedProduct.create({
      data: { userId: req.user!.id, campusId: user?.campusId, productName, message },
    });
    sendSuccess(res, request, 'Product request submitted', 201);
  } catch (e) { next(e); }
});

export default router;
