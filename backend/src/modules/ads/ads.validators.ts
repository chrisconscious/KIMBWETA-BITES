import { z } from 'zod';

export const createAdSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url(),
  videoUrl: z.string().url().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO']).optional(),
  targetUrl: z.string().url().optional(),
  ctaType: z.enum(['ORDER_NOW', 'SHOP_NOW', 'LEARN_MORE', 'EXPLORE']).optional(),
  destination: z.enum(['HOMEPAGE', 'PRODUCT_SECTION', 'BANNER_SECTION', 'FLOATING_CARD']).optional(),
  campusId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'PAUSED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  impressionCap: z.number().int().min(1).optional(),
});

export const updateAdSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO']).optional(),
  targetUrl: z.string().url().optional(),
  ctaType: z.enum(['ORDER_NOW', 'SHOP_NOW', 'LEARN_MORE', 'EXPLORE']).optional(),
  destination: z.enum(['HOMEPAGE', 'PRODUCT_SECTION', 'BANNER_SECTION', 'FLOATING_CARD']).optional(),
  campusId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  impressionCap: z.number().int().min(1).optional(),
});

export const trackAdEventSchema = z.object({
  eventType: z.enum(['VIEW', 'CLICK']),
});

export type CreateAdDto = z.infer<typeof createAdSchema>;
export type UpdateAdDto = z.infer<typeof updateAdSchema>;
