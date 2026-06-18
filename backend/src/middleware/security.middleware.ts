import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { env } from '../config/env';
import { AppError } from './error.middleware';
import { logger } from '../config/logger';

// ── In-memory brute-force tracker ──────────────────────────────

interface AttemptEntry {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

export const loginAttempts = new Map<string, AttemptEntry>();

function getKey(phone: string, ip: string): string {
  return `${phone}::${ip}`;
}

function recordFailedAttempt(phone: string, ip: string): boolean {
  const key = getKey(phone, ip);
  const now = Date.now();
  const windowMs = env.LOGIN_LOCKOUT_MINUTES * 60 * 1000;
  const entry = loginAttempts.get(key);

  if (entry && (now - entry.lastAttempt) > windowMs) {
    loginAttempts.set(key, { count: 1, lastAttempt: now, lockedUntil: 0 });
    return false;
  }

  const count = (entry ? entry.count : 0) + 1;
  const locked = count >= env.LOGIN_MAX_ATTEMPTS ? now + windowMs : 0;
  loginAttempts.set(key, { count, lastAttempt: now, lockedUntil: locked });

  if (locked) {
    logger.warn({ phone, ip, attempts: count, lockoutMinutes: env.LOGIN_LOCKOUT_MINUTES },
      'Account locked due to too many failed login attempts');
  }
  return locked !== 0;
}

function isLocked(phone: string, ip: string): boolean {
  const key = getKey(phone, ip);
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) return true;
  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
    loginAttempts.delete(key);
  }
  return false;
}

function clearAttempts(phone: string, ip: string): void {
  const key = getKey(phone, ip);
  loginAttempts.delete(key);
}

export { recordFailedAttempt, clearAttempts };

/**
 * Brute-force protection middleware for login endpoints.
 */
export function bruteForceProtection(req: Request, _res: Response, next: NextFunction): void {
  const phone = (req.body || {}).phoneNumber || '';
  const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
  if (isLocked(phone, ip)) {
    logger.warn({ phone, ip }, 'Login blocked - account temporarily locked');
    return next(new AppError(`Too many login attempts. Try again in ${env.LOGIN_LOCKOUT_MINUTES} minutes.`, 429));
  }
  next();
}

// ── XSS Sanitization ───────────────────────────────────────────

const SENSITIVE_KEYS = new Set(['password', 'passwordHash', 'otp', 'token', 'refreshToken', 'secret']);

function sanitizeValue(val: unknown): unknown {
  if (typeof val === 'string') {
    return val
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val && typeof val === 'object') return sanitizeObject(val as Record<string, unknown>);
  return val;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    out[key] = SENSITIVE_KEYS.has(key) ? val : sanitizeValue(val);
  }
  return out;
}

/**
 * Middleware: sanitizes req.body, req.query, and req.params
 * to prevent stored/reflected XSS attacks.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') req.body = sanitizeObject(req.body as Record<string, unknown>);
  if (req.query && typeof req.query === 'object') req.query = sanitizeObject(req.query as unknown as Record<string, unknown>) as any;
  if (req.params && typeof req.params === 'object') req.params = sanitizeObject(req.params as unknown as Record<string, unknown>) as any;
  next();
}

// ── Idempotency ────────────────────────────────────────────────

const idempotencyStore = new Map<string, { status: number; body: unknown; ts: number }>();

/**
 * Middleware: checks Idempotency-Key header.
 * If the same key was seen within TTL, returns the cached response.
 */
export function idempotency(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['idempotency-key'];
  if (!key || typeof key !== 'string' || key.length < 8) {
    next();
    return;
  }
  const hash = createHash('sha256').update(key).digest('hex');
  const cached = idempotencyStore.get(hash);

  if (cached && (Date.now() - cached.ts) < env.IDEMPOTENCY_TTL_MINUTES * 60 * 1000) {
    logger.debug({ hash }, 'Idempotency hit — returning cached response');
    res.status(cached.status).json(cached.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    idempotencyStore.set(hash, { status: res.statusCode, body, ts: Date.now() });
    return originalJson(body);
  } as typeof res.json;
  next();
}
