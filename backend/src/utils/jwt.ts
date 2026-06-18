import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { env } from '../config/env';
import type { UserRole } from '@prisma/client';

interface TokenPayload {
  sub: string;
  role: UserRole;
  campusId?: string;
}

export function generateTokenPair(userId: string, role: UserRole, campusId?: string) {
  const payload: TokenPayload = { sub: userId, role, ...(campusId ? { campusId } : {}) };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: (env.JWT_EXPIRES_IN ?? '15m') as any });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: (env.JWT_REFRESH_EXPIRES_IN ?? '7d') as any });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
