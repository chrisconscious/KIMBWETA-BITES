// ── KIMBWETA BITES — App Constants v2.0 ────────────────────────
const KB = {
  APP_NAME: 'KIMBWETA BITES',
  VERSION:  '2.0.0',

  // API base — override per environment
  // Production: set window.KIMBWETA_API = 'https://api.kimbweta.co.tz/api/v1'
  API_BASE: (typeof window !== 'undefined' && window.KIMBWETA_API) || 'http://localhost:3000/api/v1',

  // Cache TTLs (ms) - Increased for better performance
  CACHE_TTL_CATEGORIES:    15 * 60 * 1000,  // 15 minutes (was 5)
  CACHE_TTL_PRODUCTS:      60 * 1000,       // 1 minute (was 30 seconds)
  CACHE_TTL_PAYMENT:       5 * 60 * 1000,   // 5 minutes (was 2)
  CACHE_TTL_SOCIAL:       60 * 60 * 1000,   // 1 hour (was 1 hour)
  CACHE_TTL_CAMPUSES:     60 * 60 * 1000,   // 1 hour (was 30 minutes)

  SEARCH_DEBOUNCE_MS: 280,
  AD_SLIDE_INTERVAL_MS: 4500,
  RECENTLY_VIEWED_MAX: 8,

  // Social links — populated from GET /social-links on boot
  SOCIAL_LINKS: {},
};
