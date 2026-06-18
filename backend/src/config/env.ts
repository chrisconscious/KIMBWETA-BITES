import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV:                z.enum(['development', 'production', 'test']).default('development'),
  PORT:                    z.coerce.number().default(3000),
  API_PREFIX:              z.string().default('/api/v1'),
  DATABASE_URL:            z.string().url(),
  JWT_SECRET:              z.string().min(32),
  JWT_EXPIRES_IN:          z.string().default('15m'),
  JWT_REFRESH_SECRET:      z.string().min(32),
  JWT_REFRESH_EXPIRES_IN:  z.string().default('7d'),
  REDIS_URL:               z.string().optional(),
  CORS_ORIGINS:            z.string().default('http://localhost:3001,http://localhost:5500,http://localhost:8000,http://127.0.0.1:5500,http://127.0.0.1:3001'),
  RATE_LIMIT_WINDOW_MS:    z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(500),
  OTP_RATE_LIMIT_MAX:      z.coerce.number().default(10),
  OTP_EXPIRY_MINUTES:      z.coerce.number().default(10),
  OTP_LENGTH:              z.coerce.number().default(6),
  OTP_MOCK_MODE:           z.string().transform(v => v === 'true').default('true'),
  UPLOAD_DIR:              z.string().default('uploads'),
  MAX_FILE_SIZE_MB:        z.coerce.number().default(5),
  LOG_LEVEL:               z.string().default('info'),
  SMS_PROVIDER:            z.string().default('console'),
  CACHE_TTL_ADS:           z.coerce.number().default(300),
  CACHE_TTL_PRODUCTS:      z.coerce.number().default(60),
  // Brute-force protection
  LOGIN_MAX_ATTEMPTS:      z.coerce.number().default(5),
  LOGIN_LOCKOUT_MINUTES:   z.coerce.number().default(15),
  // Per-role rate limits (requests per window)
  RATE_LIMIT_ANON:         z.coerce.number().default(30),
  RATE_LIMIT_CUSTOMER:     z.coerce.number().default(100),
  RATE_LIMIT_ADMIN:        z.coerce.number().default(300),
  RATE_LIMIT_SUPER_ADMIN:  z.coerce.number().default(500),
  // File upload limits
  MAX_VIDEO_SIZE_MB:       z.coerce.number().default(50),
  // Backup
  BACKUP_DIR:              z.string().default('./backup'),
  // Idempotency
  IDEMPOTENCY_TTL_MINUTES: z.coerce.number().default(60),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
