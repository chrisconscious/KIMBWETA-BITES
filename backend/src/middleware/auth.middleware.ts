import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error.middleware';
import { prisma } from '../database/prisma';
import { logger } from '../config/logger';
import type { UserRole } from '@prisma/client';

interface JwtPayload {
  sub: string;
  role: UserRole;
  campusId?: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole; campusId?: string };
    }
  }
}

/** Optional auth — attaches user if valid token present, but never rejects */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role, campusId: payload.campusId };
  } catch { /* ignore invalid tokens */ }
  next();
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    logger.warn({ path: req.path, method: req.method, ip: req.ip }, 'Authentication failed: no Bearer token');
    return next(new AppError('No token provided', 401));
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role, campusId: payload.campusId };
    logger.debug({ userId: payload.sub, role: payload.role, path: req.path }, 'Authenticated');
    next();
  } catch (err: any) {
    logger.warn({ path: req.path, method: req.method, error: err.message }, 'Authentication failed: invalid token');
    next(new AppError('Invalid or expired token', 401));
  }
}

/** Require one or more roles. Checks are OR'd (any of the roles passes). */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Not authenticated', 401));
    if (!roles.includes(req.user.role)) {
      logger.warn({ userId: req.user.id, userRole: req.user.role, requiredRoles: roles, path: req.path, method: req.method }, 'Authorization failed: role not permitted');
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}

export const authorize = requireRole;
