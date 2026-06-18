import { z } from 'zod';

export const createCampusSchema = z.object({
  name: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  region: z.enum(['DAR_ES_SALAAM', 'ARUSHA', 'MWANZA', 'DODOMA', 'MBEYA', 'MOROGORO', 'IRINGA', 'KIGOMA', 'TANGA', 'ZANZIBAR', 'PWANI']),
  shortCode: z.string().min(2).max(10),
  addressText: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  maxProducts: z.coerce.number().int().min(0).optional().default(100),
  maxRiders: z.coerce.number().int().min(0).optional().default(20),
});

export const updateCampusSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(255).optional(),
  region: z.enum(['DAR_ES_SALAAM', 'ARUSHA', 'MWANZA', 'DODOMA', 'MBEYA', 'MOROGORO', 'IRINGA', 'KIGOMA', 'TANGA', 'ZANZIBAR', 'PWANI']).optional(),
  shortCode: z.string().min(2).max(10).optional(),
  addressText: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  maxProducts: z.coerce.number().int().min(0).optional(),
  maxRiders: z.coerce.number().int().min(0).optional(),
});
