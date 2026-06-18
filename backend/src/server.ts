import 'dotenv/config';
import http from 'http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './database/prisma';
import { redisService } from './services/redis.service';
import { socketService } from './sockets/socket.service';
import { logger } from './config/logger';
import { env } from './config/env';

async function withRetry(fn: () => Promise<void>, label: string, maxRetries = 10, baseDelayMs = 1000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fn();
      logger.info({ label }, 'Connected successfully');
      return;
    } catch (err: any) {
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), 30000);
      logger.warn({ label, attempt, maxRetries, delay, err: err.message }, 'Connection failed, retrying');
      if (attempt === maxRetries) {
        logger.error({ label }, 'Max retries reached');
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function bootstrap(): Promise<void> {
  // 1. Connect to PostgreSQL (with exponential backoff)
  await withRetry(() => connectDatabase(), 'PostgreSQL');

  // 2. Connect to Redis (graceful fallback to memory)
  await redisService.connect();

  // 3. Build Express app
  const app = createApp();

  // 4. Create HTTP server
  const httpServer = http.createServer(app);

  // 5. Initialize Socket.io
  try {
    await socketService.initialize(httpServer);
  } catch (err) {
    logger.warn('Socket.io initialization failed — continuing without sockets');
  }

  // 6. Start listening
  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV, api: `http://localhost:${env.PORT}${env.API_PREFIX}` }, 'KIMBWETA API is running');
    console.log(`\n✅ KIMBWETA BITES API running at http://localhost:${env.PORT}`);
    console.log(`   API Base: http://localhost:${env.PORT}${env.API_PREFIX}`);
    console.log(`   Health:   http://localhost:${env.PORT}/health\n`);
  });

  // Graceful shutdown
  async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, 'Shutdown signal received');
    httpServer.close(async () => {
      await disconnectDatabase();
      await redisService.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 15_000);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT',  () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    console.error('Uncaught exception:', err);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
