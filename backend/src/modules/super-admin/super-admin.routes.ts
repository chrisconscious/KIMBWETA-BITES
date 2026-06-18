import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

const router = Router();

// All super-admin routes require authentication
router.use(authenticate, requireRole('super_admin'));

// Dashboard analytics
router.get('/dashboard', async (_req, res, next) => {
  try {
    const [totalUsers, totalOrders, totalRevenue, pendingRiders, pendingProducts, activeCampuses] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: 'DELIVERED' } }),
      prisma.deliveryRider.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.product.count({ where: { status: 'PENDING', deletedAt: null } }),
      prisma.campus.count({ where: { isActive: true } }),
    ]);
    sendSuccess(res, {
      totalUsers, totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      pendingRiders, pendingProducts, activeCampuses,
    });
  } catch (e) { next(e); }
});

// Manage campus admins
router.post('/campus-admins', async (req, res, next) => {
  try {
    const { userId, campusId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    await prisma.user.update({ where: { id: userId }, data: { role: 'admin' } });
    const assignment = await prisma.campusAdmin.upsert({
      where: { userId_campusId: { userId, campusId } },
      update: { isActive: true, assignedBy: req.user!.id },
      create: { userId, campusId, isActive: true, assignedBy: req.user!.id },
    });
    sendSuccess(res, assignment, 'Campus admin assigned', 201);
  } catch (e) { next(e); }
});

router.delete('/campus-admins/:userId/:campusId', async (req, res, next) => {
  try {
    await prisma.campusAdmin.updateMany({
      where: { userId: req.params.userId, campusId: req.params.campusId },
      data: { isActive: false },
    });
    sendSuccess(res, null, 'Campus admin removed');
  } catch (e) { next(e); }
});

// Update campus limits
router.patch('/campuses/:id/limits', async (req, res, next) => {
  try {
    const campus = await prisma.campus.update({
      where: { id: req.params.id },
      data: { maxProducts: req.body.maxProducts, maxRiders: req.body.maxRiders },
    });
    sendSuccess(res, campus, 'Campus limits updated');
  } catch (e) { next(e); }
});

// User management
router.get('/users', async (req, res, next) => {
  try {
    const { role, status, campusId, search } = req.query as Record<string, string>;
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(role ? { role: role as any } : {}),
        ...(status ? { status: status as any } : {}),
        ...(campusId ? { campusId } : {}),
        ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { phoneNumber: { contains: search } }] } : {}),
      },
      select: { id: true, name: true, phoneNumber: true, email: true, role: true, status: true, createdAt: true, campusId: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    sendSuccess(res, users);
  } catch (e) { next(e); }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      select: { id: true, name: true, status: true },
    });
    sendSuccess(res, user, 'User status updated');
  } catch (e) { next(e); }
});

// Analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const { period = '7' } = req.query as Record<string, string>;
    const days = parseInt(period);
    const from = new Date();
    from.setDate(from.getDate() - days);

    const [ordersByDay, revenueByDay, revenueByStatus] = await Promise.all([
      prisma.$queryRaw<{day: string, count: bigint}[]>`
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM orders WHERE created_at >= ${from}
        GROUP BY day ORDER BY day
      `,
      prisma.$queryRaw<{day: string, total: bigint}[]>`
        SELECT DATE(created_at) as day, SUM(total_amount) as total
        FROM orders WHERE created_at >= ${from} AND status = 'DELIVERED'
        GROUP BY day ORDER BY day
      `,
      prisma.order.groupBy({ by: ['status'], _count: true }),
    ]);

    // Convert BigInt fields to Number for JSON serialization safety
    const sanitizedOrdersByDay = ordersByDay.map(o => ({ day: o.day, count: Number(o.count) }));
    const sanitizedRevenueByDay = revenueByDay.map(r => ({ day: r.day, total: Number(r.total) }));

    sendSuccess(res, { ordersByDay: sanitizedOrdersByDay, revenueByDay: sanitizedRevenueByDay, revenueByStatus });
  } catch (e) { next(e); }
});

// ── Share Analytics ────────────────────────────────────────────────
router.get('/share-analytics', async (_req, res, next) => {
  try {
    const [totalShares, byPlatform, topProducts, topCampuses, daily, weekly, monthly] = await Promise.all([
      prisma.productShare.count(),
      prisma.productShare.groupBy({ by: ['sharePlatform'], _count: true, orderBy: { _count: { sharePlatform: 'desc' } } }),
      prisma.productShare.groupBy({ by: ['productId'], _count: true, orderBy: { _count: { productId: 'desc' } }, take: 10 }),
      prisma.productShare.groupBy({ by: ['campusId'], _count: true, orderBy: { _count: { campusId: 'desc' } }, take: 10 }),
      prisma.$queryRaw<{day: string, count: bigint}[]>`SELECT DATE(shared_at) as day, COUNT(*)::int as count FROM product_shares WHERE shared_at >= NOW() - INTERVAL '7 days' GROUP BY day ORDER BY day`,
      prisma.$queryRaw<{week: string, count: bigint}[]>`SELECT DATE_TRUNC('week', shared_at) as week, COUNT(*)::int as count FROM product_shares WHERE shared_at >= NOW() - INTERVAL '30 days' GROUP BY week ORDER BY week`,
      prisma.$queryRaw<{month: string, count: bigint}[]>`SELECT DATE_TRUNC('month', shared_at) as month, COUNT(*)::int as count FROM product_shares WHERE shared_at >= NOW() - INTERVAL '6 months' GROUP BY month ORDER BY month`,
    ]);
    sendSuccess(res, { totalShares, byPlatform, topProducts, topCampuses, daily, weekly, monthly });
  } catch (e) { next(e); }
});

