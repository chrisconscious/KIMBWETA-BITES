import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const { orderId, rating, feedbackCategory, feedbackMessage } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'DELIVERED') throw new AppError('Order must be delivered to provide feedback', 400);
    const existing = await prisma.customerFeedback.findFirst({ where: { orderId, feedbackType: 'delivery' } });
    if (existing) throw new AppError('Feedback already submitted for this order', 400);
    const feedback = await prisma.customerFeedback.create({
      data: { userId: req.user!.id, orderId, productId: null, campusId: order.campusId, feedbackType: 'delivery', rating, feedbackCategory, feedbackMessage },
    });
    sendSuccess(res, feedback, 'Feedback submitted', 201);
  } catch (e) { next(e); }
});

router.post('/cancellation', async (req, res, next) => {
  try {
    const { orderId, reason, message } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'CANCELLED') throw new AppError('Order must be cancelled to submit cancellation feedback', 400);
    const existing = await prisma.customerFeedback.findFirst({ where: { orderId, feedbackType: 'cancellation' } });
    if (existing) throw new AppError('Cancellation feedback already submitted', 400);
    const feedback = await prisma.customerFeedback.create({
      data: { userId: req.user!.id, orderId, campusId: order.campusId, feedbackType: 'cancellation', feedbackCategory: reason, feedbackMessage: message },
    });
    sendSuccess(res, feedback, 'Cancellation feedback submitted', 201);
  } catch (e) { next(e); }
});

router.post('/recommend', async (req, res, next) => {
  try {
    const { orderId, recommend } = req.body;
    if (!['YES','NO','MAYBE'].includes(recommend)) throw new AppError('Invalid recommendation', 400);
    const feedback = await prisma.customerFeedback.findFirst({ where: { orderId, feedbackType: 'delivery' } });
    if (!feedback) throw new AppError('No delivery feedback found for this order', 404);
    const updated = await prisma.customerFeedback.update({ where: { id: feedback.id }, data: { recommend } });
    sendSuccess(res, updated, 'Recommendation saved');
  } catch (e) { next(e); }
});

export default router;
