import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(150).trim().optional(),
  email: z.string().email().optional().nullable(),
  profileImageUrl: z.string().url().optional().nullable(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
