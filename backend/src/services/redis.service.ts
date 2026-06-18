import { env } from '../config/env';
import { logger } from '../config/logger';

// ── In-memory cache (always available) ──────────────────────────
class MemoryCache {
  private store = new Map<string, { value: any; expiry: number }>();

  get(key: string): any {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) { this.store.delete(key); return null; }
    return entry.value;
  }

  set(key: string, value: any, ttlSeconds = 300): void {
    this.store.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
  }

  del(key: string): void { this.store.delete(key); }

  delPattern(pattern: string): void {
    const prefix = pattern.replace(/\*.*$/, '');
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }
}

// ── Redis service with ioredis + memory fallback ─────────────────
class RedisService {
  private client: any = null;
  private memory = new MemoryCache();
  private useMemory = true;

  async connect(): Promise<void> {
    if (!env.REDIS_URL) {
      logger.info('Redis URL not configured — using in-memory cache');
      return;
    }
    try {
      const IORedis = await import('ioredis');
      this.client = new IORedis.default(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 3000 });
      await this.client.connect();
      this.useMemory = false;
      logger.info('✅ Redis connected');
    } catch {
      logger.warn('Redis unavailable — using in-memory cache fallback');
      this.useMemory = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) { await this.client.quit().catch(() => {}); }
  }

  async get(key: string): Promise<any> {
    if (this.useMemory) return this.memory.get(key);
    try {
      const val = await this.client.get(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    if (this.useMemory) { this.memory.set(key, value, ttlSeconds); return; }
    try { await this.client.setex(key, ttlSeconds, JSON.stringify(value)); } catch {}
  }

  async del(key: string): Promise<void> {
    if (this.useMemory) { this.memory.del(key); return; }
    try { await this.client.del(key); } catch {}
  }

  async delPattern(pattern: string): Promise<void> {
    if (this.useMemory) { this.memory.delPattern(pattern); return; }
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length) await this.client.del(...keys);
    } catch {}
  }
}

export const CacheKeys = {
  ads:        (campusId: string) => `ads:${campusId}`,
  product:    (id: string) => `product:${id}`,
  products:   (campusId: string, page = 1) => `products:${campusId}:page:${page}`,
  categories: () => 'categories:all',
};

export const redisService = new RedisService();
