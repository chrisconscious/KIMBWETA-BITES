import { prisma } from '../../database/prisma';

interface RawEvent {
  category_id: string;
  event_type: string;
  event_count: number;
  days_ago: number;
}

interface UserCategoryInterest {
  category_id: string;
  category_name: string | null;
  category_slug: string | null;
  interest_score: number;
  view_count: number;
  click_count: number;
  purchase_count: number;
  share_count: number;
  favorite_count: number;
  cart_add_count: number;
  review_count: number;
  order_completed_count: number;
}

interface RawProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | bigint;
  image_url: string | null;
  campus_id: string;
  created_at: Date;
  category_id: string | null;
  category_name: string | null;
  stock: number | null;
  avg_rating: number | null;
  trending_score?: number | null;
  popularity?: number | null;
  trending_direction?: string;
  recent_views?: number | bigint;
  recent_purchases?: number | bigint;
  recent_shares?: number | bigint;
  share_count?: number | bigint;
  weekly_shares?: number | bigint;
  daily_shares?: number | bigint;
  growth_pct?: number | bigint;
  purchase_count?: number | bigint;
  total_items_ordered?: number | bigint;
  revenue_generated?: number | bigint;
  review_count?: number | bigint;
  positive_reviews?: number | bigint;
  positive_ratio?: number | bigint;
  click_count?: number | bigint;
}

interface InterestCacheEntry {
  data: InterestResult[];
  ts: number;
}

interface InterestResult {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  interestScore: number;
  eventCounts: {
    views: number;
    clicks: number;
    purchases: number;
    shares: number;
    favorites: number;
    cartAdds: number;
    reviews: number;
    orders: number;
  };
}

interface ProductResult {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  campusId: string;
  createdAt?: Date;
  category: { id: string | null; name: string | null };
  stock?: number;
  avgRating?: number;
  trendingScore?: number;
  popularity?: number;
  trendingDirection?: string;
  eventCounts?: {
    views: number;
    purchases: number;
    shares: number;
  };
  shareCount?: number;
  weeklyShares?: number;
  dailyShares?: number;
  growthPct?: number;
  purchaseCount?: number;
  totalItemsOrdered?: number;
  revenueGenerated?: number;
  reviewCount?: number;
  positiveReviews?: number;
  positiveRatio?: number;
  clickCount?: number;
}

class DiscoveryService {
  private _interestCache = new Map<string, InterestCacheEntry>();
  private _eventCountCache = new Map<string, boolean>();

  async trackEvents(userId: string | null, events: any[], ipAddress: string) {
    const results = [];
    const now = new Date();

    for (const event of events) {
      const dedupKey = event.idempotencyKey || `${userId || ipAddress}:${event.eventType}:${event.entityId || ''}:${event.entityType || ''}`;
      const cacheKey = `dedup:${dedupKey}`;
      if (this._eventCountCache.has(cacheKey)) continue;
      this._eventCountCache.set(cacheKey, true);
      setTimeout(() => this._eventCountCache.delete(cacheKey), 60000);

      const metadata: Record<string, any> = {};
      if (event.entityType) metadata.entityType = event.entityType;
      if (event.entityId) metadata.entityId = event.entityId;
      if (event.metadata) Object.assign(metadata, event.metadata);

      const result = await prisma.analyticsEvent.create({
        data: {
          userId: userId || null,
          sessionId: ipAddress,
          eventType: event.eventType,
          metadata: metadata,
          ipAddress: ipAddress || null,
          createdAt: now,
        },
      });
      results.push(result);
    }
    return results;
  }

