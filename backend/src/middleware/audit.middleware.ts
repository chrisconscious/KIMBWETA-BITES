import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../database/prisma';
import { logger } from '../config/logger';

/**
 * Audit log middleware factory — writes to audit_logs after the response is sent.
 * Usage: router.post('/', auditLog('product.created', 'product'), controller)
 */
export function auditLog(action: string, entityType?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    res.on('finish', () => {
      // Only log successful mutations (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        prisma.auditLog
          .create({
            data: {
              userId: authReq.user?.id,
              action,
              entityType: entityType ?? null,
              campusId: authReq.user?.campusId ?? null,
              ipAddress: req.ip ?? null,
              metadata: {
                method: req.method,
                url: req.url,
                body: sanitizeBody(req.body as Record<string, unknown>),
              } as any,
            },
          })
          .catch((err) => logger.warn({ err }, 'Audit log write failed'));
      }
    });

    next();
  };
}

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sensitive = ['password', 'passwordHash', 'otp', 'code', 'token'];
  const clean = { ...body };
  for (const key of sensitive) {
    if (key in clean) clean[key] = '[REDACTED]';
  }
  return clean;
}
