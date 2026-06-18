import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { redisService, CacheKeys } from '../../services/redis.service';
import { env } from '../../config/env';
import type { CreateAdDto, UpdateAdDto } from './ads.validators';
import { AdEventType, AdStatus, AdMediaType, AdCtaType, AdDestination, AdPriority } from '@prisma/client';

export class AdsService {
  async createAd(dto: CreateAdDto, creatorId: string) {
    const ad = await prisma.ad.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        imageUrl: dto.imageUrl,
        videoUrl: dto.videoUrl ?? null,
        mediaType: (dto.mediaType as AdMediaType) ?? 'IMAGE',
        targetUrl: dto.targetUrl ?? null,
        ctaType: (dto.ctaType as AdCtaType) ?? 'ORDER_NOW',
        destination: (dto.destination as AdDestination) ?? 'HOMEPAGE',
        campusId: dto.campusId ?? null,
        priority: (dto.priority as AdPriority) ?? 'MEDIUM',
        status: (dto.status as AdStatus) ?? 'DRAFT',
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        impressionCap: dto.impressionCap ?? null,
        createdBy: creatorId,
      },
    });
    await redisService.delPattern('ads:*');
    return ad;
  }

  async updateAd(adId: string, dto: UpdateAdDto) {
    const existing = await prisma.ad.findFirst({ where: { id: adId, deletedAt: null } });
    if (!existing) throw new AppError('Ad not found', 404);

    const ad = await prisma.ad.update({
      where: { id: adId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
        ...(dto.mediaType !== undefined && { mediaType: dto.mediaType as AdMediaType }),
        ...(dto.targetUrl !== undefined && { targetUrl: dto.targetUrl }),
        ...(dto.ctaType !== undefined && { ctaType: dto.ctaType as AdCtaType }),
        ...(dto.destination !== undefined && { destination: dto.destination as AdDestination }),
        ...(dto.campusId !== undefined && { campusId: dto.campusId }),
        ...(dto.priority !== undefined && { priority: dto.priority as AdPriority }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.impressionCap !== undefined && { impressionCap: dto.impressionCap }),
      },
    });
    await redisService.delPattern('ads:*');
    return ad;
  }

  async deleteAd(adId: string) {
    const existing = await prisma.ad.findFirst({ where: { id: adId, deletedAt: null } });
    if (!existing) throw new AppError('Ad not found', 404);

    await prisma.ad.update({
      where: { id: adId },
      data: { deletedAt: new Date() },
    });
    await redisService.delPattern('ads:*');
  }

  async publishAd(adId: string) {
    const ad = await prisma.ad.findFirst({ where: { id: adId, deletedAt: null } });
    if (!ad) throw new AppError('Ad not found', 404);
    if (!ad.imageUrl) throw new AppError('Ad must have an image before publishing', 400);

    const updated = await prisma.ad.update({
      where: { id: adId },
      data: { status: 'PUBLISHED' as AdStatus, isActive: true },
    });
    await redisService.delPattern('ads:*');
    return updated;
  }

  async pauseAd(adId: string) {
    const existing = await prisma.ad.findFirst({ where: { id: adId, deletedAt: null } });
    if (!existing) throw new AppError('Ad not found', 404);

    const updated = await prisma.ad.update({
      where: { id: adId },
      data: { status: 'PAUSED' as AdStatus, isActive: false },
    });
    await redisService.delPattern('ads:*');
    return updated;
  }

  async getActiveAds(campusId?: string) {
    const cacheKey = CacheKeys.ads(campusId ?? 'global');
    const cached = await redisService.get(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const ads = await prisma.ad.findMany({
      where: {
        status: 'PUBLISHED' as AdStatus,
        isActive: true,
        deletedAt: null,
        OR: [
          { campusId: null },
          ...(campusId ? [{ campusId }] : []),
        ],
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    await redisService.set(cacheKey, ads, env.CACHE_TTL_ADS);
    return ads;
  }

  async trackEvent(adId: string, eventType: AdEventType, userId?: string, ip?: string, userAgent?: string) {
    const ad = await prisma.ad.findFirst({ where: { id: adId, isActive: true, deletedAt: null } });
    if (!ad) throw new AppError('Ad not found', 404);

    if (ad.impressionCap && eventType === 'VIEW') {
      const views = await prisma.adEvent.count({ where: { adId, eventType: 'VIEW' } });
      if (views >= ad.impressionCap) {
        await prisma.ad.update({ where: { id: adId }, data: { isActive: false } });
        await redisService.delPattern('ads:*');
        return { capped: true };
      }
    }

    await prisma.adEvent.create({
      data: { adId, userId: userId ?? null, eventType, ipAddress: ip ?? null, userAgent: userAgent ?? null },
    });

    await prisma.ad.update({
      where: { id: adId },
      data: eventType === 'VIEW' ? { views: { increment: 1 } } : { clicks: { increment: 1 } },
    });

    return { tracked: true };
  }

  async getAdPerformance(adId: string) {
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw new AppError('Ad not found', 404);

    const [views, clicks, dailyStats] = await Promise.all([
      prisma.adEvent.count({ where: { adId, eventType: 'VIEW' } }),
      prisma.adEvent.count({ where: { adId, eventType: 'CLICK' } }),
      prisma.adEvent.groupBy({
        by: ['eventType', 'createdAt'],
        where: { adId },
        _count: true,
      }),
    ]);

    return {
      ad,
      stats: {
        views,
        clicks,
        ctr: views > 0 ? ((clicks / views) * 100).toFixed(2) + '%' : '0%',
      },
      dailyStats,
    };
  }

  async listAds(filters?: { status?: string; destination?: string; campusId?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.status) where.status = filters.status as AdStatus;
    if (filters?.destination) where.destination = filters.destination as AdDestination;
    if (filters?.campusId) {
      where.OR = [{ campusId: filters.campusId }, { campusId: null }];
    }
    return prisma.ad.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: { campus: { select: { id: true, name: true } } },
    });
  }

  async toggleAd(adId: string, isActive: boolean) {
    const ad = await prisma.ad.update({ where: { id: adId }, data: { isActive } });
    await redisService.delPattern('ads:*');
    return ad;
  }

  async getAdAnalytics() {
    const [total, active, totalViews, totalClicks, byDestination, byStatus] = await Promise.all([
      prisma.ad.count({ where: { deletedAt: null } }),
      prisma.ad.count({ where: { isActive: true, deletedAt: null } }),
      prisma.ad.aggregate({ _sum: { views: true } }),
      prisma.ad.aggregate({ _sum: { clicks: true } }),
      prisma.ad.groupBy({ by: ['destination'], _count: true, where: { deletedAt: null } }),
      prisma.ad.groupBy({ by: ['status'], _count: true, where: { deletedAt: null } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      totalViews: totalViews._sum.views ?? 0,
      totalClicks: totalClicks._sum.clicks ?? 0,
      ctr: totalViews._sum.views && totalViews._sum.views > 0
        ? ((totalClicks._sum.clicks! / totalViews._sum.views) * 100).toFixed(2) + '%'
        : '0%',
      byDestination,
      byStatus,
    };
  }
}

export const adsService = new AdsService();
