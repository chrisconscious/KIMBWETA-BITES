import { z } from 'zod';

// Accept both E.164 (+255...) and local Tanzanian format (07...)
const phoneSchema = z
  .string()
  .regex(/^(\+?255|0)\d{9}$/, 'Phone must be a valid Tanzanian number (e.g., 0757744555 or +255757744555)');

export const registerSchema = z.object({
  name: z.string().min(2).max(150).trim(),
  phoneNumber: phoneSchema,
  email: z.string().email().optional(),
  role: z.enum(['customer', 'admin']).default('customer'),
  password: z.string().min(6).optional(),
  campusId: z.string().uuid().optional(),
});

export const sendOtpSchema = z.object({
  phoneNumber: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phoneNumber: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const loginSchema = z.object({
  phoneNumber: phoneSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type SendOtpDto = z.infer<typeof sendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
