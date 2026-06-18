import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../config/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });

if (env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    if (e.duration > 200) {
      logger.warn({ query: e.query, duration: e.duration }, 'Slow query detected');
    }
  });
}

prisma.$on('error' as never, (e: any) => {
  logger.error({ message: e.message }, 'Prisma error');
});

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
  } catch (err: any) {
    logger.error({ err: err.message }, 'Failed to connect to PostgreSQL');
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('PostgreSQL disconnected');
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Error disconnecting from PostgreSQL');
  }
}
