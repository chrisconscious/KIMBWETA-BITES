import { z } from 'zod';

export const createOrderSchema = z.object({
  campusId: z.string().min(1, 'Campus is required'),
  paymentMethod: z.enum(['CASH', 'MOBILE']),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationText: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1, 'At least one item is required')
    .max(20, 'Maximum 20 items per order'),
}).refine(
  (data) => data.locationLat !== undefined || data.locationText,
  { message: 'Provide either GPS coordinates or location text', path: ['locationText'] }
);

export const updateOrderStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED']),
  cancellationReason: z.string().max(500).optional(),
  riderNotes: z.string().max(500).optional(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  campusId: z.string().uuid().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
