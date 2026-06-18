import { z } from 'zod';

export const trackEventSchema = z.object({
  events: z.array(z.object({
    eventType: z.string().min(1).max(50),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    idempotencyKey: z.string().optional(),
  })).min(1).max(100),
});

export const shareEventSchema = z.object({
  productId: z.string().uuid(),
  recipientUserId: z.string().uuid(),
});

export const shareClickSchema = z.object({
  shareId: z.string().uuid(),
});

export const sharePurchaseSchema = z.object({
  shareId: z.string().uuid(),
});

export const discoveryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  campusId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  period: z.enum(['today', 'week', 'month']).optional().default('week'),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export const analyticsPeriodSchema = z.object({
  period: z.enum(['today', 'week', 'month']).optional().default('week'),
});