  async scoreUserInterests(userId: string) {
    const events = await prisma.$queryRawUnsafe<RawEvent[]>(`
      SELECT
        metadata->>'categoryId' as category_id,
        event_type,
        COUNT(*)::int as event_count,
        EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400.0 as days_ago
      FROM events
      WHERE user_id = $1::text
        AND created_at > NOW() - INTERVAL '90 days'
        AND metadata->>'categoryId' IS NOT NULL
      GROUP BY metadata->>'categoryId', event_type, EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400.0
    `, userId);

    const weights: Record<string, number> = {
      product_view: 1, product_click: 3, add_to_cart: 20,
      purchase: 50, order_completed: 30, product_share: 15,
      product_favorite: 10, review: 25, search: 2, category_view: 1,
    };

    const categoryScores: Record<string, any> = {};
    for (const e of events) {
      if (!e.category_id) continue;
      if (!categoryScores[e.category_id]) {
        categoryScores[e.category_id] = { views: 0, clicks: 0, purchases: 0, shares: 0, favorites: 0, cartAdds: 0, reviews: 0, orders: 0, score: 0 };
      }
      const weight = weights[e.event_type] || 1;
      const decay = Math.exp(-(e.days_ago || 0) / 30);
      const contribution = Number(e.event_count || 1) * weight * decay;
      categoryScores[e.category_id].score += contribution;

      if (e.event_type === 'product_view') categoryScores[e.category_id].views += Number(e.event_count || 1);
      if (e.event_type === 'product_click') categoryScores[e.category_id].clicks += Number(e.event_count || 1);
      if (e.event_type === 'purchase') categoryScores[e.category_id].purchases += Number(e.event_count || 1);
      if (e.event_type === 'product_share') categoryScores[e.category_id].shares += Number(e.event_count || 1);
      if (e.event_type === 'product_favorite') categoryScores[e.category_id].favorites += Number(e.event_count || 1);
      if (e.event_type === 'add_to_cart') categoryScores[e.category_id].cartAdds += Number(e.event_count || 1);
      if (e.event_type === 'review') categoryScores[e.category_id].reviews += Number(e.event_count || 1);
      if (e.event_type === 'order_completed') categoryScores[e.category_id].orders += Number(e.event_count || 1);
    }

    for (const [catId, data] of Object.entries(categoryScores)) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO user_category_interest (user_id, category_id, interest_score, view_count, click_count, purchase_count, share_count, favorite_count, cart_add_count, review_count, order_completed_count, recency_weight, updated_at)
        VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1.0, NOW())
        ON CONFLICT (user_id, category_id) DO UPDATE SET
          interest_score = EXCLUDED.interest_score,
          view_count = EXCLUDED.view_count,
          click_count = EXCLUDED.click_count,
          purchase_count = EXCLUDED.purchase_count,
          share_count = EXCLUDED.share_count,
          favorite_count = EXCLUDED.favorite_count,
          cart_add_count = EXCLUDED.cart_add_count,
          review_count = EXCLUDED.review_count,
          order_completed_count = EXCLUDED.order_completed_count,
          updated_at = NOW()
      `, userId, catId, Math.round(data.score * 100) / 100, data.views, data.clicks, data.purchases, data.shares, data.favorites, data.cartAdds, data.reviews, data.orders);
    }

    this._interestCache.delete(userId);
    return { categories: Object.keys(categoryScores).length };
  }

  async getUserInterests(userId: string): Promise<InterestResult[]> {
    const cached = this._interestCache.get(userId);
    if (cached && Date.now() - cached.ts < 120000) return cached.data;

    const interests = await prisma.$queryRawUnsafe<UserCategoryInterest[]>(`
      SELECT uci.*, c.name as category_name, c.slug as category_slug
      FROM user_category_interest uci
      LEFT JOIN categories c ON c.id = uci.category_id::text
      WHERE uci.user_id::text = $1
      ORDER BY uci.interest_score DESC
      LIMIT 20
    `, userId);

    const result: InterestResult[] = interests.map(i => ({
      categoryId: i.category_id,
      categoryName: i.category_name || 'Unknown',
      categorySlug: i.category_slug || '',
      interestScore: Number(i.interest_score) || 0,
      eventCounts: {
        views: i.view_count || 0, clicks: i.click_count || 0,
        purchases: i.purchase_count || 0, shares: i.share_count || 0,
        favorites: i.favorite_count || 0, cartAdds: i.cart_add_count || 0,
        reviews: i.review_count || 0, orders: i.order_completed_count || 0,
      },
    }));

    this._interestCache.set(userId, { data: result, ts: Date.now() });
    return result;
  }

  async getForYouFeed(userId: string, page = 1, limit = 20): Promise<ProductResult[]> {
    const interests = await this.getUserInterests(userId);
    const topCategoryIds = interests.slice(0, 5).map(i => i.categoryId);

    if (topCategoryIds.length === 0) {
      return this.getTrending('week', limit);
    }

    const skip = (page - 1) * limit;
    const placeholders = topCategoryIds.map((_, i) => `$${i + 1}`).join(',');
    const scorePlaceholders = topCategoryIds.map((_, i) => `$${topCategoryIds.length + i + 1}`).join(',');

    const products = await prisma.$queryRawUnsafe<any[]>(`
      WITH user_purchased AS (
        SELECT DISTINCT oi.product_id FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = $${topCategoryIds.length * 2 + 1}::text AND o.status != 'CANCELLED'
      )
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, p.created_at,
        c.id as category_id, c.name as category_name,
        inv.quantity as stock,
        COALESCE(AVG(cf.rating)::float, 0) as avg_rating,
        COALESCE(ps.trending_score, 0) as trending_score,
        COALESCE(ps.total_views, 0) as popularity
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN customer_feedback cf ON cf.product_id = p.id
      LEFT JOIN product_scores ps ON ps.product_id::text = p.id
      LEFT JOIN user_purchased up ON up.product_id = p.id
      WHERE p.deleted_at IS NULL AND p.status = 'APPROVED' AND p.is_available = true
        AND up.product_id IS NULL
        AND p.category_id IN (${placeholders})
      GROUP BY p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, p.created_at, c.id, c.name, inv.quantity, ps.trending_score, ps.total_views
      ORDER BY
        CASE WHEN p.category_id IN (${scorePlaceholders}) THEN 3 ELSE 1 END * COALESCE(ps.trending_score, 0) * 2 +
        COALESCE(ps.total_views, 0) * 1.5 +
        EXTRACT(EPOCH FROM p.created_at) / 86400 * 1 +
        COALESCE(AVG(cf.rating), 0) * 1 DESC
      LIMIT $${topCategoryIds.length * 2 + 2} OFFSET $${topCategoryIds.length * 2 + 3}
    `, ...topCategoryIds, ...topCategoryIds, userId, limit, skip);

    return products.map((p: any) => ({
      id: p.id, name: p.name, description: p.description,
      price: Number(p.price), imageUrl: p.image_url,
      campusId: p.campus_id, createdAt: p.created_at,
      category: { id: p.category_id, name: p.category_name },
      stock: p.stock || 0, avgRating: Number(p.avg_rating) || 0,
      trendingScore: Number(p.trending_score) || 0,
      popularity: Number(p.popularity) || 0,
    }));
  }

  async getTrending(period = 'week', limit = 20): Promise<ProductResult[]> {
    const intervalMap: Record<string, string> = { today: '24 hours', week: '7 days', month: '30 days' };
    const interval = intervalMap[period] || '7 days';
    const intervalArg = `${interval}`;

    const products = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, p.created_at,
        c.id as category_id, c.name as category_name,
        inv.quantity as stock,
        COALESCE(AVG(cf.rating)::float, 0) as avg_rating,
        COUNT(e.id) FILTER (WHERE e.event_type = 'product_view' AND e.created_at > NOW() - $1::interval) as recent_views,
        COUNT(e.id) FILTER (WHERE e.event_type = 'purchase' AND e.created_at > NOW() - $1::interval) as recent_purchases,
        COUNT(e.id) FILTER (WHERE e.event_type = 'product_share' AND e.created_at > NOW() - $1::interval) as recent_shares,
        CASE
          WHEN COUNT(e.id) FILTER (WHERE e.created_at > NOW() - INTERVAL '1 hour') > 0 THEN 'up'
          WHEN COUNT(e.id) FILTER (WHERE e.created_at > NOW() - $1::interval) = 0 THEN 'stable'
          ELSE 'down'
        END as trending_direction
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN customer_feedback cf ON cf.product_id = p.id
      LEFT JOIN events e ON (e.metadata->>'entityId' = p.id OR e.metadata->>'productId' = p.id)
        AND e.created_at > NOW() - $1::interval
      WHERE p.deleted_at IS NULL AND p.status = 'APPROVED' AND p.is_available = true
      GROUP BY p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, p.created_at, c.id, c.name, inv.quantity
      ORDER BY
        COUNT(e.id) FILTER (WHERE e.event_type = 'product_view' AND e.created_at > NOW() - $1::interval) * 1 +
        COUNT(e.id) FILTER (WHERE e.event_type = 'purchase' AND e.created_at > NOW() - $1::interval) * 5 +
        COUNT(e.id) FILTER (WHERE e.event_type = 'product_share' AND e.created_at > NOW() - $1::interval) * 3 DESC
      LIMIT $2
    `, intervalArg, limit);

    return products.map((p: any) => ({
      id: p.id, name: p.name, description: p.description,
      price: Number(p.price), imageUrl: p.image_url,
      campusId: p.campus_id, createdAt: p.created_at,
      category: { id: p.category_id, name: p.category_name },
      stock: p.stock || 0, avgRating: Number(p.avg_rating) || 0,
      trendingDirection: p.trending_direction || 'stable',
      eventCounts: {
        views: Number(p.recent_views) || 0,
        purchases: Number(p.recent_purchases) || 0,
        shares: Number(p.recent_shares) || 0,
      },
    }));
  }

  async getMostShared(limit = 20): Promise<ProductResult[]> {
    const products = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, c.id as category_id, c.name as category_name,
        COUNT(ps.id) as share_count,
        COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '7 days') as weekly_shares,
        COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '24 hours') as daily_shares,
        CASE
          WHEN COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '7 days') > COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '14 days' AND ps.shared_at < NOW() - INTERVAL '7 days') THEN 'up'
          WHEN COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '7 days') < COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '14 days' AND ps.shared_at < NOW() - INTERVAL '7 days') THEN 'down'
          ELSE 'stable'
        END as trending_direction,
        CASE
          WHEN COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '7 days') > 0
            THEN ROUND((COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '7 days') - COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '14 days' AND ps.shared_at < NOW() - INTERVAL '7 days'))::float / GREATEST(COUNT(ps.id) FILTER (WHERE ps.shared_at > NOW() - INTERVAL '14 days' AND ps.shared_at < NOW() - INTERVAL '7 days'), 1) * 100)
          ELSE 0
        END as growth_pct
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_shares ps ON ps.product_id = p.id
      WHERE p.deleted_at IS NULL AND p.status = 'APPROVED' AND p.is_available = true
      GROUP BY p.id, p.name, p.description, p.price, p.image_url, p.campus_id, c.id, c.name
      ORDER BY share_count DESC
      LIMIT $1
    `, limit);

    return products.map((p: any) => ({
      id: p.id, name: p.name, description: p.description,
      price: Number(p.price), imageUrl: p.image_url,
      campusId: p.campus_id,
      category: { id: p.category_id, name: p.category_name },
      shareCount: Number(p.share_count) || 0,
      weeklyShares: Number(p.weekly_shares) || 0,
      dailyShares: Number(p.daily_shares) || 0,
      growthPct: Number(p.growth_pct) || 0,
      trendingDirection: p.trending_direction || 'stable',
    }));
  }

  async getMostPurchased(limit = 20): Promise<ProductResult[]> {
    const products = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, c.id as category_id, c.name as category_name,
        COUNT(DISTINCT o.id) as purchase_count,
        COUNT(DISTINCT oi.id) as total_items_ordered,
        COALESCE(SUM(oi.price_at_time * oi.quantity), 0) as revenue_generated
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      JOIN order_items oi ON oi.product_id = p.id
      JOIN orders o ON o.id = oi.order_id AND o.status = 'DELIVERED'
      WHERE p.deleted_at IS NULL AND p.status = 'APPROVED' AND p.is_available = true
      GROUP BY p.id, p.name, p.description, p.price, p.image_url, p.campus_id, c.id, c.name
      ORDER BY purchase_count DESC, revenue_generated DESC
      LIMIT $1
    `, limit);

    return products.map((p: any) => ({
      id: p.id, name: p.name, description: p.description,
      price: Number(p.price), imageUrl: p.image_url,
      campusId: p.campus_id,
      category: { id: p.category_id, name: p.category_name },
      purchaseCount: Number(p.purchase_count) || 0,
      totalItemsOrdered: Number(p.total_items_ordered) || 0,
      revenueGenerated: Number(p.revenue_generated) || 0,
    }));
  }

  async getMostLoved(limit = 20): Promise<ProductResult[]> {
    const products = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, c.id as category_id, c.name as category_name,
        COALESCE(AVG(cf.rating)::float, 0) as avg_rating,
        COUNT(cf.id) as review_count,
        COUNT(cf.id) FILTER (WHERE cf.rating >= 4) as positive_reviews,
        CASE WHEN COUNT(cf.id) > 0 THEN ROUND(COUNT(cf.id) FILTER (WHERE cf.rating >= 4)::float / COUNT(cf.id) * 100) ELSE 0 END as positive_ratio
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN customer_feedback cf ON cf.product_id = p.id
      WHERE p.deleted_at IS NULL AND p.status = 'APPROVED' AND p.is_available = true
      GROUP BY p.id, p.name, p.description, p.price, p.image_url, p.campus_id, c.id, c.name
      HAVING AVG(cf.rating) >= 3.5 OR COUNT(cf.id) = 0
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT $1
    `, limit);

    return products.map((p: any) => ({
      id: p.id, name: p.name, description: p.description,
      price: Number(p.price), imageUrl: p.image_url,
      campusId: p.campus_id,
      category: { id: p.category_id, name: p.category_name },
      avgRating: Number(p.avg_rating) || 0,
      reviewCount: Number(p.review_count) || 0,
      positiveReviews: Number(p.positive_reviews) || 0,
      positiveRatio: Number(p.positive_ratio) || 0,
    }));
  }

  async getNearYou(userId: string | null, query: any): Promise<ProductResult[]> {
    const campusId = query.campusId || null;
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { campusId: true } }) : null;
    const resolvedCampusId = campusId || (user ? user.campusId : null) || null;

    if (!resolvedCampusId) return [];

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const products = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, p.created_at,
        c.id as category_id, c.name as category_name,
        inv.quantity as stock,
        COALESCE(AVG(cf.rating)::float, 0) as avg_rating
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN customer_feedback cf ON cf.product_id = p.id
      WHERE p.deleted_at IS NULL AND p.status = 'APPROVED' AND p.is_available = true
        AND p.campus_id = $1::text
      GROUP BY p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, p.created_at, c.id, c.name, inv.quantity
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, resolvedCampusId, limit, skip);

    return products.map((p: any) => ({
      id: p.id, name: p.name, description: p.description,
      price: Number(p.price), imageUrl: p.image_url,
      campusId: p.campus_id, createdAt: p.created_at,
      category: { id: p.category_id, name: p.category_name },
      stock: p.stock || 0, avgRating: Number(p.avg_rating) || 0,
    }));
  }

  async getFriendsRecommended(userId: string, limit = 20): Promise<ProductResult[]> {
    const products = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.campus_id, c.id as category_id, c.name as category_name,
        COUNT(se.id) as share_count,
        COUNT(se.id) FILTER (WHERE se.clicked = true) as click_count,
        COUNT(se.id) FILTER (WHERE se.purchased = true) as purchase_count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      JOIN share_events se ON se.product_id = p.id
      WHERE p.deleted_at IS NULL AND p.status = 'APPROVED' AND p.is_available = true
        AND se.recipient_user_id = $1::text
      GROUP BY p.id, p.name, p.description, p.price, p.image_url, p.campus_id, c.id, c.name
      ORDER BY
        COUNT(se.id) FILTER (WHERE se.purchased = true) * 10 +
        COUNT(se.id) FILTER (WHERE se.clicked = true) * 3 +
        COUNT(se.id) DESC
      LIMIT $2
    `, userId, limit);

    return products.map((p: any) => ({
      id: p.id, name: p.name, description: p.description,
      price: Number(p.price), imageUrl: p.image_url,
      campusId: p.campus_id,
      category: { id: p.category_id, name: p.category_name },
      shareCount: Number(p.share_count) || 0,
      clickCount: Number(p.click_count) || 0,
      purchaseCount: Number(p.purchase_count) || 0,
    }));
  }

  async getDiscoveryAnalytics(period = 'week') {
    const intervalMap: Record<string, string> = { today: '24 hours', week: '7 days', month: '30 days' };
    const interval = intervalMap[period] || '7 days';

    const [mostViewed, mostClicked, mostShared, mostPurchased, mostLoved, activeUsers, growingCats, feedPerf, topTrending] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(`SELECT p.id, p.name, p.price, p.image_url, COUNT(e.id) as event_count FROM products p JOIN events e ON (e.metadata->>'entityId' = p.id OR e.metadata->>'productId' = p.id) WHERE e.event_type = 'product_view' AND e.created_at > NOW() - $1::interval AND p.deleted_at IS NULL AND p.status = 'APPROVED' GROUP BY p.id ORDER BY event_count DESC LIMIT 5`, interval),
      prisma.$queryRawUnsafe<any[]>(`SELECT p.id, p.name, p.price, p.image_url, COUNT(e.id) as event_count FROM products p JOIN events e ON (e.metadata->>'entityId' = p.id OR e.metadata->>'productId' = p.id) WHERE e.event_type = 'product_click' AND e.created_at > NOW() - $1::interval AND p.deleted_at IS NULL GROUP BY p.id ORDER BY event_count DESC LIMIT 5`, interval),
      prisma.$queryRawUnsafe<any[]>(`SELECT p.id, p.name, COUNT(ps.id) as event_count FROM products p JOIN product_shares ps ON ps.product_id = p.id WHERE ps.shared_at > NOW() - $1::interval AND p.deleted_at IS NULL GROUP BY p.id ORDER BY event_count DESC LIMIT 5`, interval),
      prisma.$queryRawUnsafe<any[]>(`SELECT p.id, p.name, COUNT(DISTINCT o.id) as event_count FROM products p JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id AND o.status = 'DELIVERED' WHERE o.created_at > NOW() - $1::interval AND p.deleted_at IS NULL GROUP BY p.id ORDER BY event_count DESC LIMIT 5`, interval),
      prisma.$queryRawUnsafe<any[]>(`SELECT p.id, p.name, COALESCE(AVG(cf.rating)::float, 0) as avg_rating, COUNT(cf.id) as review_count FROM products p JOIN customer_feedback cf ON cf.product_id = p.id WHERE cf.created_at > NOW() - $1::interval AND p.deleted_at IS NULL GROUP BY p.id HAVING COUNT(cf.id) > 0 ORDER BY avg_rating DESC, review_count DESC LIMIT 5`, interval),
      prisma.$queryRawUnsafe<any[]>(`SELECT u.id, u.name, u.phone_number, COUNT(e.id) as event_count FROM users u JOIN events e ON e.user_id = u.id WHERE e.created_at > NOW() - $1::interval GROUP BY u.id ORDER BY event_count DESC LIMIT 5`, interval),
      prisma.$queryRawUnsafe<any[]>(`SELECT c.id, c.name, COUNT(e.id) as event_count FROM categories c JOIN events e ON e.metadata->>'categoryId' = c.id WHERE e.created_at > NOW() - $1::interval GROUP BY c.id ORDER BY event_count DESC LIMIT 5`, interval),
      prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(*) FILTER (WHERE e.event_type = 'product_view' AND e.created_at > NOW() - $1::interval) as total_impressions, COUNT(*) FILTER (WHERE e.event_type = 'product_click' AND e.created_at > NOW() - $1::interval) as total_clicks FROM events e`, interval),
      prisma.$queryRawUnsafe<any[]>(`SELECT p.id, p.name, COUNT(e.id) as event_count FROM products p JOIN events e ON (e.metadata->>'entityId' = p.id OR e.metadata->>'productId' = p.id) WHERE e.created_at > NOW() - $1::interval AND p.deleted_at IS NULL AND p.status = 'APPROVED' GROUP BY p.id ORDER BY event_count DESC LIMIT 5`, interval),
    ]);

    const totalImpressions = feedPerf[0] ? Number(feedPerf[0].total_impressions) || 0 : 0;
    const totalClicks = feedPerf[0] ? Number(feedPerf[0].total_clicks) || 0 : 0;

    return {
      mostViewed: mostViewed.map((p: any) => ({ id: p.id, name: p.name, price: Number(p.price || 0), imageUrl: p.image_url, count: Number(p.event_count) || 0 })),
      mostClicked: mostClicked.map((p: any) => ({ id: p.id, name: p.name, price: Number(p.price || 0), imageUrl: p.image_url, count: Number(p.event_count) || 0 })),
      mostShared: mostShared.map((p: any) => ({ id: p.id, name: p.name, count: Number(p.event_count) || 0 })),
      mostPurchased: mostPurchased.map((p: any) => ({ id: p.id, name: p.name, count: Number(p.event_count) || 0 })),
      mostLoved: mostLoved.map((p: any) => ({ id: p.id, name: p.name, avgRating: Number(p.avg_rating) || 0, reviewCount: Number(p.review_count) || 0 })),
      mostActiveUsers: activeUsers.map((u: any) => ({ id: u.id, name: u.name, phone: u.phone_number, eventCount: Number(u.event_count) || 0 })),
      fastestGrowingCategories: growingCats.map((c: any) => ({ id: c.id, name: c.name, eventCount: Number(c.event_count) || 0 })),
      feedPerformance: { totalImpressions, totalClicks, ctr: totalImpressions > 0 ? Number((totalClicks / totalImpressions * 100).toFixed(2)) : 0 },
      topTrending: topTrending.map((p: any) => ({ id: p.id, name: p.name, count: Number(p.event_count) || 0 })),
    };
  }

  async createShareEvent(productId: string, senderUserId: string, recipientUserId: string) {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO share_events (product_id, sender_user_id, recipient_user_id, clicked, purchased, created_at)
      VALUES ($1::text, $2::text, $3::text, false, false, NOW())
      RETURNING id
    `, productId, senderUserId, recipientUserId);
    return result;
  }

  async recordShareClick(shareId: string) {
    await prisma.$executeRawUnsafe(`
      UPDATE share_events SET clicked = true WHERE id = $1::text
    `, shareId);
  }

  async recordSharePurchase(shareId: string) {
    await prisma.$executeRawUnsafe(`
      UPDATE share_events SET purchased = true WHERE id = $1::text
    `, shareId);
  }
}

export const discoveryService = new DiscoveryService();
