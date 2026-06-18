import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { prisma } from '../../database/prisma';
import { sendSuccess } from '../../utils/response';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const links = await prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    // Return as object: { whatsapp: url, instagram: url, ... }
    const result: Record<string, string> = {};
    links.forEach(l => { result[l.platform] = l.url; });
    sendSuccess(res, result);
  } catch (e) { next(e); }
});

// Public endpoint returning all social links (unauthenticated, for frontend display)
router.get('/all', async (_req, res, next) => {
  try {
    const links = await prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    const result: Record<string, string> = {};
    links.forEach(l => { result[l.platform] = l.url; });
    sendSuccess(res, result);
  } catch (e) { next(e); }
});

router.post('/', authenticate, requireRole('super_admin'), async (req, res, next) => {
  try {
    const link = await prisma.socialLink.upsert({
      where: { platform: req.body.platform },
      update: { url: req.body.url, isActive: req.body.isActive ?? true },
      create: req.body,
    });
    sendSuccess(res, link, 'Social link updated');
  } catch (e) { next(e); }
});

router.patch('/:platform', authenticate, requireRole('super_admin'), async (req, res, next) => {
  try {
    const { url, isActive } = req.body;
    const link = await prisma.socialLink.update({
      where: { platform: req.params.platform },
      data: { ...(url !== undefined && { url }), ...(isActive !== undefined && { isActive }) },
    });
    sendSuccess(res, link, 'Social link updated');
  } catch (e) { next(e); }
});

router.delete('/:platform', authenticate, requireRole('super_admin'), async (req, res, next) => {
  try {
    await prisma.socialLink.update({
      where: { platform: req.params.platform },
      data: { isActive: false },
    });
    sendSuccess(res, null, 'Social link deactivated');
  } catch (e) { next(e); }
});

router.patch('/:platform/toggle', authenticate, requireRole('super_admin'), async (req, res, next) => {
  try {
    const link = await prisma.socialLink.findUnique({ where: { platform: req.params.platform } });
    if (!link) return sendSuccess(res, null, 'Social link not found');
    const updated = await prisma.socialLink.update({
      where: { platform: req.params.platform },
      data: { isActive: !link.isActive },
    });
    sendSuccess(res, updated, `Social link ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (e) { next(e); }
});

export default router;
