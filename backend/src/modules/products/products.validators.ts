import { z } from 'zod';

export const createProductSchema = z.object({
  name:             z.string().min(2).max(120),
  description:      z.string().max(500).optional(),
  price:            z.coerce.number().int().min(1).max(1000000),
  categoryId:       z.string().uuid().optional(),
  campusId:         z.string().uuid().optional(),
  quantity:         z.coerce.number().int().min(0).optional(),
  imageUrl:         z.string().optional(),
  initialStock:     z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(1).optional(),
});

export const updateProductSchema = z.object({
  name:        z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  price:       z.coerce.number().int().min(1).optional(),
  categoryId:  z.string().uuid().optional(),
  imageUrl:    z.string().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured:  z.boolean().optional(),
});

export const reviewProductSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  note:   z.string().max(300).optional(),
});

export const updateStockSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export const approveProductSchema = z.object({
  action:        z.enum(['approve', 'reject']),
  rejectionNote: z.string().max(300).optional(),
});

export const productQuerySchema = z.object({
  page:       z.coerce.number().int().min(1).optional().default(1),
  limit:      z.coerce.number().int().min(1).max(100).optional().default(20),
  status:     z.string().optional(),
  campusId:   z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search:     z.string().optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ReviewProductDto = z.infer<typeof reviewProductSchema>;
export type UpdateStockDto   = z.infer<typeof updateStockSchema>;
export type ApproveProductDto = z.infer<typeof approveProductSchema>;
export type ProductQueryDto   = z.infer<typeof productQuerySchema>;