// ── Customer Insights / Feedback Analytics ─────────────────────────
router.get('/customer-insights', async (_req, res, next) => {
  try {
    const [totalFeedback, avgRating, ratingDist, feedbackByCategory, cancellationReasons, topComplaints, topPraised] = await Promise.all([
      prisma.customerFeedback.count(),
      prisma.customerFeedback.aggregate({ _avg: { rating: true }, where: { feedbackType: 'delivery', rating: { not: null } } }),
      prisma.customerFeedback.groupBy({ by: ['rating'], _count: true, where: { feedbackType: 'delivery', rating: { not: null } }, orderBy: { _count: { rating: 'desc' } } }),
      prisma.customerFeedback.groupBy({ by: ['feedbackCategory'], _count: true, where: { feedbackType: 'delivery', feedbackCategory: { not: null } }, orderBy: { _count: { feedbackCategory: 'desc' } } }),
      prisma.customerFeedback.groupBy({ by: ['feedbackCategory'], _count: true, where: { feedbackType: 'cancellation' }, orderBy: { _count: { feedbackCategory: 'desc' } } }),
      prisma.customerFeedback.findMany({ where: { feedbackType: 'delivery', rating: { lte: 2 }, feedbackMessage: { not: null } }, select: { feedbackMessage: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.customerFeedback.findMany({ where: { feedbackType: 'delivery', rating: { gte: 4 }, feedbackMessage: { not: null } }, select: { feedbackMessage: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    // Recommendations
    const recommendCounts = await prisma.customerFeedback.groupBy({ by: ['recommend'], _count: true, where: { recommend: { not: null } } });

    // Campus comparison
    const campusRatings = await prisma.customerFeedback.groupBy({ by: ['campusId'], _avg: { rating: true }, _count: true, where: { feedbackType: 'delivery', rating: { not: null } } });

    // Feedback trends (last 30 days)
    const feedbackTrends = await prisma.$queryRaw<{day: string, total: bigint, positive: bigint, negative: bigint}[]>`
      SELECT d.day, COALESCE(t.total,0) as total, COALESCE(p.positive,0) as positive, COALESCE(n.negative,0) as negative
      FROM (SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day')::date as day) d
      LEFT JOIN (SELECT DATE(created_at) as day, COUNT(*) as total FROM customer_feedback WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' GROUP BY day) t ON d.day = t.day
      LEFT JOIN (SELECT DATE(created_at) as day, COUNT(*) as positive FROM customer_feedback WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND rating >= 4 GROUP BY day) p ON d.day = p.day
      LEFT JOIN (SELECT DATE(created_at) as day, COUNT(*) as negative FROM customer_feedback WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND rating <= 2 GROUP BY day) n ON d.day = n.day
      ORDER BY d.day
    `;

    // Recommendation rate
    const totalRecommend = recommendCounts.reduce((s, r) => s + r._count, 0);
    const yesCount = recommendCounts.find(r => r.recommend === 'YES')?._count ?? 0;
    const recommendationRate = totalRecommend > 0 ? (yesCount / totalRecommend) * 100 : 0;

    // Happy/unhappy percentages
    const totalRated = ratingDist.reduce((s, r) => s + r._count, 0);
    const happy = ratingDist.filter(r => r.rating && r.rating >= 4).reduce((s, r) => s + r._count, 0);
    const neutral = ratingDist.filter(r => r.rating === 3).reduce((s, r) => s + r._count, 0);
    const unhappy = ratingDist.filter(r => r.rating && r.rating <= 2).reduce((s, r) => s + r._count, 0);

    sendSuccess(res, {
      summary: {
        totalFeedback, avgRating: avgRating._avg.rating ?? 0,
        happyPct: totalRated > 0 ? Math.round(happy / totalRated * 100) : 0,
        neutralPct: totalRated > 0 ? Math.round(neutral / totalRated * 100) : 0,
        unhappyPct: totalRated > 0 ? Math.round(unhappy / totalRated * 100) : 0,
        recommendationRate: Math.round(recommendationRate),
      },
      ratingDistribution: ratingDist,
      feedbackCategories: feedbackByCategory,
      cancellationReasons: cancellationReasons,
      topComplaints, topPraised,
      recommendCounts: recommendCounts,
      campusRatings,
      feedbackTrends,
    });
  } catch (e) { next(e); }
});

// ── Product Requests Analytics ─────────────────────────────────────
router.get('/product-requests', async (req, res, next) => {
  try {
    const { campusId } = req.query as Record<string, string>;
    const requests = await prisma.requestedProduct.findMany({
      where: campusId ? { campusId } : {},
      include: { user: { select: { name: true, phoneNumber: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const mostRequested = await prisma.requestedProduct.groupBy({ by: ['productName'], _count: true, orderBy: { _count: { productName: 'desc' } }, take: 20 });
    const byCampus = await prisma.requestedProduct.groupBy({ by: ['campusId'], _count: true, orderBy: { _count: { campusId: 'desc' } } });
    sendSuccess(res, { requests, mostRequested, byCampus });
  } catch (e) { next(e); }
});

export default router;
