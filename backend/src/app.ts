import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { prisma } from './database/prisma';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { sanitizeInput } from './middleware/security.middleware';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import productsRoutes from './modules/products/products.routes';
import ordersRoutes from './modules/orders/orders.routes';
import adsRoutes from './modules/ads/ads.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import campusesRoutes from './modules/campuses/campuses.routes';
import ridersRoutes from './modules/delivery-riders/riders.routes';
import paymentRoutes from './modules/payment-details/payment.routes';
import socialRoutes from './modules/social-links/social.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import superAdminRoutes from './modules/super-admin/super-admin.routes';
import settingsRoutes from './modules/settings/settings.routes';
import sharesRoutes from './modules/shares/shares.routes';
import feedbackRoutes from './modules/feedback/feedback.routes';
import productRequestsRoutes from './modules/product-requests/product-requests.routes';
import discoveryRoutes from './modules/discovery/discovery.routes';
import savedItemsRoutes from './modules/saved-items/savedItems.routes';
import collectionsRoutes from './modules/collections/collections.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import followingRoutes from './modules/following/following.routes';
import orderExtensionRoutes from './modules/order-extension/orderExtension.routes';
import discoveryAnalyticsRoutes from './modules/discovery-analytics/discoveryAnalytics.routes';
import superAdminAnalyticsRoutes from './modules/super-admin-analytics/superAdminAnalytics.routes';

function createRoleLimiter(maxRequests: number, roleName: string) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: `Rate limit exceeded for ${roleName}. Try again later.` },
    keyGenerator: (req) => {
      const role = (req as any).user?.role || 'anonymous';
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      return `${role}::${ip}`;
    },
    skip: (req) => req.url === '/health',
  });
}

export function createApp(): Application {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.socket.io"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://placehold.co"],
        connectSrc: ["'self'", "ws://localhost:3000", "wss://localhost:3000", "http://localhost:3000", "https://cdn.socket.io"],
      },
    },
  }));

  app.use(cors({
    origin: (origin, callback) => {
      const allowed = env.CORS_ORIGINS.split(',').map((o) => o.trim());
      if (!origin || allowed.includes('*') || allowed.includes(origin)) callback(null, true);
      else callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Idempotency-Key'],
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
      skip: (req) => req.url === '/health',
    }));
  }

  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Slow down.' },
    skip: (req) => req.url === '/health',
  }));

  app.get('/health', async (_req: Request, res: Response) => {
    const checks: Record<string, string> = {};
    let healthy = true;

    try {
      await prisma.$executeRaw`SELECT 1`;
      checks.database = 'connected';
    } catch {
      checks.database = 'disconnected';
      healthy = false;
    }

    checks.uploadDirectory = 'cloudinary';
    checks.bruteForceLocks = '0';

    const statusCode = healthy ? 200 : 503;
    res.status(statusCode).json({
      status: healthy ? 'healthy' : 'degraded',
      service: 'kimbweta-api',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      details: checks,
    });
  });

  // XSS input sanitization — applied globally
  app.use(sanitizeInput);

  const frontendPath = path.resolve(__dirname, '..', '..', 'frontend');
  app.use(express.static(frontendPath));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'KIMBWETA BITES API v2.0.0',
      docs: 'API documentation available at /docs',
      frontend: 'http://localhost:3001',
      health: '/health'
    });
  });

  const api = env.API_PREFIX ?? '/api/v1';

  app.use(`${api}/auth`, authRoutes);
  app.use(`${api}/users`, usersRoutes);
  app.use(`${api}/products`, productsRoutes);
  app.use(`${api}/orders`, ordersRoutes);
  app.use(`${api}/ads`, adsRoutes);
  app.use(`${api}/analytics`, analyticsRoutes);
  app.use(`${api}/notifications`, notificationsRoutes);
  app.use(`${api}/campuses`, campusesRoutes);
  app.use(`${api}/delivery-riders`, ridersRoutes);
  app.use(`${api}/payment-details`, paymentRoutes);
  app.use(`${api}/social-links`, socialRoutes);
  app.use(`${api}/categories`, categoriesRoutes);
  app.use(`${api}/super-admin`, superAdminRoutes);
  app.use(`${api}/settings`, settingsRoutes);
  app.use(`${api}/products`, sharesRoutes);
  app.use(`${api}/feedback`, feedbackRoutes);
  app.use(`${api}/product-requests`, productRequestsRoutes);
  app.use(`${api}/discovery`, discoveryRoutes);
  app.use(`${api}/saved-items`, savedItemsRoutes);
  app.use(`${api}/collections`, collectionsRoutes);
  app.use(`${api}/reviews`, reviewsRoutes);
  app.use(`${api}/following`, followingRoutes);
  app.use(`${api}/orders`, orderExtensionRoutes);
  app.use(`${api}/discover`, discoveryAnalyticsRoutes);
  app.use(`${api}/super-admin`, superAdminAnalyticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
