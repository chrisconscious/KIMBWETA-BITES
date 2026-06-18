import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
  visibility: z.enum(['PUBLIC', 'CAMPUS']).optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
  visibility: z.enum(['PUBLIC', 'CAMPUS']).optional(),
  isActive: z.boolean().optional(),
});

export const reorderCategoriesSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })).min(1),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
