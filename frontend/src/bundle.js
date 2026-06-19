/* === src\config\constants.js === */
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
/* === src\config\endpoints.js === */
// ── KIMBWETA BITES — API Endpoints v2.0 ────────────────────────
const EP = {
  // Auth
  LOGIN:          '/auth/login',        // password login (NEW)
  REGISTER:       '/auth/register',
  OTP_SEND:       '/auth/otp/send',
  OTP_VERIFY:     '/auth/otp/verify',
  TOKEN_REFRESH:  '/auth/token/refresh',
  LOGOUT:         '/auth/logout',
  ME:             '/users/me',

  // Products
  PRODUCTS_PUBLIC: '/products/public',
  PRODUCT:         (id) => `/products/${id}`,

  // Categories
  CATEGORIES:          '/categories',
  CATEGORIES_PUBLIC:   '/categories/public',
  CATEGORY:            (id) => `/categories/${id}`,
  CATEGORY_STATUS:     (id) => `/categories/${id}/status`,
  CATEGORIES_REORDER:  '/categories/reorder',
  CATEGORIES_UPLOAD:   '/categories/upload-icon',

  // Campuses
  CAMPUSES:            '/campuses',
  CAMPUSES_ALL:        '/campuses/all',
  CAMPUS:              (id) => `/campuses/${id}`,
  CAMPUS_STATS:        (id) => `/campuses/${id}/stats`,
  CAMPUS_TOGGLE_ACTIVE: (id) => `/campuses/${id}/toggle-active`,

  // Orders
  ORDERS:       '/orders',
  ORDER:        (id) => `/orders/${id}`,
  ORDER_STATUS: (id) => `/orders/${id}/status`,

  // Ads
  ADS:              '/ads',
  ADS_ACTIVE:       '/ads/active',
  ADS_ANALYTICS:    '/ads/analytics',
  ADS_UPLOAD:       '/ads/upload',
  AD:               (id) => `/ads/${id}`,
  AD_EVENT:         (id) => `/ads/${id}/events`,
  AD_PERFORMANCE:   (id) => `/ads/${id}/performance`,
  AD_PUBLISH:       (id) => `/ads/${id}/publish`,
  AD_PAUSE:         (id) => `/ads/${id}/pause`,
  AD_TOGGLE:        (id) => `/ads/${id}/toggle`,

  // Settings
  SETTINGS_PUBLIC: '/settings/public',
  SETTINGS:        '/settings',
  SETTINGS_LOGO:   '/settings/upload-logo',
  SETTINGS_LOGO_REMOVE: '/settings/logo',
  SETTINGS_SET:    '/settings/set',
  SETTINGS_PRELOADER_LOGO: '/settings/preloader-logo',
  SETTINGS_PRELOADER_LOGO_REMOVE: '/settings/preloader-logo',

  // Analytics
  ANALYTICS_EVENTS: '/analytics/events',
  ANALYTICS_REPORT: '/analytics/report',

  // Payment Details (dynamic per campus)
  PAYMENT_DETAILS: (campusId) => `/payment-details?campus_id=${campusId}`,

  // Social Links
  SOCIAL_LINKS: '/social-links',
  SOCIAL_LINKS_ALL: '/social-links/all',
  SOCIAL_LINK: (platform) => `/social-links/${platform}`,
  SOCIAL_LINK_TOGGLE: (platform) => `/social-links/${platform}/toggle`,

  // Delivery Riders
  RIDERS:             '/delivery-riders',
  RIDERS_AVAILABLE:   '/delivery-riders/available',
  RIDER_APPROVE:      (id) => `/delivery-riders/${id}/approve`,
  RIDER_REJECT:       (id) => `/delivery-riders/${id}/reject`,
  RIDER_AVAILABILITY: '/delivery-riders/availability',

  // Notifications
  NOTIFICATIONS:     '/notifications',
  NOTIFICATION_READ: (id) => `/notifications/${id}/read`,

  // Shares
  SHARE_PRODUCT:    (id) => `/products/${id}/share`,

  // Feedback
  FEEDBACK:        '/feedback',
  FEEDBACK_CANCEL: '/feedback/cancellation',
  FEEDBACK_REC:    '/feedback/recommend',

  // Product Requests
  PRODUCT_REQUESTS: '/product-requests',

  // Super Admin - Customer Insights
  SA_SHARE_ANALYTICS:   '/super-admin/share-analytics',
  SA_CUSTOMER_INSIGHTS: '/super-admin/customer-insights',
  SA_PRODUCT_REQUESTS:  '/super-admin/product-requests',

  // Discovery Engine
  DISCOVERY_TRACK:           '/discovery/track',
  DISCOVERY_FOR_YOU:        '/discovery/for-you',
  DISCOVERY_TRENDING:       '/discovery/trending',
  DISCOVERY_MOST_SHARED:    '/discovery/most-shared',
  DISCOVERY_MOST_PURCHASED: '/discovery/most-purchased',
  DISCOVERY_MOST_LOVED:     '/discovery/most-loved',
  DISCOVERY_NEAR_YOU:       '/discovery/near-you',
  DISCOVERY_FRIENDS_REC:    '/discovery/friends-recommended',
  DISCOVERY_INTERESTS:      '/discovery/interests',
  DISCOVERY_SCORE:          '/discovery/score-interests',
  DISCOVERY_ANALYTICS:      '/discovery/analytics',
  DISCOVERY_SHARE:          '/discovery/share',
  DISCOVERY_SHARE_CLICK:    '/discovery/share/click',
  DISCOVERY_SHARE_PURCHASE: '/discovery/share/purchase',

  // Saved Items
  SAVED_ITEMS:       '/saved-items',

  // Collections
  COLLECTIONS:           '/collections',
  COLLECTION:            (id) => `/collections/${id}`,
  COLLECTION_ITEMS:      (id) => `/collections/${id}/items`,
  COLLECTION_ITEM:       (id, pid) => `/collections/${id}/items/${pid}`,

  // Reviews
  REVIEWS:               '/reviews',
  REVIEWS_PRODUCT:       (pid) => `/reviews/product/${pid}`,
  REVIEW:                (id) => `/reviews/${id}`,

  // Following
  FOLLOWING:             '/following/following',
  FOLLOWERS:             '/following/followers',
  FOLLOW_USER:           (id) => `/following/${id}`,

  // Order Extension
  ORDER_CANCEL:          (id) => `/orders/${id}/cancel`,
  ORDER_TIMELINE:        (id) => `/orders/${id}/timeline`,
  ORDER_BUY_AGAIN:       (id) => `/orders/${id}/buy-again`,

  // Discovery Analytics
  DISCOVER_TRENDING:     '/discover/trending',
  DISCOVER_FOR_YOU:      '/discover/for-you',
  DISCOVER_NEAR_ME:      '/discover/near-me',
  DISCOVER_POPULAR:      '/discover/popular',
  DISCOVER_NEW:          '/discover/new-arrivals',

  // Super Admin Commerce
  SA_COMMERCE_OVERVIEW: '/super-admin/commerce/overview',
  SA_COMMERCE_REVENUE:  '/super-admin/commerce/revenue',
  SA_COMMERCE_ORDERS:   '/super-admin/commerce/orders',
  SA_COMMERCE_TOP:      '/super-admin/commerce/top-products',
  SA_COMMERCE_CAMPUS:   '/super-admin/commerce/campus-performance',
};
/* === src\utils\storage.js === */
// ── KIMBWETA BITES — Storage Utilities ─────────────────────────
const Storage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) { localStorage.removeItem(key); },
  clear()  { localStorage.clear(); },

  // Typed helpers
  getStr(key)      { return localStorage.getItem(key); },
  setStr(key, val) { localStorage.setItem(key, val); },
};

// ── In-memory API cache ─────────────────────────────────────────
const Cache = {
  _store: new Map(),

  set(key, data, ttl = 60000) {
    this._store.set(key, { data, ts: Date.now(), ttl });
  },
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > entry.ttl) { this._store.delete(key); return null; }
    return entry.data;
  },
  has(key)    { return this.get(key) !== null; },
  delete(key) { this._store.delete(key); },
  clear()     { this._store.clear(); },
};
/* === src\utils\helpers.js === */
// ── KIMBWETA BITES — Helper Utilities ──────────────────────────

/** Format TZS price */
const fmtPrice = (n) => `TZS ${Number(n).toLocaleString()}`;

/** Debounce function */
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

/** Highlight matching text */
function highlightMatch(text, query) {
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark class="search-highlight">$1</mark>');
}

/** Get product icon type from category name */
function catToIcon(catName = '') {
  const c = catName.toLowerCase();
  if (c.includes('drink') || c.includes('juice') || c.includes('soda')) return 'drink';
  if (c.includes('meal') || c.includes('rice') || c.includes('food')) return 'meal';
  if (c.includes('sweet') || c.includes('cake') || c.includes('dessert')) return 'sweet';
  return 'food';
}

/** Map backend product to local format */
function mapProduct(p) {
  return {
    id:          p.id,
    name:        p.name,
    price:       p.price,
    icon:        catToIcon(p.category?.name || ''),
    campusId:    p.campusId || '',
    cat:         (p.category?.name || 'other').toLowerCase(),
    stock:       p.inventory?.quantity ?? 99,
    popular:     p.isFeatured || false,
    imageUrl:    p.imageUrl || null,
    description: p.description || '',
  };
}

/** Escape HTML special chars (XSS safety) */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/** Stagger animate children */
function animateChildren(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.add('stagger-in');
  setTimeout(() => el.classList.remove('stagger-in'), 1000);
}
/* === src\utils\validators.js === */
// ── KIMBWETA BITES — Validators ────────────────────────────────

const Validators = {
  phone(v)  { return /^\+[1-9]\d{6,14}$/.test((v||'').trim()); },
  email(v)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim()); },
  name(v)   { return (v||'').trim().length >= 2; },
  otp(v)    { return /^\d{6}$/.test((v||'').trim()); },
  required(v){ return (v||'').trim().length > 0; },

  /** Return first error or null */
  registerForm({ name, phone, email, campusId }) {
    if (!this.name(name))    return 'Enter your full name (at least 2 characters)';
    if (!this.phone(phone))  return 'Enter a valid phone number (e.g. +255712345678)';
    if (!this.email(email))  return 'Enter a valid email address';
    if (!campusId)           return 'Please select your campus';
    return null;
  },
};
/* === src\scripts\api.js === */
// ── KIMBWETA BITES — API Layer v2.0 ────────────────────────────
// Unified fetch with: JWT auto-attach, token refresh, in-memory cache

// ── JWT helpers ────────────────────────────────────────────────
function _decodeJWTPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch { return null; }
}

function _isJWTExpired(token) {
  const payload = _decodeJWTPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

const API = {
  _cache: new Map(),
  _refreshPromise: null,

  // ── Core fetch ────────────────────────────────────────────────
  async fetch(path, opts = {}) {
    let token = Storage.getStr('kb_token');
    // If token is expired, try refresh first or clear silently
    if (token && _isJWTExpired(token)) {
      const rt = Storage.getStr('kb_refresh');
      if (rt && !_isJWTExpired(rt)) {
        await API._doRefresh();
        token = Storage.getStr('kb_token');
      } else {
        Session.clear();
        token = null;
      }
    }
    const isFormData = opts.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const resp = await fetch(`${KB.API_BASE}${path}`, {
        ...opts,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Auto-refresh on 401
      if (resp.status === 401 && Storage.getStr('kb_refresh') && !opts._retry) {
        await API._doRefresh();
        return API.fetch(path, { ...opts, _retry: true });
      }
      return resp;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error('Request timeout');
      throw error;
    }
  },

  async _doRefresh() {
    if (API._refreshPromise) return API._refreshPromise;
    const rt = Storage.getStr('kb_refresh');
    if (!rt) { Session.clear(); return Promise.resolve(); }
    // Skip refresh call if refresh token is expired
    if (_isJWTExpired(rt)) { Session.clear(); return Promise.resolve(); }
    API._refreshPromise = (async () => {
      try {
        const r = await fetch(`${KB.API_BASE}${EP.TOKEN_REFRESH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
        if (r.ok) {
          const data = await r.json();
          Storage.setStr('kb_token', data.data.accessToken);
          Storage.setStr('kb_refresh', data.data.refreshToken);
        } else {
          Session.clear();
        }
      } catch {
        Session.clear();
      } finally {
        API._refreshPromise = null;
      }
    })();
    return API._refreshPromise;
  },

  // ── Cached GET ────────────────────────────────────────────────
  async get(path, ttl = KB.CACHE_TTL_PRODUCTS) {
    const cached = API._cache.get(path);
    if (cached && Date.now() - cached.ts < ttl) return cached.data;
    try {
      const r = await API.fetch(path);
      if (r.ok) {
        const data = await r.json();
        API._cache.set(path, { data, ts: Date.now() });
        return data;
      }
    } catch { /* fall through */ }
    return null;
  },

  invalidate(prefix) {
    for (const key of API._cache.keys()) {
      if (key.startsWith(prefix)) API._cache.delete(key);
    }
  },

  // ── POST / PATCH / DELETE ─────────────────────────────────────
  async post(path, body) { return API.fetch(path, { method: 'POST', body: JSON.stringify(body) }); },
  async patch(path, body) { return API.fetch(path, { method: 'PATCH', body: JSON.stringify(body) }); },
  async del(path)  { return API.fetch(path, { method: 'DELETE' }); },

  // ── Auth ──────────────────────────────────────────────────────
  async loginWithPassword(phoneNumber, password) {
    return API.post(EP.LOGIN, { phoneNumber, password });
  },
  async register(payload)          { return API.post(EP.REGISTER, payload); },
  async sendOtp(phoneNumber)       { return API.post(EP.OTP_SEND, { phoneNumber }); },
  async verifyOtp(phone, otp)      { return API.post(EP.OTP_VERIFY, { phoneNumber: phone, otp }); },

  // ── Data ──────────────────────────────────────────────────────
  async getMe()          { return API.get(EP.ME, 30000); },
  async getCategories()  { return API.get(EP.CATEGORIES_PUBLIC, KB.CACHE_TTL_CATEGORIES); },
  async getSocialLinks() { return API.get(EP.SOCIAL_LINKS, KB.CACHE_TTL_SOCIAL); },
  async getAdminCategories(params) {
    const p = new URLSearchParams(params).toString();
    return API.get(`${EP.CATEGORIES}${p ? '?' + p : ''}`, 30000);
  },
  async createCategory(body)        { return API.post(EP.CATEGORIES, body); },
  async updateCategory(id, body)    { return API.patch(EP.CATEGORY(id), body); },
  async deleteCategory(id)          { return API.del(EP.CATEGORY(id)); },
  async toggleCategoryStatus(id, isActive) { return API.patch(EP.CATEGORY_STATUS(id), { isActive }); },
  async reorderCategories(items)    { return API.post(EP.CATEGORIES_REORDER, { items }); },
  async uploadCategoryIcon(file) {
    const fd = new FormData();
    fd.append('file', file);
    return API.fetch(EP.CATEGORIES_UPLOAD, { method: 'POST', body: fd });
  },
  async getCampuses()    { return API.get(EP.CAMPUSES, KB.CACHE_TTL_CAMPUSES); },
  async getAllCampuses() { API.invalidate('/campuses'); return API.get(EP.CAMPUSES_ALL, 30000); },
  async createCampus(data) { return API.post(EP.CAMPUSES, data); },
  async updateCampus(id, data) { return API.patch(EP.CAMPUS(id), data); },
  async deleteCampus(id) { return API.del(EP.CAMPUS(id)); },
  async toggleCampusActive(id) { return API.patch(EP.CAMPUS_TOGGLE_ACTIVE(id), {}); },
  async getAds(campusId) {
    const p = campusId ? `?campusId=${campusId}` : '';
    return API.get(`${EP.ADS_ACTIVE}${p}`, 60000);
  },

  async getProducts(campusId, categoryId, search) {
    const p = new URLSearchParams();
    if (campusId)   p.set('campusId', campusId);
    if (categoryId) p.set('categoryId', categoryId);
    if (search)     p.set('search', search);
    const query = p.toString();
    const path = `${EP.PRODUCTS_PUBLIC}${query ? '?' + query : ''}`;
    return API.get(path, KB.CACHE_TTL_PRODUCTS);
  },

  // Social Links Admin
  async getAllSocialLinks()   { API.invalidate('/social-links'); return API.get(EP.SOCIAL_LINKS_ALL, 30000); },
  async saveSocialLink(platform, url, isActive, sortOrder) {
    return API.post(EP.SOCIAL_LINKS, { platform, url, isActive, sortOrder });
  },
  async updateSocialLink(platform, data) {
    return API.patch(EP.SOCIAL_LINK(platform), data);
  },
  async deleteSocialLink(platform) {
    return API.del(EP.SOCIAL_LINK(platform));
  },
  async toggleSocialLink(platform) {
    return API.patch(EP.SOCIAL_LINK_TOGGLE(platform), {});
  },

  async getPaymentDetails(campusId) {
    if (!campusId) return null;
    return API.get(EP.PAYMENT_DETAILS(campusId), KB.CACHE_TTL_PAYMENT);
  },

  async createOrder(payload)       { return API.post(EP.ORDERS, payload); },
  async trackAdEvent(adId, type)   { return API.post(EP.AD_EVENT(adId), { eventType: type }).catch(() => {}); },
  async getAdminAds(params) {
    const p = new URLSearchParams(params).toString();
    return API.get(`${EP.ADS}${p ? '?' + p : ''}`, 30000);
  },
  async createAd(body)             { return API.post(EP.ADS, body); },
  async updateAd(id, body)         { return API.patch(EP.AD(id), body); },
  async deleteAd(id)               { return API.del(EP.AD(id)); },
  async publishAd(id)              { return API.post(EP.AD_PUBLISH(id), {}); },
  async pauseAd(id)                { return API.post(EP.AD_PAUSE(id), {}); },
  async getAdPerformance(id)       { return API.get(EP.AD_PERFORMANCE(id), 15000); },
  async getAdAnalytics()           { return API.get(EP.ADS_ANALYTICS, 60000); },
  async toggleAd(id, isActive)     { return API.patch(EP.AD_TOGGLE(id), { isActive }); },
  async uploadAdMedia(file) {
    const fd = new FormData();
    fd.append('file', file);
    return API.fetch(EP.ADS_UPLOAD, { method: 'POST', body: fd });
  },

  async getOrders()                { return API.get(EP.ORDERS, 15000); },
  async getOrder(id)               { return API.get(EP.ORDER(id), 10000); },
  async updateOrderStatus(id, status) {
    API.invalidate('/orders');
    return API.patch(EP.ORDER_STATUS(id), { status });
  },

  // Admin
  async getAdminProducts(campusId) {
    return API.get(`/products?campusId=${campusId}&limit=100`, 15000);
  },
  async createProduct(formData) {
    const token = Storage.getStr('kb_token');
    return fetch(`${KB.API_BASE}/products`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  },
  async updateProduct(id, formData) {
    const token = Storage.getStr('kb_token');
    return fetch(`${KB.API_BASE}/products/${id}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  },
  async deleteProduct(id)           { return API.del(`/products/${id}`); },
  async reviewProduct(id, status, note) { return API.post(`/products/${id}/review`, { status, note }); },
  async getCampusStats(campusId)    { return API.get(EP.CAMPUS_STATS(campusId), 30000); },
  async getRiders(campusId, status) {
    const p = new URLSearchParams();
    if (campusId) p.set('campusId', campusId);
    if (status)   p.set('status', status);
    return API.get(`${EP.RIDERS}?${p}`, 30000);
  },
  async approveRider(id)            { return API.patch(EP.RIDER_APPROVE(id), {}); },
  async rejectRider(id, reason)     { return API.patch(EP.RIDER_REJECT(id), { reason }); },

  // Settings
  async getSettings()                        { return API.get(EP.SETTINGS_PUBLIC, 300000); },
  async getAllSettings()                     { return API.get(EP.SETTINGS, 30000); },
  async uploadLogo(file) {
    const token = Storage.getStr('kb_token');
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${KB.API_BASE}${EP.SETTINGS_LOGO}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
  },
  async removeLogo()                         { return API.del(EP.SETTINGS_LOGO_REMOVE); },
  async saveSetting(key, value) {
    API.invalidate('/settings');
    return API.post(EP.SETTINGS_SET, { key, value });
  },
  async uploadPreloaderLogo(file) {
    const token = Storage.getStr('kb_token');
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${KB.API_BASE}${EP.SETTINGS_PRELOADER_LOGO}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
  },
  async removePreloaderLogo()                { return API.del(EP.SETTINGS_PRELOADER_LOGO_REMOVE); },

  // Shares
  async shareProduct(productId, shareReason, sharePlatform) { return API.post(EP.SHARE_PRODUCT(productId), { shareReason, sharePlatform }); },

  // Feedback
  async submitDeliveryFeedback(orderId, rating, feedbackCategory, feedbackMessage) {
    return API.post(EP.FEEDBACK, { orderId, rating, feedbackCategory, feedbackMessage });
  },
  async submitCancellationFeedback(orderId, reason, message) {
    return API.post(EP.FEEDBACK_CANCEL, { orderId, reason, message });
  },
  async submitRecommendation(orderId, recommend) {
    return API.post(EP.FEEDBACK_REC, { orderId, recommend });
  },

  // Product Requests
  async requestProduct(productName, message) { return API.post(EP.PRODUCT_REQUESTS, { productName, message }); },

  // Discovery Engine
  async trackDiscoveryEvents(events)     { return API.post(EP.DISCOVERY_TRACK, { events }); },
  async getDiscoveryForYou()             { API.invalidate('/discovery'); return API.get(EP.DISCOVERY_FOR_YOU, 30000); },
  async getDiscoveryTrending(params)     { const p = new URLSearchParams(params||{}).toString(); return API.get(`${EP.DISCOVERY_TRENDING}${p?'?'+p:''}`, 60000); },
  async getDiscoveryMostShared(limit)    { return API.get(`${EP.DISCOVERY_MOST_SHARED}?limit=${limit||20}`, 30000); },
  async getDiscoveryMostPurchased(limit) { return API.get(`${EP.DISCOVERY_MOST_PURCHASED}?limit=${limit||20}`, 30000); },
  async getDiscoveryMostLoved(limit)     { return API.get(`${EP.DISCOVERY_MOST_LOVED}?limit=${limit||20}`, 30000); },
  async getDiscoveryNearYou(params)      { const p = new URLSearchParams(params||{}).toString(); return API.get(`${EP.DISCOVERY_NEAR_YOU}${p?'?'+p:''}`, 30000); },
  async getDiscoveryFriendsRec()         { return API.get(EP.DISCOVERY_FRIENDS_REC, 60000); },
  async getDiscoveryInterests()          { return API.get(EP.DISCOVERY_INTERESTS, 30000); },
  async scoreDiscoveryInterests()        { return API.post(EP.DISCOVERY_SCORE, {}); },
  async getDiscoveryAnalytics(period)    { return API.get(`${EP.DISCOVERY_ANALYTICS}?period=${period||'week'}`, 60000); },
  async shareDiscoveryProduct(productId, recipientUserId) { return API.post(EP.DISCOVERY_SHARE, { productId, recipientUserId }); },
  async recordShareClick(shareId)        { return API.post(EP.DISCOVERY_SHARE_CLICK, { shareId }); },
  async recordSharePurchase(shareId)     { return API.post(EP.DISCOVERY_SHARE_PURCHASE, { shareId }); },

  // Super admin - insights
  async getShareAnalytics()         { return API.get(EP.SA_SHARE_ANALYTICS, 30000); },
  async getCustomerInsights()       { return API.get(EP.SA_CUSTOMER_INSIGHTS, 30000); },
  async getSAProductRequests(q)     { return API.get(`${EP.SA_PRODUCT_REQUESTS}?${new URLSearchParams(q||{})}`, 30000); },

  // Super admin
  async getSADashboard()            { return API.get(EP.SA_DASHBOARD, 60000); },
  async getSAUsers(q)               { return API.get(`${EP.SA_USERS}?${new URLSearchParams(q)}`, 30000); },
  async getSAAnalytics(period = 7)  { return API.get(`${EP.SA_ANALYTICS}?period=${period}`, 60000); },
  async assignCampusAdmin(userId, campusId) { return API.post(EP.SA_CAMPUS_ADMINS, { userId, campusId }); },
  async updateUserStatus(id, status) { return API.patch(EP.SA_USER_STATUS(id), { status }); },
};
/* === src\components\toast.js === */
// ── KIMBWETA BITES — Toast Notifications ───────────────────────

const Toast = {
  _icons: {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)"   stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  },

  show(type, message, duration = 3000) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;

    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `${Toast._icons[type] || Toast._icons.info} <span>${message}</span>`;
    wrap.appendChild(t);

    setTimeout(() => {
      t.style.opacity   = '0';
      t.style.transform = 'translateX(20px)';
      t.style.transition= 'all .3s ease';
      setTimeout(() => t.remove(), 320);
    }, duration);
  },
};

// Legacy alias
function showToast(type, message) { Toast.show(type, message); }
/* === src\scripts\ads.js === */
let currentSlide = 0;
let slideTimer = null;

const AdsSlider = {
  async init(campusId) {
    try {
      const data = await API.getAds(campusId);
      if (!data?.data?.length) { AdsSlider._hideAll(); return; }
      const ads = data.data;
      AdsSlider._renderHero(ads.filter(a => a.destination === 'HOMEPAGE'));
      AdsSlider._renderBanner(ads.filter(a => a.destination === 'BANNER_SECTION'));
      AdsSlider._renderFloating(ads.filter(a => a.destination === 'FLOATING_CARD'));
      window.__smartAds = ads.filter(a => a.destination === 'PRODUCT_SECTION');
    } catch {
      AdsSlider._hideAll();
    }
  },

  _hideAll() {
    const el = document.getElementById('adsSlider');
    if (el && !el.querySelector('.slide')) el.style.display = 'none';
  },

  _renderHero(ads) {
    const wrap = document.getElementById('slidesWrap');
    const dots = document.getElementById('sliderDots');
    const slider = document.getElementById('adsSlider');
    if (!ads.length || !wrap) {
      if (slider && !ads.length) slider.style.display = 'none';
      return;
    }
    slider.style.display = 'block';
    const colors = ['linear-gradient(135deg,#FFFFFF,#FCE8E4)','linear-gradient(135deg,#FDE8E6,#FCE8E4)','linear-gradient(135deg,#FFFFFF,#FDE8E6)'];
    wrap.innerHTML = ads.map((ad, i) => `
      <div class="slide">
        <div class="slide-bg" style="background:${ad.imageUrl ? `url(${ad.imageUrl}) center/cover` : colors[i % colors.length]}"></div>
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <div class="slide-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 6-4 8-4 14a4 4 0 0 0 8 0c0-6-4-8-4-14z"/></svg>
            ${ad.description ? ad.description.slice(0,60) : 'Special Offer'}
          </div>
          <h2 class="slide-title h1" style="color:#fff">${ad.title}</h2>
          ${ad.description ? `<p class="slide-sub">${ad.description.slice(0,120)}</p>` : ''}
          <button class="btn btn-primary btn-lg" onclick="AdsSlider._handleClick('${ad.id}','${ad.targetUrl||''}')">
            ${ad.ctaType ? ad.ctaType.replace(/_/g,' ') : 'Order Now'}
          </button>
        </div>
      </div>`).join('');
    if (dots) dots.innerHTML = ads.map((_,i) => `<div class="slider-dot${i===0?' active':''}" onclick="goSlide(${i})"></div>`).join('');
    AdsSlider.startTimer();
  },

  _renderBanner(ads) {
    const wrap = document.getElementById('adBannerSection');
    if (!ads.length || !wrap) { if (wrap) wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    wrap.innerHTML = ads.map(ad => `
      <div class="ad-banner" style="background:${ad.imageUrl ? `url(${ad.imageUrl}) center/cover` : 'linear-gradient(135deg,var(--brand-dark),var(--brand))'}" onclick="AdsSlider._handleClick('${ad.id}','${ad.targetUrl||''}')">
        <div class="ad-banner-overlay"></div>
        <div class="ad-banner-content">
          <div class="ad-banner-tag">${ad.ctaType ? ad.ctaType.replace(/_/g,' ') : 'Promotion'}</div>
          <div class="ad-banner-title">${ad.title}</div>
          ${ad.description ? `<div class="ad-banner-desc">${ad.description.slice(0,100)}</div>` : ''}
        </div>
      </div>
    `).join('');
  },

  _renderFloating(ads) {
    const wrap = document.getElementById('adFloatingCard');
    if (!ads.length || !wrap) { if (wrap) wrap.style.display = 'none'; return; }
    const ad = ads[0];
    wrap.style.display = 'block';
    wrap.innerHTML = `
      <div class="floating-ad-card">
        <button class="floating-ad-close" onclick="this.parentElement.parentElement.style.display='none'; Storage.setStr('kb_ad_dismissed','1')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        ${ad.imageUrl ? `<div class="floating-ad-img" style="background-image:url(${ad.imageUrl})"></div>` : ''}
        <div class="floating-ad-body">
          <div class="floating-ad-title">${ad.title}</div>
          ${ad.description ? `<div class="floating-ad-desc">${ad.description.slice(0,80)}</div>` : ''}
          <button class="btn btn-primary btn-sm" onclick="AdsSlider._handleClick('${ad.id}','${ad.targetUrl||''}')">
            ${ad.ctaType ? ad.ctaType.replace(/_/g,' ') : 'Learn More'}
          </button>
        </div>
      </div>`;
    API.trackAdEvent(ad.id, 'VIEW');
    setTimeout(() => wrap.classList.add('visible'), 2000);
  },

  _handleClick(adId, targetUrl) {
    API.trackAdEvent(adId, 'CLICK');
    if (targetUrl) window.open(targetUrl, '_blank');
  },

  startTimer() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(() => nextSlide(), KB.AD_SLIDE_INTERVAL_MS);
  },
};

function prevSlide() {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
}

function nextSlide() {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
}

function goSlide(n) {
  currentSlide = n;
  updateSlider();
  if (slideTimer) { clearInterval(slideTimer); slideTimer = setInterval(nextSlide, KB.AD_SLIDE_INTERVAL_MS); }
}

function updateSlider() {
  const wrap = document.getElementById('slidesWrap');
  if (!wrap) return;
  wrap.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((d,i) => d.classList.toggle('active', i === currentSlide));
}
/* === src\scripts\products.js === */
// ── KIMBWETA BITES — Products v2.0 ─────────────────────────────

// ── SVG Icons ────────────────────────────────────────────────────
const Icons = {
  x:          `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  plus:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`,
  minus:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>`,
  check:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>`,
  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  user:       `<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  phone:      `<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.88 4.18 2 2 0 0 1 4.87 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 9.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail:       `<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  mapPin:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  cart:       `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  fire:       `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 6-4 8-4 14a4 4 0 0 0 8 0c0-6-4-8-4-14z"/></svg>`,
  bolt:       `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m13 2-3 14h7L9 22"/></svg>`,
};

const ProductIcons = {
  food:  `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="1.4"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z"/></svg>`,
  drink: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B81804" stroke-width="1.4"><path d="M8 2h8l1 10H7L8 2z"/><path d="M7 12c-.5 3 .5 7 5 7s5.5-4 5-7"/></svg>`,
  meal:  `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="1.4"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
  sweet: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="1.4"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`,
  other: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.4"><rect width="20" height="16" x="2" y="4" rx="2"/></svg>`,
};

const CatIcons = {
  snacks:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z"/></svg>`,
  drinks:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8l1 10H7L8 2z"/></svg>`,
  meals:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
  sweets:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
  stationery: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5"/></svg>`,
  toiletries: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18"/></svg>`,
  default:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
};

function getProductIcon(p) { return ProductIcons[p.icon] || ProductIcons.food; }
// ── Product state ─────────────────────────────────────────────────
let PRODUCTS = [];

const Products = {
  async fetch(campusId, categoryId, search) {
    Products.renderSkeletons('homeProductGrid');
    Products.renderSkeletons('allProductGrid');
    try {
      const data = await API.getProducts(campusId, categoryId, search);
      if (data?.data) {
        const products = Array.isArray(data.data) ? data.data : (data.data?.data || []);
        if (products.length) {
          PRODUCTS = products.map(mapProduct);
        } else {
          PRODUCTS = [];
        }
      } else {
        PRODUCTS = [];
      }
    } catch {
      PRODUCTS = [];
    }
    Products.renderAll();
  },

  renderSkeletons(id, count = 6) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = Array.from({length: count}).map(() => `
      <div class="skel-card">
        <div class="skel-img"></div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:8px">
          <div class="skel skel-h w80"></div>
          <div class="skel skel-h w60"></div>
          <div class="skel skel-h w40" style="height:28px;margin-top:4px"></div>
        </div>
      </div>`).join('');
  },

  renderAll() {
    Products.renderGrid('homeProductGrid', PRODUCTS.slice(0, 6));
    Products.renderGrid('allProductGrid', PRODUCTS);
  },

  renderGrid(containerId, products) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!products.length) {
      el.innerHTML = `<div class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <p>No products found</p>
        <button class="btn btn-outline btn-sm" onclick="Categories.filter(null,'all')">Clear filter</button>
      </div>`;
      return;
    }
    let html = '';
    const smartAds = window.__smartAds || [];
    let adIndex = 0;
    products.forEach((p, i) => {
      html += Products.renderCard(p);
      if (i === 3 && products.length > 4 && smartAds.length > 0) {
        const ad = smartAds[adIndex % smartAds.length];
        html += `<div class="inline-ad" onclick="AdsSlider._handleClick('${ad.id}','${ad.targetUrl||''}')">
          <div style="width:48px;height:48px;border-radius:10px;flex-shrink:0;overflow:hidden;background:var(--brand-muted)">
            ${ad.imageUrl
              ? `<img src="${ad.imageUrl}" style="width:100%;height:100%;object-fit:cover">`
              : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="1.4" style="margin:12px"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`
            }
          </div>
          <div class="inline-ad-content">
            <div class="inline-ad-tag">${ad.ctaType ? ad.ctaType.replace(/_/g,' ') : 'Sponsored'}</div>
            <div class="inline-ad-title">${ad.title}</div>
            ${ad.description ? `<div class="inline-ad-sub">${ad.description.slice(0,60)}</div>` : ''}
          </div>
          <button class="btn btn-primary btn-sm">${ad.ctaType ? ad.ctaType.replace(/_/g,' ') : 'Shop Now'}</button>
        </div>`;
        adIndex++;
      }
    });
    el.innerHTML = html;
  },

  renderCard(p) {
    const qty       = CartStore.data[p.id]?.qty || 0;
    const lowStock  = p.stock > 0 && p.stock <= 5;
    const outOfStock = p.stock === 0;
    const icon      = getProductIcon(p);
    const imgHtml   = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`
      : icon;

    return `
      <div class="product-card" onclick="Modal.quickView('${p.id}')">
        <div class="product-img-placeholder">
          ${imgHtml}
          <div class="product-badges">
            ${p.popular ? `<span class="badge badge-brand">${Icons.fire} Popular</span>` : ''}
            ${lowStock  ? `<span class="badge badge-red">${Icons.bolt} ${p.stock} left</span>` : ''}
            ${outOfStock ? '<span class="badge badge-red">Sold out</span>' : ''}
            <button class="badge badge-share" onclick="event.stopPropagation();Share.show('${p.id}','${p.name.replace(/'/g,"\\'")}')" title="Share with friend">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
          </div>
          ${!outOfStock ? `<button class="quick-add" onclick="event.stopPropagation();Cart.quickAdd('${p.id}')">${Icons.plus}</button>` : ''}
        </div>
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-footer">
            <div class="product-price">${fmtPrice(p.price)}</div>
            ${qty > 0
              ? `<div class="qty-controls" onclick="event.stopPropagation()">
                  <button class="qty-btn" onclick="Cart.updateQty('${p.id}',-1)">${Icons.minus}</button>
                  <span class="qty-val">${qty}</span>
                  <button class="qty-btn" onclick="Cart.updateQty('${p.id}',1)">${Icons.plus}</button>
                </div>`
              : outOfStock
              ? `<button class="add-btn" style="opacity:.3;cursor:not-allowed" disabled>${Icons.plus}</button>`
              : `<button class="add-btn" onclick="event.stopPropagation();Cart.add({id:'${p.id}',name:'${p.name}',price:${p.price},icon:'${p.icon||'food'}',campusId:'${p.campusId||''}'})">${Icons.plus}</button>`
            }
          </div>
        </div>
      </div>`;
  },
};

// ── Categories ────────────────────────────────────────────────────
const Categories = {
  async fetch() {
    try {
      const data = await API.getCategories();
      if (data?.data?.length) {
        Categories.render(data.data.map(c => ({
          id: c.id,
          name: c.name,
          cat: c.name.toLowerCase(),
          iconUrl: c.iconUrl || null,
        })));
        return;
      }
    } catch { /* ignore */ }
  },

  render(cats) {
    const all   = `<div class="cat-chip active" onclick="Categories.filter(this,'all')">${CatIcons.default} All Items</div>`;
    const chips = cats.map(c => {
      const iconHtml = c.iconUrl
        ? `<img src="${c.iconUrl}" alt="" style="width:14px;height:14px;object-fit:contain">`
        : (CatIcons[c.cat] || CatIcons.default);
      return `<div class="cat-chip" onclick="Categories.filter(this,'${c.cat}')" data-cat-id="${c.id}">${iconHtml} ${c.name}</div>`;
    }).join('');
    ['catsScroll','catsScroll2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = all + chips;
    });
  },

  filter(el, cat) {
    document.querySelectorAll('#catsScroll .cat-chip, #catsScroll2 .cat-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    if (cat === 'all') {
      const user = Session.get();
      if (user?.campusId) Products.fetch(user.campusId);
      else Products.renderAll();
    } else {
      const filtered = PRODUCTS.filter(p => p.cat.includes(cat.replace(/s$/, '')));
      Products.renderGrid('homeProductGrid', filtered.slice(0, 6));
      Products.renderGrid('allProductGrid', filtered);
    }
  },
};

// ── Recently Viewed ───────────────────────────────────────────────
let recentlyViewed = Storage.get('kb_recent', []);
const RecentlyViewed = {
  add(p) {
    recentlyViewed = recentlyViewed.filter(x => x.id !== p.id);
    recentlyViewed.unshift(p);
    if (recentlyViewed.length > KB.RECENTLY_VIEWED_MAX) recentlyViewed.pop();
    Storage.set('kb_recent', recentlyViewed);
    this.render();
  },
  clear() { recentlyViewed = []; Storage.remove('kb_recent'); this.render(); },
  render() {
    const wrap   = document.getElementById('recentlyViewed');
    const scroll = document.getElementById('recentScroll');
    if (!wrap || !scroll) return;
    if (!recentlyViewed.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    scroll.innerHTML = recentlyViewed.map(p => `
      <div class="recent-card" onclick="Modal.quickView('${p.id}')">
        <div class="recent-img">${getProductIcon(p)}</div>
        <div class="recent-name">${p.name}</div>
        <div class="recent-price">${fmtPrice(p.price)}</div>
      </div>`).join('');
  },
};
/* === src\scripts\cart.js === */
// ── KIMBWETA BITES — Cart ───────────────────────────────────────

const CartStore = {
  data: Storage.get('kb_cart', {}),
  save() { Storage.set('kb_cart', this.data); },
  add(p) {
    if (!this.data[p.id]) this.data[p.id] = { ...p, qty: 0 };
    this.data[p.id].qty++;
    this.save();
  },
  remove(id)      { delete this.data[id]; this.save(); },
  update(id, d)   { if (!this.data[id]) return; this.data[id].qty += d; if (this.data[id].qty <= 0) this.remove(id); else this.save(); },
  items()         { return Object.values(this.data); },
  count()         { return this.items().reduce((s,i) => s + i.qty, 0); },
  total()         { return this.items().reduce((s,i) => s + i.price * i.qty, 0); },
  clear()         { this.data = {}; this.save(); },
};

const Cart = {
  add(product) {
    CartStore.add(product);
    Cart.updateUI();
    Toast.show('success', `${product.name} added!`);
    Products.renderAll();
  },
  updateQty(id, delta) {
    CartStore.update(id, delta);
    Cart.updateUI();
    Products.renderAll();
  },
  quickAdd(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p || p.stock === 0) return;
    Cart.add({ id:p.id, name:p.name, price:p.price, icon:p.icon||'food', campusId:p.campusId||'' });
  },

  updateUI() {
    const count = CartStore.count();
    const total = CartStore.total();

    // Nav badges
    ['navCartCount','navCartCount2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
    });

    // Float cart
    const fc = document.getElementById('floatCart');
    if (fc) {
      fc.classList.toggle('visible', count > 0);
      const ft = document.getElementById('floatCartText');
      const fp = document.getElementById('floatCartPrice');
      if (ft) ft.textContent = `View Cart · ${count} item${count>1?'s':''}`;
      if (fp) fp.textContent = fmtPrice(total);
    }

    // Sticky cart
    const sc = document.getElementById('stickyCart');
    if (sc) {
      sc.classList.toggle('visible', count > 0);
      const scc = document.getElementById('stickyCartCount');
      const sct = document.getElementById('stickyCartTotal');
      if (scc) scc.textContent = `${count} item${count!==1?'s':''}`;
      if (sct) sct.textContent = fmtPrice(total);
    }

    const ci = document.getElementById('cartItemCount');
    if (ci) ci.textContent = `${count} item${count!==1?'s':''}`;

    Cart.renderDrawer();
  },

  renderDrawer() {
    const body   = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');
    if (!body) return;
    const items = CartStore.items();

    if (!items.length) {
      body.innerHTML = `<div class="cart-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <div class="h3">Your cart is empty</div>
        <div style="font-size:14px;color:var(--text2)">Add some delicious items to get started</div>
        <button class="btn btn-primary" onclick="closeAll()">Browse Menu</button>
      </div>`;
      if (footer) footer.innerHTML = '';
      return;
    }

    body.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${ProductIcons[item.icon] || ProductIcons.food}</div>
        <div style="flex:1;min-width:0">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${fmtPrice(item.price * item.qty)}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="Cart.updateQty('${item.id}',-1)">${Icons.minus}</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty('${item.id}',1)">${Icons.plus}</button>
        </div>
      </div>`).join('');

    if (footer) footer.innerHTML = `
      <div class="cart-total-row">
        <span style="font-size:15px;color:var(--text2)">Subtotal</span>
        <span class="grad-text" style="font-family:var(--ff-display);font-weight:800;font-size:22px">${fmtPrice(CartStore.total())}</span>
      </div>
      <p style="font-size:12px;color:var(--text3);margin-bottom:12px;text-align:center">Delivery fee added at checkout</p>
      <button class="btn btn-primary btn-lg" style="width:100%" onclick="startCheckout()">
        ${Icons.cart} Proceed to Checkout
      </button>`;
  },
};

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.body.classList.add('no-scroll');
  Cart.updateUI();
}

function closeAll() {
  ['cartDrawer','overlay','quickViewModal','authModal','checkoutModal'].forEach(id =>
    document.getElementById(id)?.classList.remove('open')
  );
  document.body.classList.remove('no-scroll');
}
/* === src\scripts\auth.js === */
var currentUser = null;

var Session = {
  set: function(user, at, rt) {
    var normalizedUser = { ...user, role: String(user ? user.role || '' : '').toLowerCase() };
    Storage.setStr('kb_token', at);
    Storage.setStr('kb_refresh', rt);
    Storage.set('kb_user', normalizedUser);
    currentUser = normalizedUser;
    renderUserNav();
    if (normalizedUser && normalizedUser.campusId && typeof Products !== 'undefined') Products.fetch(normalizedUser.campusId);
    if (typeof Categories !== 'undefined') Categories.fetch();
  },
  get: function()        { return Storage.get('kb_user'); },
  getToken: function()   { return Storage.getStr('kb_token'); },
  getRefresh: function() { return Storage.getStr('kb_refresh'); },
  clear: function() {
    ['kb_token','kb_refresh','kb_user','kb_user_updated'].forEach(function(k) { Storage.remove(k); });
    currentUser = null;
    renderUserNav();
  },
  isLoggedIn: function() { return !!this.getToken() && !!this.get(); },
};

async function restoreSession() {
  var token  = Session.getToken();
  var cached = Session.get();
  if (!token || !cached) {
    renderUserNav();
    return;
  }
  // Both tokens expired → clear silently, no console 401
  if (typeof _isJWTExpired === 'function' && _isJWTExpired(token)) {
    var rt = Session.getRefresh();
    if (!rt || _isJWTExpired(rt)) {
      Session.clear();
      renderUserNav();
      return;
    }
  }
  currentUser = { ...cached, role: String(cached ? cached.role || '' : '').toLowerCase() };
  var lastUpdated = Storage.get('kb_user_updated');
  var needsRefresh = !lastUpdated || (Date.now() - lastUpdated) > (5 * 60 * 1000);

  if (needsRefresh) {
    try {
      var data = await API.getMe();
      if (data && data.data) {
        currentUser = { ...data.data, role: String(data.data.role || '').toLowerCase() };
        Storage.set('kb_user', currentUser);
        Storage.set('kb_user_updated', Date.now());
      }
    } catch (error) {
      console.warn('restoreSession: getMe failed, using cached data', error);
    }
  }

  renderUserNav();
}

function renderUserNav() {
  var containers = ['userNavBtn', 'userNavBtn2', 'userNavBtnDiscovery'];
  for (var c = 0; c < containers.length; c++) {
    var el = document.getElementById(containers[c]);
    if (!el) continue;

    if (currentUser) {
      var role = String(currentUser.role || '').toLowerCase();
      var isAdmin = role === 'admin' || role === 'super_admin';
      var initial = (currentUser.name || 'U').charAt(0).toUpperCase();
      var roleLabel = role.replace('_', ' ');
      var dashHref = role === 'super_admin' ? 'super-admin.html' : (role === 'admin' ? 'admin.html' : '#');
      var dashAction = isAdmin ? 'goAdmin()' : '';
      var dashHtml = isAdmin
        ? '<div class="dropdown-divider"></div><button class="dropdown-item" onclick="goAdmin()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>Dashboard</button>'
        : '';

      el.innerHTML =
        '<div class="user-dropdown" onclick="event.stopPropagation()">' +
          '<button class="user-btn" onclick="this.closest(\'.user-dropdown\').classList.toggle(\'open\')">' +
            '<div class="user-avatar">' + initial + '</div>' +
            '<span class="user-name">' + escapeHtml(currentUser.name || 'User') + '</span>' +
            '<svg class="user-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="dropdown-menu">' +
            '<div class="dropdown-header">' +
              '<div class="dropdown-user-name">' + escapeHtml(currentUser.name || 'User') + '</div>' +
              '<div class="dropdown-user-role">' + roleLabel + '</div>' +
            '</div>' +
            dashHtml +
            '<div class="dropdown-divider"></div>' +
            '<button class="dropdown-item" onclick="Router.navigate(\'/account\')">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
              'Account Center' +
            '</button>' +
            '<div class="dropdown-divider"></div>' +
            '<button class="dropdown-item danger" onclick="Auth.logout()">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>' +
              'Sign Out' +
            '</button>' +
          '</div>' +
        '</div>';
    } else {
      el.innerHTML =
        '<button class="btn btn-primary btn-sm" onclick="Auth.showLogin()" type="button">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>' +
          'Sign In' +
        '</button>';
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function goAdmin() {
  if (!currentUser) return;
  var role = String(currentUser.role || '').toLowerCase();
  if (role === 'super_admin') {
    window.location.href = 'super-admin.html';
  } else if (role === 'admin') {
    window.location.href = 'admin.html';
  }
}

var pendingPhone = '';

function startCheckout() {
  if (Session.isLoggedIn()) { closeAll(); setTimeout(function() { Checkout.open(); }, 100); return; }
  closeAll();
  Auth.showLogin();
}

function openAuthModal() {
  document.getElementById('authModal').classList.add('active');
  document.getElementById('overlay').classList.add('open');
  document.body.classList.add('no-scroll');
}

var Auth = {
  _campuses: null,

  _loadCampuses: async function() {
    if (Auth._campuses) return Auth._campuses;
    try {
      var data = await API.getCampuses();
      Auth._campuses = data && data.data || [];
    } catch (e) {
      Auth._campuses = [];
    }
    return Auth._campuses;
  },

  showLogin: function() {
    try {
      var authModal = document.getElementById('authModal');
      var authContent = document.getElementById('authContent');
      if (!authModal || !authContent) { alert('Sign In modal not available'); return; }

      authContent.innerHTML =
        '<form onsubmit="Auth.doLogin(); return false;">' +
          '<div class="modal-header">' +
            '<div>' +
              '<div class="h3">Sign In</div>' +
              '<div style="font-size:13px;color:var(--text2);margin-top:4px">Mobile number + password</div>' +
            '</div>' +
            '<button class="modal-close" type="button" onclick="closeAll()">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="modal-body" style="display:flex;flex-direction:column;gap:16px">' +
            '<div class="field"><label>Mobile Number</label>' +
              '<div class="input-wrap">' +
                '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.88 4.18 2 2 0 0 1 4.87 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 9.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
                '<input class="input" placeholder="0757744555" type="tel" id="loginPhone">' +
              '</div>' +
            '</div>' +
            '<div class="field"><label>Password</label>' +
              '<div class="input-wrap">' +
                '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
                '<input class="input" placeholder="Enter password" type="password" id="loginPassword">' +
              '</div>' +
            '</div>' +
            '<div id="loginError" style="color:var(--red);font-size:13px;display:none;padding:10px;background:rgba(220,38,38,.08);border-radius:8px;border:1px solid rgba(220,38,38,.15)"></div>' +
            '<button class="btn btn-primary btn-lg" style="width:100%" id="loginBtn" type="submit">Sign In</button>' +
            '<div style="text-align:center;font-size:13px;color:var(--text3)">' +
              'No account?' +
              ' <span style="color:var(--brand);cursor:pointer;font-weight:600" onclick="Auth.showRegister()">Create one</span>' +
            '</div>' +
            '<div style="text-align:center;font-size:13px;color:var(--text3)">' +
              '<span style="color:var(--brand);cursor:pointer" onclick="Auth.showOtpLogin()">Sign in with OTP instead</span>' +
            '</div>' +
          '</div>' +
        '</form>';

      openAuthModal();
      setTimeout(function() { var el = document.getElementById('loginPhone'); if (el) el.focus(); }, 100);
    } catch (error) {
      console.error('Auth.showLogin error:', error);
      alert('Error showing login form: ' + error.message);
    }
  },

  doLogin: async function() {
    var phone = document.getElementById('loginPhone');
    var password = document.getElementById('loginPassword');
    var errEl = document.getElementById('loginError');
    var btn = document.getElementById('loginBtn');
    phone = phone ? phone.value.trim().replace(/[\s-]/g, '') : '';
    password = password ? password.value : '';

    if (!phone || !password) {
      if (errEl) { errEl.textContent = 'Enter your mobile number and password.'; errEl.style.display = 'block'; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
    if (errEl) errEl.style.display = 'none';

    try {
      console.log('[Auth] Login request:', { phone });
      var r = await API.loginWithPassword(phone, password);
      var data = await r.json();
      console.log('[Auth] Login response:', r.status, data);

      if (!r.ok) {
        if (errEl) { errEl.textContent = data && data.message || 'Invalid phone number or password.'; errEl.style.display = 'block'; }
        return;
      }

      var payload = (data && data.data && data.data.data) || (data && data.data) || {};
      var token = payload.accessToken || payload.token;
      var refreshToken = payload.refreshToken || null;
      var user = payload.user || payload;
      var normalizedRole = String(user ? user.role || '' : '').toLowerCase();

      if (!token || !user) {
        if (errEl) { errEl.textContent = 'Invalid response from server.'; errEl.style.display = 'block'; }
        return;
      }

      Session.set({ ...user, role: normalizedRole }, token, refreshToken);
      closeAll();
      Toast.show('success', 'Welcome back, ' + (user.name || 'user') + '!');

      var lowerRole = normalizedRole;
      if (lowerRole === 'super_admin') {
        setTimeout(function() { window.location.href = 'super-admin.html'; }, 500);
      } else if (lowerRole === 'admin') {
        setTimeout(function() { window.location.href = 'admin.html'; }, 500);
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      if (errEl) { errEl.textContent = 'Server temporarily unavailable. Please try again.'; errEl.style.display = 'block'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    }
  },

  showOtpLogin: function() {
    var modal = document.getElementById('authContent');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-header">' +
        '<div>' +
          '<div class="h3">Sign In with OTP</div>' +
          '<div style="font-size:13px;color:var(--text2);margin-top:4px">A 6-digit code will be sent to your phone</div>' +
        '</div>' +
        '<button class="modal-close" onclick="closeAll()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal-body" style="display:flex;flex-direction:column;gap:16px">' +
        '<div class="field"><label>Mobile Number</label>' +
          '<div class="input-wrap">' +
            '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.88 4.18 2 2 0 0 1 4.87 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 9.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
            '<input class="input" placeholder="0757744555" type="tel" id="otpPhone">' +
          '</div>' +
        '</div>' +
        '<div id="otpSendError" style="color:var(--red);font-size:13px;display:none"></div>' +
        '<button class="btn btn-primary btn-lg" style="width:100%" id="sendOtpBtn" onclick="Auth.sendOtpForLogin()">Send OTP</button>' +
        '<div style="text-align:center;font-size:13px;color:var(--text3)">' +
          '<span style="color:var(--brand);cursor:pointer" onclick="Auth.showLogin()">Back to password login</span>' +
        '</div>' +
      '</div>';
    openAuthModal();
  },

  sendOtpForLogin: async function() {
    var phone = document.getElementById('otpPhone');
    var errEl = document.getElementById('otpSendError');
    var btn = document.getElementById('sendOtpBtn');
    phone = phone ? phone.value.trim().replace(/[\s-]/g, '') : '';
    if (!phone) { if (errEl) { errEl.textContent = 'Enter your phone number.'; errEl.style.display = 'block'; } return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    try {
      console.log('[Auth] Send OTP request:', { phone });
      var r = await API.sendOtp(phone);
      var data = await r.json();
      console.log('[Auth] Send OTP response:', r.status, data);
      if (r.ok) {
        pendingPhone = phone;
        Auth.showOtpVerify(phone);
      } else {
        if (errEl) { errEl.textContent = data && data.message || 'Failed to send OTP.'; errEl.style.display = 'block'; }
      }
    } catch (e) {
      console.error('[Auth] Send OTP error:', e);
      if (errEl) { errEl.textContent = 'Connection error.'; errEl.style.display = 'block'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send OTP'; }
    }
  },

  showOtpVerify: function(phone) {
    var modal = document.getElementById('authContent');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-header">' +
        '<div>' +
          '<div class="h3">Enter OTP</div>' +
          '<div style="font-size:13px;color:var(--text2);margin-top:4px">Sent to <strong>' + escapeHtml(phone) + '</strong></div>' +
        '</div>' +
        '<button class="modal-close" onclick="closeAll()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="otp-inputs">' +
          [0,1,2,3,4,5].map(function(i) {
            return '<input class="otp-input" maxlength="1" id="otp' + i + '">';
          }).join('') +
        '</div>' +
        '<div id="otpVerifyError" style="color:var(--red);font-size:13px;display:none;margin-bottom:12px"></div>' +
        '<button class="btn btn-primary btn-lg" style="width:100%" id="verifyOtpBtn" onclick="Auth.doVerifyOtp()">Verify and Sign In</button>' +
        '<div style="text-align:center;font-size:13px;color:var(--text3);margin-top:12px">' +
          '<span style="color:var(--brand);cursor:pointer" onclick="Auth.sendOtpForLogin()">Resend OTP</span>' +
        '</div>' +
      '</div>';
    openAuthModal();

    for (var i = 0; i < 6; i++) {
      (function(idx) {
        var el = document.getElementById('otp' + idx);
        if (!el) return;
        el.addEventListener('input', function() { if (el.value) { var next = document.getElementById('otp' + (idx + 1)); if (next) next.focus(); } });
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace' && !el.value) { var prev = document.getElementById('otp' + (idx - 1)); if (prev) prev.focus(); }
          if (e.key === 'Enter') Auth.doVerifyOtp();
        });
      })(i);
    }
    setTimeout(function() { var el = document.getElementById('otp0'); if (el) el.focus(); }, 100);
  },

  doVerifyOtp: async function() {
    var otp = '';
    for (var i = 0; i < 6; i++) { var el = document.getElementById('otp' + i); otp += (el ? el.value || '' : ''); }
    var errEl = document.getElementById('otpVerifyError');
    var btn = document.getElementById('verifyOtpBtn');
    if (otp.length < 6) { if (errEl) { errEl.textContent = 'Enter the complete 6-digit code.'; errEl.style.display = 'block'; } return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }
    try {
      console.log('[Auth] OTP verify request:', { phone: pendingPhone });
      var r = await API.verifyOtp(pendingPhone, otp);
      var data = await r.json();
      console.log('[Auth] OTP verify response:', r.status, data);

      if (!r.ok) {
        if (errEl) { errEl.textContent = data && data.message || 'Invalid OTP.'; errEl.style.display = 'block'; }
        if (btn) { btn.disabled = false; btn.textContent = 'Verify and Sign In'; }
        return;
      }

      var payload = (data && data.data && data.data.data) || (data && data.data) || {};
      var token = payload.accessToken || payload.token;
      var refreshToken = payload.refreshToken || null;
      var user = payload.user || payload;
      var normalizedRole = String(user ? user.role || '' : '').toLowerCase();

      if (!token || !user) {
        if (errEl) { errEl.textContent = 'Invalid response from server.'; errEl.style.display = 'block'; }
        if (btn) { btn.disabled = false; btn.textContent = 'Verify and Sign In'; }
        return;
      }

      Session.set({ ...user, role: normalizedRole }, token, refreshToken);
      closeAll();
      Toast.show('success', 'Welcome, ' + (user.name || 'user') + '!');

      var lowerRole = normalizedRole;
      if (lowerRole === 'super_admin') {
        setTimeout(function() { window.location.href = 'super-admin.html'; }, 500);
      } else if (lowerRole === 'admin') {
        setTimeout(function() { window.location.href = 'admin.html'; }, 500);
      }
    } catch (error) {
      console.error('[Auth] OTP verify error:', error);
      if (errEl) { errEl.textContent = 'Connection error.'; errEl.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Verify and Sign In'; }
    }
  },

  showRegister: async function() {
    var campuses = await Auth._loadCampuses();
    var campusOptions = campuses.map(function(c) { return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join('');
    var modal = document.getElementById('authContent');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-header">' +
        '<div>' +
          '<div class="h3">Create Account</div>' +
          '<div style="font-size:13px;color:var(--text2);margin-top:4px">Quick setup to place your order</div>' +
        '</div>' +
        '<button class="modal-close" onclick="closeAll()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal-body" style="display:flex;flex-direction:column;gap:14px">' +
        '<div class="field"><label>Full Name</label>' +
          '<div class="input-wrap">' +
            '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
            '<input class="input" placeholder="e.g. Amina Hassan" id="regName">' +
          '</div>' +
        '</div>' +
        '<div class="field"><label>Campus</label>' +
          '<select class="input select" id="regCampus"><option value="">Select your campus</option>' + campusOptions + '</select>' +
        '</div>' +
        '<div class="field"><label>Phone Number</label>' +
          '<div class="input-wrap">' +
            '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.88 4.18 2 2 0 0 1 4.87 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 9.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
            '<input class="input" placeholder="0757744555" type="tel" id="regPhone">' +
          '</div>' +
        '</div>' +
        '<div class="field"><label>Password</label>' +
          '<div class="input-wrap">' +
            '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
            '<input class="input" placeholder="Minimum 6 characters" type="password" id="regPassword">' +
          '</div>' +
        '</div>' +
        '<div id="regError" style="color:var(--red);font-size:13px;display:none;padding:10px;background:rgba(220,38,38,.08);border-radius:8px"></div>' +
        '<button class="btn btn-primary btn-lg" style="width:100%" id="regBtn" onclick="Auth.doRegister()">Create Account</button>' +
        '<div style="text-align:center;font-size:13px;color:var(--text3)">' +
          'Have an account?' +
          ' <span style="color:var(--brand);cursor:pointer;font-weight:600" onclick="Auth.showLogin()">Sign in</span>' +
        '</div>' +
      '</div>';
    openAuthModal();
  },

  doRegister: async function() {
    var name = document.getElementById('regName');
    var campusId = document.getElementById('regCampus');
    var phone = document.getElementById('regPhone');
    var password = document.getElementById('regPassword');
    var errEl = document.getElementById('regError');
    var btn = document.getElementById('regBtn');

    name = name ? name.value.trim() : '';
    campusId = campusId ? campusId.value : '';
    phone = phone ? phone.value.trim().replace(/[\s-]/g, '') : '';
    password = password ? password.value : '';

    if (!name || !campusId || !phone || !password) {
      if (errEl) { errEl.textContent = 'All fields are required.'; errEl.style.display = 'block'; }
      return;
    }
    if (password.length < 6) {
      if (errEl) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
    if (errEl) errEl.style.display = 'none';

    try {
      console.log('[Auth] Register request:', { name, phone, campusId });
      var r = await API.register({ name: name, phoneNumber: phone, campusId: campusId, password: password, role: 'customer' });
      var data = await r.json();
      console.log('[Auth] Register response:', r.status, data);
      if (r.ok) {
        Toast.show('success', 'Account created! Signing you in...');
        var loginR = await API.loginWithPassword(phone, password);
        var loginData = await loginR.json();
        var loginPayload = (loginData && loginData.data && loginData.data.data) || (loginData && loginData.data) || {};
        var loginToken = loginPayload.accessToken || loginPayload.token;
        var loginRefresh = loginPayload.refreshToken || null;
        var loginUser = loginPayload.user || loginPayload;
        if (loginR.ok && loginToken && loginUser) {
          Session.set({ ...loginUser, role: String(loginUser ? loginUser.role || '' : '').toLowerCase() }, loginToken, loginRefresh);
          closeAll();
          Toast.show('success', 'Welcome, ' + name + '!');
        } else {
          Auth.showLogin();
        }
      } else {
        if (errEl) { errEl.textContent = data && data.message || 'Registration failed.'; errEl.style.display = 'block'; }
      }
    } catch (e) {
      console.error('[Auth] Register error:', e);
      if (errEl) { errEl.textContent = 'Connection error. Please try again.'; errEl.style.display = 'block'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
    }
  },

  logout: async function() {
    closeAll();
    try { await API.post(EP.LOGOUT, {}); } catch (e) {}
    Session.clear();
    Products.fetch();
    Toast.show('info', 'Signed out successfully.');
  },
};
/* === src\scripts\checkout.js === */
// ── KIMBWETA BITES — Checkout v2.0 ─────────────────────────────

const Checkout = {
  async _loadCampuses() {
    try {
      const data = await API.getCampuses();
      return data?.data || [];
    } catch { return []; }
  },

  _nonEmpty(s) {
    return s && String(s).trim().length > 0;
  },

  async _resolveCampusId(user, items) {
    if (Checkout._nonEmpty(user?.campusId)) return user.campusId;
    for (const item of items) {
      if (Checkout._nonEmpty(item.campusId)) return item.campusId;
    }
    return null;
  },

  async open() {
    const items = CartStore.items();
    if (!items.length) { Toast.show('error', 'Your cart is empty'); return; }
    const total    = CartStore.total();
    const user     = Session.get();
    const campusId = await Checkout._resolveCampusId(user, items);

    // If campusId still missing, load campuses for a dropdown
    const needCampusSelector = !campusId;
    let campuses = [];
    let campusOptionsHtml = '';
    if (needCampusSelector) {
      campuses = await Checkout._loadCampuses();
      campusOptionsHtml = campuses.map(c =>
        `<option value="${c.id}">${escapeHtml(c.name)}</option>`
      ).join('');
    }

    // Fetch payment details from backend (dynamic per campus)
    let paymentDetails = [];
    if (campusId) {
      try {
        const data = await API.getPaymentDetails(campusId);
        paymentDetails = data?.data || [];
      } catch { /* use empty */ }
    }

    const mobilePayHtml = paymentDetails.length
      ? paymentDetails.map(p => `
          <div style="background:var(--bg3);border-radius:var(--r);padding:14px;margin-top:8px">
            <div class="label" style="margin-bottom:6px">Send payment to</div>
            <div style="font-size:15px;font-weight:700;color:var(--brand)">${p.provider}</div>
            <div style="font-size:15px;font-weight:700;font-family:monospace;margin:4px 0">${p.phoneNumber}</div>
            <div style="font-size:13px;color:var(--text2)">${p.accountName}</div>
            ${p.instructions ? `<div style="font-size:12px;color:var(--text3);margin-top:6px">${p.instructions}</div>` : ''}
          </div>`).join('')
      : `<div style="background:var(--bg3);border-radius:var(--r);padding:12px;margin-top:8px">
           <div style="font-size:13px;color:var(--text2)">Payment details will be provided after your order is confirmed.</div>
         </div>`;

    document.getElementById('checkoutContent').innerHTML = `
      <div class="modal-header">
        <div><span class="label">Final Step</span><div class="h3" style="margin-top:4px">Complete Your Order</div></div>
        <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
      </div>
      <div class="modal-body">

        <div class="checkout-section">
          <div class="checkout-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Order Summary
          </div>
          ${items.map(i => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:32px;height:32px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center">${ProductIcons[i.icon] || ProductIcons.food}</div>
                <span>${i.name} × ${i.qty}</span>
              </div>
              <span style="font-weight:600">${fmtPrice(i.price * i.qty)}</span>
            </div>`).join('')}
          <div style="display:flex;justify-content:space-between;padding-top:12px;font-family:var(--ff-display);font-weight:700">
            <span>Total</span>
            <span class="grad-text" style="font-size:18px">${fmtPrice(total)}</span>
          </div>
        </div>

        ${user ? `
          <div class="checkout-section">
            <div class="checkout-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Delivery Contact
            </div>
            <div style="background:var(--bg3);border-radius:var(--r);padding:12px 14px">
              <div style="font-weight:600">${user.name}</div>
              <div style="font-size:13px;color:var(--text2);margin-top:2px">${user.phoneNumber}</div>
            </div>
          </div>` : ''}

        ${needCampusSelector ? `
        <div class="checkout-section">
          <div class="checkout-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            Select Campus
          </div>
          <select class="input select" id="checkoutCampus">
            <option value="">Choose your campus</option>
            ${campusOptionsHtml}
          </select>
        </div>` : ''}

        <div class="checkout-section">
          <div class="checkout-section-title">
            ${Icons.mapPin} Delivery Location
          </div>
          <button class="btn btn-ghost" style="width:100%;margin-bottom:10px;gap:8px" onclick="Checkout.getGPS()">
            ${Icons.mapPin} Use GPS Location
          </button>
          <input class="input" placeholder="Block C, Room 14, near library..." id="locationText">
        </div>

        <div class="checkout-section">
          <div class="checkout-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
            Payment Method
          </div>
          <div class="payment-option selected" onclick="Checkout.selectPayment(this,'cash')" id="payOptCash">
            <div class="payment-radio"><div class="payment-radio-inner"></div></div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
            <div><div style="font-weight:600;font-size:14px">Cash on Delivery</div><div style="font-size:12px;color:var(--text2)">Pay when order arrives</div></div>
          </div>
          <div class="payment-option" onclick="Checkout.selectPayment(this,'mobile')" id="payOptMobile">
            <div class="payment-radio"><div class="payment-radio-inner"></div></div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>
            <div><div style="font-weight:600;font-size:14px">Mobile Money</div><div style="font-size:12px;color:var(--text2)">M-Pesa, Tigo, Airtel</div></div>
          </div>
          <div id="mobilePayDetails" style="display:none">${mobilePayHtml}</div>
        </div>

        <button class="btn btn-primary btn-lg" style="width:100%" onclick="Checkout.placeOrder()">
          ${Icons.check} Place Order — ${fmtPrice(total)}
        </button>
      </div>`;

    document.getElementById('checkoutModal').classList.add('open');
    document.getElementById('overlay').classList.add('open');
    document.body.classList.add('no-scroll');
  },

  selectPayment(el, method) {
    document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    const md = document.getElementById('mobilePayDetails');
    if (md) md.style.display = method === 'mobile' ? 'block' : 'none';
  },

  getGPS() {
    if (!navigator.geolocation) { Toast.show('error', 'GPS not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const el = document.getElementById('locationText');
        if (el) el.value = `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        Toast.show('success', 'Location captured!');
      },
      () => Toast.show('error', 'Could not get location')
    );
  },

  async placeOrder() {
    const user         = Session.get();
    const items        = CartStore.items();
    const locationText = document.getElementById('locationText')?.value?.trim();
    if (!locationText) { Toast.show('error', 'Please enter a delivery location'); return; }
    const campusDropdown = document.getElementById('checkoutCampus');
    const campusId = campusDropdown
      ? campusDropdown.value
      : await Checkout._resolveCampusId(user, items);
    if (!Checkout._nonEmpty(campusId)) {
      Toast.show('error', 'Please select your campus to continue');
      return;
    }
    const paymentMethod = document.getElementById('payOptMobile')?.classList.contains('selected') ? 'MOBILE' : 'CASH';

    const payload = {
      campusId,
      paymentMethod,
      locationText,
      items: items.map(i => ({ productId: i.id, quantity: i.qty })),
    };

    try {
      const r = await API.createOrder(payload);
      if (r.ok) {
        closeAll();
        CartStore.clear();
        Cart.updateUI();
        Toast.show('success', 'Order placed successfully!');
        API.invalidate('/orders');
        setTimeout(() => Router.navigate('/orders'), 1000);
        return;
      }
      const data = await r.json();
      const detail = data.errors
        ? Object.values(data.errors).flat().join(', ')
        : '';
      Toast.show('error', detail || data.message || 'Failed to place order');
    } catch {
      Toast.show('error', 'Connection error. Please try again.');
    }
  },
};
/* === src\scripts\socket.js === */
// ── KIMBWETA BITES — Socket.io Client v2.0 ─────────────────────

const SocketClient = {
  socket: null,

  connect() {
    if (typeof io === 'undefined') return; // socket.io CDN not loaded
    if (this.socket?.connected) return;

    const token = Storage.getStr('kb_token');
    if (!token) return; // Don't connect unauthenticated

    const serverUrl = KB.API_BASE.replace('/api/v1', '');

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
    });

    this.socket.on('connect', () => {
      console.info('[Socket] Connected');
    });

    // Order updates → toast notification + refresh tracking
    this.socket.on('order_updated', (event) => {
      const status = (event.status || '').replace(/_/g, ' ');
      Toast.show('info', `Order update: ${status}`);
      API.invalidate('/orders');
      if (typeof Tracking !== 'undefined' && document.getElementById('view-tracking')?.classList.contains('active')) {
        Tracking.load();
      }
    });

    // New orders (for admin pages that include this script)
    this.socket.on('new_order', (event) => {
      const user = Session.get();
      if (['admin', 'super_admin'].includes(user?.role)) {
        Toast.show('info', `🔔 New order — TZS ${Number(event.totalAmount || 0).toLocaleString()}`);
        // Refresh orders if loadDashboard exists (admin pages)
        if (typeof loadDashboard === 'function') loadDashboard();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.info('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  },

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  },
};
/* === src\scripts\tracking.js === */
const Tracking = {
  orderId: null,
  _statuses: ['PENDING','ACCEPTED','PREPARING','ON_THE_WAY','DELIVERED'],
  _labels: { PENDING:'Order Placed', ACCEPTED:'Accepted', PREPARING:'Preparing', 'ON_THE_WAY':'On the Way', DELIVERED:'Delivered' },
  _descs:  { PENDING:'Your order has been placed', ACCEPTED:'Restaurant accepted your order', PREPARING:'Your food is being prepared', 'ON_THE_WAY':'Rider is on the way', DELIVERED:'Order delivered! Enjoy' },

  async load() {
    const user = Session.get();
    if (!user) { document.getElementById('trackingContent').innerHTML = '<div class="empty-state"><p>Please log in to view orders</p></div>'; return; }
    document.getElementById('trackingContent').innerHTML = '<div class="loading-state">Loading order status...</div>';
    try {
      API.invalidate('/orders');
      const result = await API.getOrders();
      const orders = result?.data?.data || result?.data || [];
      if (!Array.isArray(orders) || !orders.length) {
        document.getElementById('trackingContent').innerHTML = '<div class="empty-state"><p>No orders yet</p></div>';
        return;
      }
      this.orderId = orders[0].id;
      this.render(orders[0]);
      this.initSocket(this.orderId);
    } catch (err) {
      document.getElementById('trackingContent').innerHTML = '<div class="error-state"><p>Failed to load orders</p></div>';
    }
  },

  render(order) {
    if (!order) return;
    const idx = this._statuses.indexOf(order.status);
    const cancelled = order.status === 'CANCELLED';

    document.getElementById('trackOrderNum').textContent = `Order #${(order.id || '').slice(0,8).toUpperCase()}`;

    const stepIcon = (s, i, isDone, isActive) => {
      if (isDone) return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>`;
      if (s === 'PENDING') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
      if (s === 'ACCEPTED') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>`;
      if (s === 'PREPARING') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z"/></svg>`;
      if (s === 'ON_THE_WAY') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14M12 7v6M9 10l3 3 3-3M3 21h18"/></svg>`;
      if (s === 'DELIVERED') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>`;
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
    };

    let stepsHtml = '';
    if (cancelled) {
      stepsHtml = `<div class="tracking-step">
        <div style="display:flex;flex-direction:column;align-items:center">
          <div class="step-icon done" style="background:var(--red);border-color:transparent;color:#fff;box-shadow:none"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18M6 6l12 12"/></svg></div>
        </div>
        <div class="step-content">
          <div class="step-title" style="color:var(--red)">Cancelled</div>
          <div class="step-desc">${escapeHtml(order.cancellationReason || 'Order was cancelled')}</div>
        </div>
      </div>`;
    } else {
      stepsHtml = this._statuses.map((s, i) => {
        const isDone = i < idx;
        const isActive = i === idx;
        return `<div class="tracking-step">
          <div style="display:flex;flex-direction:column;align-items:center">
            <div class="step-icon ${isDone?'done':''} ${isActive?'active':''}">${stepIcon(s, i, isDone, isActive)}</div>
            ${i < this._statuses.length - 1 ? `<div class="step-line ${isDone?'done':''}"></div>` : ''}
          </div>
          <div class="step-content">
            <div class="step-title">${this._labels[s]}</div>
            <div class="step-desc">${isActive ? 'In progress' : isDone ? 'Completed' : this._descs[s]}</div>
          </div>
        </div>`;
      }).join('');
    }

    const items = order.items || [];
    const paymentLabel = order.paymentMethod === 'MOBILE' ? 'Mobile Money' : 'Cash on Delivery';

    document.getElementById('trackingContent').innerHTML = `<div style="background:var(--surface);border-radius:16px;padding:24px;border:1px solid var(--border);margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:14px;color:var(--text2)">${items.length} item${items.length!==1?'s':''} · ${paymentLabel}</span>
        <span style="font-size:16px;font-weight:700;color:var(--brand)" id="trackTotal">${fmtPrice(order.totalAmount)}</span>
      </div>
      ${order.locationText ? `<div style="font-size:13px;color:var(--text2);margin-bottom:16px">📍 ${escapeHtml(order.locationText)}</div>` : ''}
      <div class="tracking-steps">${stepsHtml}</div>
    </div>
    <div style="background:var(--surface);border-radius:16px;padding:24px;border:1px solid var(--border)">
      <div class="label" style="margin-bottom:12px">Order Items</div>
      ${items.map(item => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px">
        <span><span style="color:var(--text2)">${item.quantity}×</span> ${escapeHtml(item.productNameSnapshot || 'Item')}</span>
        <span style="font-weight:600">${fmtPrice(Number(item.priceAtTime || 0) * Number(item.quantity || 1))}</span>
      </div>`).join('')}
    </div>`;
  },

  refresh() {
    if (document.getElementById('view-tracking')?.classList.contains('active')) {
      this.load();
    }
  },

  _feedbacksShown: {},

  initSocket(orderId) {
    this._feedbacksShown[orderId] = true;
    if (typeof io === 'undefined') return;
    const socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      query: { orderId },
    });
    socket.on('connect', () => {
      socket.emit('track_order', orderId);
    });
    socket.on('order_updated', (data) => {
      const status = data?.status || data?.order?.status;
      if (!status) return;
      if (status === 'DELIVERED' && !this._feedbacksShown['del_' + orderId]) {
        this._feedbacksShown['del_' + orderId] = true;
        setTimeout(() => Feedback.showDelivery(orderId), 500);
      }
      if (status === 'CANCELLED' && !this._feedbacksShown['can_' + orderId]) {
        this._feedbacksShown['can_' + orderId] = true;
        setTimeout(() => Feedback.showCancellation(orderId), 500);
      }
    });
  },
};
/* === src\scripts\discovery-tracker.js === */
const DiscoveryTracker = {
  _queue: [],
  _flushTimer: null,
  _sentPageView: false,
  FLUSH_INTERVAL: 5000,
  MAX_BATCH: 50,

  init() {
    if (this._sentPageView) return;
    this._sentPageView = true;
    document.addEventListener('DOMContentLoaded', () => this._trackPageView());
    this._startFlushTimer();
    if (document.readyState !== 'loading') this._trackPageView();
  },

  _trackPageView() {
    const user = Session.get();
    this._enqueue({
      eventType: 'page_view',
      entityType: 'page',
      entityId: window.location.hash || '/',
      metadata: { referrer: document.referrer || '', title: document.title },
    });
  },

  trackProductView(productId, productName, categoryId) {
    this._enqueue({
      eventType: 'product_view',
      entityType: 'product',
      entityId: productId,
      metadata: { productName, categoryId, title: document.title },
    });
  },

  trackProductClick(productId, productName, categoryId) {
    this._enqueue({
      eventType: 'product_click',
      entityType: 'product',
      entityId: productId,
      metadata: { productName, categoryId },
    });
  },

  trackAddToCart(productId, productName, categoryId, quantity) {
    this._enqueue({
      eventType: 'add_to_cart',
      entityType: 'product',
      entityId: productId,
      metadata: { productName, categoryId, quantity: quantity || 1 },
    });
  },

  trackSearch(query, categoryId) {
    this._enqueue({
      eventType: 'search',
      entityType: 'search',
      metadata: { query, categoryId: categoryId || '' },
    });
  },

  _enqueue(event) {
    event.idempotencyKey = `${event.eventType}:${event.entityId || ''}:${Date.now()}`;
    this._queue.push(event);
    if (this._queue.length >= this.MAX_BATCH) this._flush();
  },

  _startFlushTimer() {
    if (this._flushTimer) clearInterval(this._flushTimer);
    this._flushTimer = setInterval(() => this._flush(), this.FLUSH_INTERVAL);
  },

  _flush() {
    if (!this._queue.length) return;
    const batch = this._queue.splice(0, this.MAX_BATCH);
    const user = Session.get();
    const body = JSON.stringify({ events: batch });
    const url = `${KB.API_BASE}${EP.DISCOVERY_TRACK}`;
    const token = Storage.getStr('kb_token');
    if (token) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body,
        keepalive: true,
      }).catch(() => {});
    } else {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    }
  },
};

document.addEventListener('DOMContentLoaded', () => DiscoveryTracker.init());
/* === src\scripts\discovery-feed.js === */
const DiscoveryFeed = {
  async load() {
    const el = document.getElementById('discoveryContent');
    if (!el) return;
    el.innerHTML = DiscoveryFeed._loadingHTML();
    try {
      const user = Session.get();
      const calls = [
        API.getCategories(),
        API.getDiscoveryTrending({ limit: 12 }),
        API.getDiscoveryMostPurchased(12),
        API.getDiscoveryMostShared(12),
        API.getDiscoveryMostLoved(12),
      ];
      if (user) { calls.push(API.getDiscoveryFriendsRec()); calls.push(API.getDiscoveryForYou()); }
      const [catRes, trendRes, popRes, shareRes, loveRes, friendRes, youRes] = await Promise.allSettled(calls);
      const categories = catRes.value?.data?.data || [];
      const trending = trendRes.value?.data?.data || [];
      const popular = popRes.value?.data?.data || [];
      const shared = shareRes.value?.data?.data || [];
      const loved = loveRes.value?.data?.data || [];
      const friends = friendRes?.value?.data?.data || [];
      const forYou = youRes?.value?.data?.data || [];

      // Smart navigation pills (not product categories — these are discovery filters)
      const navPills = [
        { type: 'nav', id: '',     name: 'All' },
        { type: 'nav', id: 'trending', name: 'Trending', icon: 'flame' },
      ];
      // Real product categories from super admin (same as home page)
      const prodCats = categories.map(c => ({ type: 'cat', id: c.id, name: c.name, iconUrl: c.iconUrl }));
      // Location & time filters
      const extraPills = [
        { type: 'nav', id: 'nearby', name: 'Near You', icon: 'map' },
        { type: 'nav', id: 'new',    name: 'New Arrivals', icon: 'clock' },
      ];
      const allCats = [...navPills, { type: 'divider' }, ...prodCats, ...(prodCats.length ? [{ type: 'divider' }] : []), ...extraPills];

      const sections = [];
      if (forYou.length) sections.push({ id: 'forYou', title: 'For You', subtitle: 'Recommended for you', data: forYou });
      sections.push({ id: 'trending', title: 'Trending Now', subtitle: 'Popular this week', data: trending });
      sections.push({ id: 'popular', title: 'Most Purchased', subtitle: 'Top campus picks', data: popular });
      if (shared.length) sections.push({ id: 'shared', title: 'Most Shared', subtitle: 'Loved by many', data: shared });
      if (loved.length) sections.push({ id: 'loved', title: 'Most Loved', subtitle: 'Highest rated', data: loved });
      if (friends.length) sections.push({ id: 'friends', title: 'Friends Recommend', subtitle: 'From people you know', data: friends });

      el.innerHTML = `
        ${DiscoveryFeed._heroHTML()}
        ${DiscoveryFeed._categoriesHTML(allCats)}
        <div class="disc-body">
          <div class="disc-sections">
            ${sections.map(s => DiscoveryFeed._sectionHTML(s)).join('')}
          </div>
        </div>`;
      DiscoveryFeed._initArrows();
    } catch (e) {
      el.innerHTML = '<div class="disc-body" style="padding-top:60px"><div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><p style="color:var(--text3);font-size:14px">Could not load discoveries.</p><button class="btn btn-primary btn-sm" onclick="DiscoveryFeed.load()" style="margin-top:4px">Try Again</button></div></div>';
    }
  },

  _heroHTML() {
    return `
      <div class="disc-hero">
        <h1 class="disc-hero-title">Discover</h1>
        <p class="disc-hero-sub">Find products you may love</p>
        <div class="disc-hero-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search products..." onkeydown="if(event.key==='Enter'&&this.value.trim()){Router.navigate('/products');setTimeout(()=>{const s=document.getElementById('searchInput');if(s){s.value=this.value;s.dispatchEvent(new Event('input'))}},300)}">
        </div>
      </div>`;
  },

  _categoriesHTML(cats) {
    const icons = {
      flame: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      map: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    };
    let hasActive = false;
    const html = cats.map(c => {
      if (c.type === 'divider') return '<span class="disc-cat-div"></span>';
      const isDefault = c.type === 'nav' && c.id === '';
      const active = isDefault && !hasActive ? (hasActive = true) : false;
      const iconHtml = c.iconUrl
        ? `<img src="${c.iconUrl}" alt="">`
        : (icons[c.icon] || '');
      return `<button class="disc-cat${active ? ' active' : ''}" onclick="DiscoveryFeed._goCategory('${c.id}')">${iconHtml}${escapeHtml(c.name)}</button>`;
    }).join('');
    return `<div class="disc-cats"><div class="disc-cats-scroll">${html}</div></div>`;
  },

  _sectionHTML(s) {
    return `
      <div class="disc-sec" id="disc-sec-${s.id}">
        <div class="disc-sec-head">
          <div class="disc-sec-head-l">
            <h3 class="disc-sec-title">${s.title}</h3>
            <span class="disc-sec-sub">${s.subtitle}</span>
          </div>
          <div class="disc-sec-acts">
            <button class="disc-arr disc-arr-p" data-sec="${s.id}" onclick="DiscoveryFeed._scroll('${s.id}',-1)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button class="disc-arr disc-arr-n" data-sec="${s.id}" onclick="DiscoveryFeed._scroll('${s.id}',1)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div class="disc-track" id="disc-track-${s.id}">
          ${s.data.map(p => DiscoveryFeed._card(p)).join('')}
        </div>
      </div>`;
  },

  _card(p) {
    const img = p.imageUrl || '';
    const rating = p.averageRating || 0;
    const orders = p._count?.orderItems || 0;
    const reviews = p._count?.reviews || 0;
    const shares = p._count?.shares || 0;
    const views = p._count?.views || 0;
    const loves = p._count?.loves || 0;
    const initial = (p.name || 'P')[0];
    const campus = p.campus?.name || '';
    const cat = p.category?.name || '';
    const isPopular = orders > 10;
    const fmtCount = n => n >= 1000 ? (n/1000).toFixed(1).replace('.0','') + 'k' : n;
    return `
      <div class="disc-card" onclick="Modal.quickView('${p.id}')">
        <div class="disc-card-img">
          ${img
            ? `<img src="${img}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="disc-card-init" style="display:none">${initial}</span>`
            : `<span class="disc-card-init">${initial}</span>`}
          ${isPopular ? `<span class="disc-card-badge">Popular</span>` : ''}
          <button class="disc-card-save" onclick="event.stopPropagation();DiscoveryFeed._toggleSave(this,'${p.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="disc-card-add" onclick="event.stopPropagation();Cart.quickAdd('${p.id}')" title="Add to cart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        <div class="disc-card-body">
          <h4 class="disc-card-name">${escapeHtml(p.name)}</h4>
          <div class="disc-card-price">${fmtPrice(p.price)}</div>
          ${cat ? `<span class="disc-card-cat">${escapeHtml(cat)}</span>` : ''}
          <div class="disc-card-stats">
            ${rating ? `<span class="disc-card-stat"><svg width="11" height="11" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${rating.toFixed(1)}${reviews ? ` (${reviews})` : ''}</span>` : ''}
            ${views ? `<span class="disc-card-stat"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${fmtCount(views)}</span>` : ''}
            ${shares ? `<span class="disc-card-stat"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> ${fmtCount(shares)}</span>` : ''}
            ${orders ? `<span class="disc-card-stat"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> ${fmtCount(orders)}</span>` : ''}
          </div>
          <div class="disc-card-acts">
            <button class="disc-card-btn disc-card-btn-v" onclick="event.stopPropagation();Modal.quickView('${p.id}')">View Product</button>
            <button class="disc-card-btn disc-card-btn-s" onclick="event.stopPropagation();Share.show('${p.id}','${escapeHtml(p.name).replace(/'/g,"\\'")}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
          </div>
        </div>
      </div>`;
  },

  _toggleSave(btn, id) {
    const svg = btn.querySelector('svg');
    const isSaved = svg.getAttribute('fill') === 'currentColor' || svg.getAttribute('fill') === 'var(--brand)';
    if (isSaved) {
      svg.setAttribute('fill', 'none');
      btn.style.color = '';
    } else {
      svg.setAttribute('fill', 'var(--brand)');
      btn.style.color = 'var(--brand)';
    }
  },

  _initArrows() {
    document.querySelectorAll('.disc-track').forEach(el => {
      let raf = null;
      const check = () => {
        const sec = el.closest('.disc-sec');
        if (!sec) return;
        const p = sec.querySelector('.disc-arr-p');
        const n = sec.querySelector('.disc-arr-n');
        if (p) p.style.display = el.scrollLeft < 8 ? 'none' : 'flex';
        if (n) n.style.display = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8 ? 'none' : 'flex';
        raf = null;
      };
      el.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(check); });
      setTimeout(check, 200);
    });
  },

  _scroll(id, dir) {
    const el = document.getElementById('disc-track-' + id);
    if (!el) return;
    const w = (el.querySelector('.disc-card')?.offsetWidth || 200) + 16;
    el.scrollBy({ left: w * (dir > 0 ? 2 : -2), behavior: 'smooth' });
  },

  _goCategory(id) {
    document.querySelectorAll('.disc-cat').forEach(c => c.classList.remove('active'));
    const activeEl = document.querySelectorAll('.disc-cat');
    if (!id) {
      activeEl.forEach(c => { if (c.textContent.trim().toLowerCase() === 'all') c.classList.add('active'); });
      return;
    }
    activeEl.forEach(c => { if (c.textContent.trim().toLowerCase() === id.toLowerCase()) c.classList.add('active'); });
    if (id === 'trending') {
      document.getElementById('disc-sec-trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (id === 'nearby') {
      Router.navigate('/products?nearby=1');
    } else if (id === 'new') {
      Router.navigate('/products?new=1');
    } else {
      Router.navigate('/products?category=' + id);
    }
  },

  _loadingHTML() {
    return `
      <div class="disc-hero" style="padding-bottom:20px">
        <div class="dsk" style="height:32px;width:120px;margin:0 auto 8px;border-radius:6px"></div>
        <div class="dsk" style="height:16px;width:200px;margin:0 auto 16px;border-radius:4px"></div>
        <div class="dsk" style="height:42px;width:100%;max-width:360px;margin:0 auto;border-radius:99px"></div>
      </div>
      <div class="disc-cats" style="padding-bottom:8px"><div class="disc-cats-scroll">${Array(6).fill('<div class="dsk" style="height:34px;width:80px;border-radius:99px;flex-shrink:0"></div>').join('')}</div></div>
      <div class="disc-body">
        <div class="disc-sections">
          ${Array(3).fill('').map((_,i) => `
            <div class="disc-sec" style="margin-bottom:20px">
              <div class="disc-sec-head" style="margin-bottom:12px">
                <div class="dsk" style="height:20px;width:140px;border-radius:4px"></div>
              </div>
              <div style="display:flex;gap:14px">${Array(4).fill('<div class="dsk" style="height:340px;min-width:180px;border-radius:14px;flex-shrink:0"></div>').join('')}</div>
            </div>`).join('')}
        </div>
      </div>`;
  },
};
/* === src\scripts\share.js === */
const Share = {
  _reasons: [
    'I bought it and liked it',
    'Good price',
    'Good quality',
    'Fast delivery',
    'Looks delicious',
    'My friend may like it',
    'Other',
  ],

  show(productId, productName) {
    const reasons = this._reasons.map(r => `<label class="radio-option" onclick="Share._selectReason(this,'${r}')"><input type="radio" name="shareReason" value="${r}"><span>${r}</span></label>`).join('');
    openModal(`
      <div style="padding:24px;max-width:420px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div class="h3">Share With Friend</div>
          <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
        </div>
        <div class="label" style="margin-bottom:12px">Why are you sharing this product?</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px" id="shareReasons">${reasons}</div>
        <button class="btn btn-primary btn-lg" style="width:100%" id="shareReasonBtn" disabled onclick="Share._showPlatforms('${productId}','${productName}')">Continue</button>
      </div>
    `);
  },

  _selectReason(el, reason) {
    document.querySelectorAll('#shareReasons .radio-option').forEach(r => r.classList.remove('active'));
    el.classList.add('active');
    el.querySelector('input').checked = true;
    document.getElementById('shareReasonBtn').disabled = false;
    document.getElementById('shareReasonBtn').dataset.reason = reason;
  },

  _showPlatforms(productId, productName) {
    const reason = document.getElementById('shareReasonBtn').dataset.reason;
    const p = PRODUCTS.find(x => x.id === productId);
    const campusName = p?.campusId ? 'Campus' : 'University';
    const price = p ? fmtPrice(p.price) : '';
    const shareText = `*${productName}* — ${price}\nFrom KIMBWETA BITES\n\n${p?.description || ''}`;
    const shareUrl = window.location.origin + '/?product=' + productId;

    document.getElementById('modalContent').innerHTML = `
      <div style="padding:24px;max-width:420px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div class="h3">Share Via</div>
          <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
          <button class="btn btn-outline btn-lg" style="justify-content:flex-start;gap:12px" onclick="Share._send('${productId}','${reason.replace(/'/g,"\\'")}','whatsapp','${productName.replace(/'/g,"\\'")}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Share on WhatsApp
          </button>
          <button class="btn btn-outline btn-lg" style="justify-content:flex-start;gap:12px" onclick="Share._send('${productId}','${reason.replace(/'/g,"\\'")}','telegram','${productName.replace(/'/g,"\\'")}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0088cc"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Share on Telegram
          </button>
          <button class="btn btn-outline btn-lg" style="justify-content:flex-start;gap:12px" onclick="Share._send('${productId}','${reason.replace(/'/g,"\\'")}','facebook','${productName.replace(/'/g,"\\'")}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Share on Facebook
          </button>
          <button class="btn btn-outline btn-lg" style="justify-content:flex-start;gap:12px" onclick="Share._send('${productId}','${reason.replace(/'/g,"\\'")}','instagram','${productName.replace(/'/g,"\\'")}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Share on Instagram
          </button>
          <button class="btn btn-ghost btn-lg" style="justify-content:flex-start;gap:12px" onclick="Share._send('${productId}','${reason.replace(/'/g,"\\'")}','copy','${productName.replace(/'/g,"\\'")}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Copy Link
          </button>
        </div>
        <div style="background:var(--bg2);border-radius:12px;padding:16px;display:flex;gap:12px;align-items:center">
          <div style="width:48px;height:48px;border-radius:8px;overflow:hidden;background:var(--brand-muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:var(--brand)">
            ${p?.imageUrl ? `<img src="${p.imageUrl}" style="width:100%;height:100%;object-fit:cover">` : 'K'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:14px">${productName}</div>
            <div style="font-size:12px;color:var(--text2)">${price} · KIMBWETA BITES</div>
          </div>
        </div>
      </div>
    `;
  },

  async _send(productId, reason, platform, productName) {
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`*${productName}* from KIMBWETA BITES\n\n${window.location.origin}/?product=${productId}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/?product=' + productId)}&text=${encodeURIComponent(productName + ' - KIMBWETA BITES')}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/?product=' + productId)}`,
      instagram: `https://instagram.com`,
      copy: null,
    };
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(window.location.origin + '/?product=' + productId);
        Toast.show('success', 'Link copied to clipboard!');
      } catch { Toast.show('error', 'Failed to copy link'); }
    } else if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=600');
    }
    try {
      await API.shareProduct(productId, reason, platform);
    } catch {}
    if (platform !== 'copy') Toast.show('success', 'Shared successfully!');
    closeAll();
  },
};
/* === src\scripts\feedback.js === */
const Feedback = {
  _ratings: [
    { value: 5, emoji: '😍', label: 'Excellent' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 3, emoji: '😐', label: 'Average' },
    { value: 2, emoji: '😞', label: 'Poor' },
    { value: 1, emoji: '😡', label: 'Very Poor' },
  ],

  _categories: ['Food Quality', 'Packaging', 'Delivery Speed', 'Price', 'Customer Service', 'Product Availability', 'Other'],

  _cancelReasons: ['Delivery taking too long', 'Changed my mind', 'Product unavailable', 'Found another option', 'Price too high', 'Other'],

  showDelivery(orderId) {
    const ratingBtns = this._ratings.map(r => `<button class="feedback-rating-btn" data-value="${r.value}" onclick="Feedback._selectRating(this,${r.value})"><span class="feedback-emoji">${r.emoji}</span><span>${r.label}</span></button>`).join('');
    const catBtns = this._categories.map(c => `<button class="feedback-cat-btn" data-cat="${c}" onclick="Feedback._toggleCat(this)">${c}</button>`).join('');
    openModal(`
      <div style="padding:24px;max-width:480px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div class="h3">How was your experience?</div>
          <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:24px" id="ratingOptions">${ratingBtns}</div>
        <div class="label" style="margin-bottom:12px">What influenced your experience?</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px" id="catOptions">${catBtns}</div>
        <div class="label" style="margin-bottom:8px">Tell us more (optional)</div>
        <textarea class="input" style="width:100%;min-height:80px;resize:vertical;margin-bottom:20px" id="feedbackMessage" placeholder="Share your thoughts..."></textarea>
        <button class="btn btn-primary btn-lg" style="width:100%" onclick="Feedback._submitDelivery('${orderId}')">Submit Feedback</button>
      </div>
    `);
  },

  _selectRating(btn, value) {
    document.querySelectorAll('.feedback-rating-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    btn._rating = value;
  },

  _toggleCat(btn) {
    btn.classList.toggle('selected');
  },

  async _submitDelivery(orderId) {
    const ratingEl = document.querySelector('.feedback-rating-btn.selected');
    if (!ratingEl) { Toast.show('error', 'Please select a rating'); return; }
    const rating = parseInt(ratingEl.dataset.value);
    const cats = [...document.querySelectorAll('.feedback-cat-btn.selected')].map(b => b.dataset.cat);
    const message = document.getElementById('feedbackMessage')?.value?.trim() || '';
    try {
      const resp = await API.submitDeliveryFeedback(orderId, rating, cats.join(', '), message);
      if (resp.ok) {
        Toast.show('success', 'Thank you for your feedback!');
        closeAll();
        Feedback._askRecommend(orderId);
      } else {
        const err = await resp.json().catch(() => ({}));
        Toast.show('error', err.message || 'Failed to submit feedback');
      }
    } catch { Toast.show('error', 'Connection error'); }
  },

  _askRecommend(orderId) {
    openModal(`
      <div style="padding:24px;max-width:400px;text-align:center">
        <div style="font-size:48px;margin-bottom:16px">⭐</div>
        <div class="h3" style="margin-bottom:8px">Would you recommend this product to a friend?</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px">
          <button class="btn btn-primary" onclick="Feedback._submitRec('${orderId}','YES')">YES</button>
          <button class="btn btn-outline" onclick="Feedback._submitRec('${orderId}','MAYBE')">MAYBE</button>
          <button class="btn btn-ghost" onclick="Feedback._submitRec('${orderId}','NO'); closeAll()">NO</button>
        </div>
      </div>
    `);
  },

  async _submitRec(orderId, recommend) {
    try {
      await API.submitRecommendation(orderId, recommend);
    } catch {}
    closeAll();
    if (recommend === 'YES') {
      Toast.show('success', 'Great! Share with your friends!');
      setTimeout(() => {
        const order = null; // Trigger share flow
        Share.show('', '');
      }, 500);
    }
  },

  showCancellation(orderId) {
    const reasonBtns = this._cancelReasons.map(r => `<button class="feedback-cat-btn" data-reason="${r}" onclick="Feedback._toggleCat(this)">${r}</button>`).join('');
    openModal(`
      <div style="padding:24px;max-width:480px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div class="h3">Why did you cancel?</div>
          <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px" id="cancelReasons">${reasonBtns}</div>
        <div class="label" style="margin-bottom:8px">What can we improve?</div>
        <textarea class="input" style="width:100%;min-height:80px;resize:vertical;margin-bottom:20px" id="cancelMessage" placeholder="Tell us how we can do better..."></textarea>
        <button class="btn btn-primary btn-lg" style="width:100%" onclick="Feedback._submitCancel('${orderId}')">Submit</button>
      </div>
    `);
  },

  async _submitCancel(orderId) {
    const selected = [...document.querySelectorAll('#cancelReasons .feedback-cat-btn.selected')];
    if (!selected.length) { Toast.show('error', 'Please select a reason'); return; }
    const reason = selected.map(b => b.dataset.reason).join(', ');
    const message = document.getElementById('cancelMessage')?.value?.trim() || '';
    try {
      const resp = await API.submitCancellationFeedback(orderId, reason, message);
      if (resp.ok) {
        Toast.show('success', 'Thank you for your feedback!');
        closeAll();
      } else {
        const err = await resp.json().catch(() => ({}));
        Toast.show('error', err.message || 'Failed to submit');
      }
    } catch { Toast.show('error', 'Connection error'); }
  },
};
/* === src\scripts\product-request.js === */
const ProductRequest = {
  show() {
    openModal(`
      <div style="padding:24px;max-width:420px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div class="h3">Request a Product</div>
          <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
        </div>
        <div style="margin-bottom:16px">
          <div class="label" style="margin-bottom:8px">Product Name *</div>
          <input class="input" id="reqProductName" placeholder="e.g. Chicken Pizza" style="width:100%">
        </div>
        <div style="margin-bottom:20px">
          <div class="label" style="margin-bottom:8px">Additional Info (optional)</div>
          <textarea class="input" id="reqMessage" placeholder="Tell us more about what you're looking for..." style="width:100%;min-height:80px;resize:vertical"></textarea>
        </div>
        <button class="btn btn-primary btn-lg" style="width:100%" onclick="ProductRequest._submit()">Submit Request</button>
      </div>
    `);
  },

  async _submit() {
    const name = document.getElementById('reqProductName')?.value?.trim();
    if (!name) { Toast.show('error', 'Please enter a product name'); return; }
    const message = document.getElementById('reqMessage')?.value?.trim() || '';
    try {
      const resp = await API.requestProduct(name, message);
      if (resp.ok) {
        Toast.show('success', 'Product request submitted!');
        closeAll();
      } else {
        const err = await resp.json().catch(() => ({}));
        Toast.show('error', err.message || 'Failed to submit request');
      }
    } catch { Toast.show('error', 'Connection error'); }
  },
};
/* === src\scripts\account-center.js === */
// ── KIMBWETA BITES — Account Center v1.0 ─────────────────────────
// Sub-views: active-orders, purchase-history, saved-items, collections,
//            reviews, following, discovery-feed

const AccountCenter = {
  async init() {
    const user = Session.get();
    if (!user) { Auth.showLogin(); return; }
    this.renderHub();
  },

  // ── Hub / Index ───────────────────────────────────────────────
  renderHub() {
    const user = Session.get();
    if (!user) { document.getElementById('accountContent').innerHTML = '<p class="text3" style="text-align:center;padding:40px">Please sign in to view your account.</p>'; return; }

    const html = `
      <div class="acct-hub">
        <div class="acct-header">
          <div class="acct-avatar">${(user.name || 'U')[0].toUpperCase()}</div>
          <div>
            <div class="h3" style="margin:0">${escapeHtml(user.name || 'User')}</div>
            <div class="text2" style="font-size:13px">${escapeHtml(user.phoneNumber || user.email || '')}</div>
          </div>
        </div>
        <div class="acct-grid">
          <div class="acct-card" onclick="AccountCenter.renderActiveOrders()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Active Orders</span>
          </div>
          <div class="acct-card" onclick="AccountCenter.renderPurchaseHistory()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Purchase History</span>
          </div>
          <div class="acct-card" onclick="AccountCenter.renderSavedItems()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>Saved Items</span>
          </div>
          <div class="acct-card" onclick="AccountCenter.renderCollections()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span>Collections</span>
          </div>
          <div class="acct-card" onclick="AccountCenter.renderReviews()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>Reviews</span>
          </div>
          <div class="acct-card" onclick="AccountCenter.renderFollowing()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Following</span>
          </div>
        </div>
      </div>
    `;
    document.getElementById('accountContent').innerHTML = html;
  },

  // ── Active Orders ─────────────────────────────────────────────
  async renderActiveOrders() {
    this._showPage(`<div class="loading-state">Loading orders...</div>`);
    try {
      const res = await API.fetch(EP.ORDERS + '?status=PENDING,ACCEPTED,PREPARING,ON_THE_WAY');
      const data = await res.json();
      const orders = data.data?.data || [];
      if (!orders.length) {
        this._showPage('<div class="empty-state"><div class="h4" style="margin-bottom:8px">No Active Orders</div><p class="text2">You have no orders in progress.</p></div>');
        return;
      }
      const html = `<div class="acct-page"><div class="page-back" onclick="AccountCenter.renderHub()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Account</div><div class="h3" style="margin-bottom:16px">Active Orders</div>${orders.map(o => this._orderCard(o)).join('')}</div>`;
      this._showPage(html);
    } catch { this._showPage('<div class="empty-state"><p class="text2">Failed to load orders.</p></div>'); }
  },

  // ── Purchase History ──────────────────────────────────────────
  async renderPurchaseHistory() {
    this._showPage(`<div class="loading-state">Loading history...</div>`);
    try {
      const res = await API.fetch(EP.ORDERS + '?limit=50');
      const data = await res.json();
      const orders = data.data?.data || [];
      if (!orders.length) {
        this._showPage('<div class="empty-state"><div class="h4" style="margin-bottom:8px">No Orders Yet</div><p class="text2">Your order history will appear here.</p></div>');
        return;
      }
      const html = `<div class="acct-page"><div class="page-back" onclick="AccountCenter.renderHub()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Account</div><div class="h3" style="margin-bottom:16px">Purchase History</div>${orders.map(o => this._orderCard(o, true)).join('')}</div>`;
      this._showPage(html);
    } catch { this._showPage('<div class="empty-state"><p class="text2">Failed to load history.</p></div>'); }
  },

  // ── Saved Items ───────────────────────────────────────────────
  async renderSavedItems() {
    this._showPage(`<div class="loading-state">Loading saved items...</div>`);
    try {
      const res = await API.fetch(EP.SAVED_ITEMS);
      const data = await res.json();
      const items = data.data?.data || [];
      if (!items.length) {
        this._showPage('<div class="empty-state"><div class="h4" style="margin-bottom:8px">No Saved Items</div><p class="text2">Save products you love and find them here.</p></div>');
        return;
      }
      const html = `<div class="acct-page"><div class="page-back" onclick="AccountCenter.renderHub()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Account</div><div class="h3" style="margin-bottom:16px">Saved Items <span class="badge">${items.length}</span></div><div class="saved-grid">${items.map(i => `
        <div class="product-card-sm">
          <div class="product-card-sm-img" style="background-image:url('${escapeHtml(i.product?.imageUrl || 'https://placehold.co/200x200/f0f0f0/aaa?text=No+Image')}')"></div>
          <div class="product-card-sm-body">
            <div class="product-card-sm-name">${escapeHtml(i.product?.name || 'Product')}</div>
            <div class="product-card-sm-price">TZS ${(i.product?.price || 0).toLocaleString()}</div>
          </div>
          <button class="btn btn-ghost btn-xs" onclick="AccountCenter._unsave('${i.productId}')" title="Remove">✕</button>
        </div>
      `).join('')}</div></div>`;
      this._showPage(html);
    } catch { this._showPage('<div class="empty-state"><p class="text2">Failed to load saved items.</p></div>'); }
  },

  async _unsave(productId) {
    try {
      await API.fetch(`${EP.SAVED_ITEMS}/${productId}`, { method: 'DELETE' });
      Toast.success('Removed from saved');
      this.renderSavedItems();
    } catch { Toast.error('Failed to remove'); }
  },

  // ── Collections ───────────────────────────────────────────────
  async renderCollections() {
    this._showPage(`<div class="loading-state">Loading collections...</div>`);
    try {
      const res = await API.fetch(EP.COLLECTIONS);
      const data = await res.json();
      const collections = data.data?.data || [];
      let html = `<div class="acct-page"><div class="page-back" onclick="AccountCenter.renderHub()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Account</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div class="h3" style="margin:0">Collections</div>
          <button class="btn btn-primary btn-sm" onclick="AccountCenter._showNewCollectionForm()">+ New</button>
        </div>`;
      if (!collections.length) {
        html += '<div class="empty-state"><p class="text2">No collections yet. Create one to organize your favorites.</p></div>';
      } else {
        html += collections.map(c => `
          <div class="collection-card" onclick="AccountCenter._openCollection('${c.id}')">
            <div class="collection-card-body">
              <div class="fw-600">${escapeHtml(c.name)}</div>
              <div class="text2" style="font-size:12px">${c._count?.items || 0} items</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        `).join('');
      }
      html += '</div>';
      this._showPage(html);
    } catch { this._showPage('<div class="empty-state"><p class="text2">Failed to load collections.</p></div>'); }
  },

  _showNewCollectionForm() {
    const html = `
      <div class="modal-content-inner">
        <div class="h4" style="margin-bottom:12px">New Collection</div>
        <input class="input" id="newCollectionName" placeholder="Collection name" style="margin-bottom:8px">
        <textarea class="input" id="newCollectionDescapeHtml" placeholder="DescapeHtmlription (optional)" rows="2" style="margin-bottom:12px"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeAll()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="AccountCenter._createCollection()">Create</button>
        </div>
      </div>`;
    openModal(html);
  },

  async _createCollection() {
    const name = document.getElementById('newCollectionName')?.value?.trim();
    if (!name) { Toast.error('Name is required'); return; }
    try {
      await API.fetch(EP.COLLECTIONS, { method: 'POST', body: JSON.stringify({ name, descapeHtmlription: document.getElementById('newCollectionDescapeHtml')?.value }) });
      Toast.success('Collection created');
      closeAll();
      this.renderCollections();
    } catch { Toast.error('Failed to create'); }
  },

  async _openCollection(id) {
    this._showPage(`<div class="loading-state">Loading...</div>`);
    try {
      const res = await API.fetch(EP.COLLECTION(id));
      const data = await res.json();
      const col = data.data || {};
      const items = col.items || [];
      const html = `<div class="acct-page"><div class="page-back" onclick="AccountCenter.renderCollections()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Collections</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div><div class="h3" style="margin:0">${escapeHtml(col.name)}</div><div class="text2" style="font-size:12px">${items.length} items</div></div>
          <button class="btn btn-ghost btn-xs text-danger" onclick="if(confirm('Delete this collection?'))AccountCenter._deleteCollection('${id}')">Delete</button>
        </div>
        ${col.descapeHtmlription ? `<p style="font-size:13px;color:var(--text2);margin-bottom:12px">${escapeHtml(col.descapeHtmlription)}</p>` : ''}
        ${items.length ? '<div class="saved-grid">' + items.map(i => `
          <div class="product-card-sm">
            <div class="product-card-sm-img" style="background-image:url('${escapeHtml(i.product?.imageUrl || 'https://placehold.co/200x200/f0f0f0/aaa?text=No+Image')}')"></div>
            <div class="product-card-sm-body">
              <div class="product-card-sm-name">${escapeHtml(i.product?.name || 'Product')}</div>
              <div class="product-card-sm-price">TZS ${(i.product?.price || 0).toLocaleString()}</div>
            </div>
            <button class="btn btn-ghost btn-xs" onclick="AccountCenter._removeFromCollection('${id}','${i.productId}')" title="Remove">✕</button>
          </div>
        `).join('') + '</div>' : '<div class="empty-state"><p class="text2">This collection is empty. Browse products to add items.</p></div>'}
      </div>`;
      this._showPage(html);
    } catch { this._showPage('<div class="empty-state"><p class="text2">Failed to load collection.</p></div>'); }
  },

  async _deleteCollection(id) {
    try {
      await API.fetch(EP.COLLECTION(id), { method: 'DELETE' });
      Toast.success('Collection deleted');
      this.renderCollections();
    } catch { Toast.error('Failed to delete'); }
  },

  async _removeFromCollection(collectionId, productId) {
    try {
      await API.fetch(EP.COLLECTION_ITEM(collectionId, productId), { method: 'DELETE' });
      Toast.success('Item removed');
      this._openCollection(collectionId);
    } catch { Toast.error('Failed to remove'); }
  },

  // ── Reviews ───────────────────────────────────────────────────
  async renderReviews() {
    this._showPage(`<div class="loading-state">Loading reviews...</div>`);
    try {
      const res = await API.fetch(EP.ORDERS + '?limit=20&status=DELIVERED');
      const data = await res.json();
      const deliveredOrders = data.data?.data || [];
      const html = `<div class="acct-page"><div class="page-back" onclick="AccountCenter.renderHub()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Account</div>
        <div class="h3" style="margin-bottom:16px">Your Reviews</div>
        ${deliveredOrders.length ? `<p class="text2" style="margin-bottom:12px;font-size:13px">Products from delivered orders you can review:</p>
        <div class="saved-grid">${deliveredOrders.map(o => (o.items || []).map(item => `
          <div class="product-card-sm">
            <div class="product-card-sm-img" style="background-image:url('${escapeHtml(item.product?.imageUrl || 'https://placehold.co/200x200/f0f0f0/aaa?text=No+Image')}')"></div>
            <div class="product-card-sm-body">
              <div class="product-card-sm-name">${escapeHtml(item.productNameSnapshot || 'Product')}</div>
              <div class="product-card-sm-price">TZS ${(item.priceAtTime || 0).toLocaleString()}</div>
            </div>
            <button class="btn btn-primary btn-xs" onclick="AccountCenter._showReviewForm('${item.productId}','${escapeHtml(item.productNameSnapshot || 'Product')}','${o.id}')">Review</button>
          </div>
        `).join('')).join('')}</div>` : '<div class="empty-state"><p class="text2">No delivered orders to review yet.</p></div>'}
      </div>`;
      this._showPage(html);
    } catch { this._showPage('<div class="empty-state"><p class="text2">Failed to load.</p></div>'); }
  },

  _showReviewForm(productId, productName, orderId) {
    const html = `
      <div class="modal-content-inner">
        <div class="h4" style="margin-bottom:4px">Review ${escapeHtml(productName)}</div>
        <div class="stars-input" style="margin:12px 0;font-size:24px">
          ${[1,2,3,4,5].map(n => `<span class="star" data-val="${n}" onclick="AccountCenter._setRating(${n})" style="cursor:pointer;color:var(--border)">★</span>`).join('')}
        </div>
        <input class="input" id="reviewTitle" placeholder="Title (optional)" style="margin-bottom:8px">
        <textarea class="input" id="reviewBody" placeholder="Share your experience..." rows="3" style="margin-bottom:12px"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeAll()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="AccountCenter._submitReview('${productId}','${orderId}')">Submit</button>
        </div>
      </div>`;
    openModal(html);
    window._reviewRating = 0;
  },

  _setRating(n) {
    window._reviewRating = n;
    document.querySelectorAll('.stars-input .star').forEach((el, i) => {
      el.style.color = i < n ? 'var(--warning,#f59e0b)' : 'var(--border)';
    });
  },

  async _submitReview(productId, orderId) {
    const rating = window._reviewRating || 0;
    if (!rating) { Toast.error('Please select a rating'); return; }
    try {
      await API.fetch(EP.REVIEWS, { method: 'POST', body: JSON.stringify({ productId, orderId, rating, title: document.getElementById('reviewTitle')?.value, body: document.getElementById('reviewBody')?.value }) });
      Toast.success('Review submitted');
      closeAll();
      this.renderReviews();
    } catch (e) { Toast.error('Failed to submit review'); }
  },

  // ── Following ─────────────────────────────────────────────────
  async renderFollowing() {
    this._showPage(`<div class="loading-state">Loading...</div>`);
    try {
      const [folRes, ferRes] = await Promise.all([
        API.fetch(EP.FOLLOWING),
        API.fetch(EP.FOLLOWERS),
      ]);
      const folData = await folRes.json();
      const ferData = await ferRes.json();
      const following = folData.data?.data || [];
      const followers = ferData.data?.data || [];

      const html = `<div class="acct-page"><div class="page-back" onclick="AccountCenter.renderHub()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Account</div>
        <div class="h3" style="margin-bottom:16px">Following <span class="badge">${following.length}</span></div>
        ${following.length ? following.map(u => `
          <div class="user-row">
            <div class="user-row-avatar">${(u.name || 'U')[0].toUpperCase()}</div>
            <div class="user-row-body"><div class="fw-600">${escapeHtml(u.name || 'User')}</div><div class="text2" style="font-size:12px">${escapeHtml(u.role || '')}</div></div>
            <button class="btn btn-ghost btn-xs" onclick="AccountCenter._unfollow('${u.id}')">Unfollow</button>
          </div>
        `).join('') : '<div class="empty-state"><p class="text2">You are not following anyone yet.</p></div>'}
        <hr style="margin:20px 0;border-color:var(--border)">
        <div class="h4" style="margin-bottom:12px">Followers <span class="badge">${followers.length}</span></div>
        ${followers.length ? followers.map(u => `
          <div class="user-row">
            <div class="user-row-avatar">${(u.name || 'U')[0].toUpperCase()}</div>
            <div class="user-row-body"><div class="fw-600">${escapeHtml(u.name || 'User')}</div><div class="text2" style="font-size:12px">${escapeHtml(u.role || '')}</div></div>
          </div>
        `).join('') : '<div class="empty-state"><p class="text2">No followers yet.</p></div>'}
      </div>`;
      this._showPage(html);
    } catch { this._showPage('<div class="empty-state"><p class="text2">Failed to load.</p></div>'); }
  },

  async _unfollow(userId) {
    try {
      await API.fetch(EP.FOLLOW_USER(userId), { method: 'DELETE' });
      Toast.success('Unfollowed');
      this.renderFollowing();
    } catch { Toast.error('Failed to unfollow'); }
  },

  // ── Discovery Feed ────────────────────────────────────────────
  async renderDiscoveryFeed() {
    this._showPage(`<div class="loading-state">Loading discovery feed...</div>`);
    try {
      const [trendRes, popRes, newRes, forYouRes] = await Promise.all([
        API.fetch(EP.DISCOVER_TRENDING + '?limit=10'),
        API.fetch(EP.DISCOVER_POPULAR + '?limit=10'),
        API.fetch(EP.DISCOVER_NEW + '?limit=10'),
        API.fetch(EP.DISCOVER_FOR_YOU + '?limit=10').catch(() => null),
      ]);
      const trending = await trendRes.json();
      const popular = await popRes.json();
      const newArrivals = await newRes.json();
      const forYou = forYouRes ? await forYouRes.json() : { data: { data: [] } };

      const sections = [
        { title: 'For You', data: forYou.data?.data, id: 'forYou' },
        { title: 'Trending Now', data: trending.data?.data, id: 'trending' },
        { title: 'Popular', data: popular.data?.data, id: 'popular' },
        { title: 'New Arrivals', data: newArrivals.data?.data, id: 'newArrivals' },
      ];

      let html = `<div class="acct-page">
        <div class="h3" style="margin-bottom:20px">Discover</div>`;
      sections.forEach(s => {
        if (!s.data || !s.data.length) return;
        html += `<div class="disc-section" style="margin-bottom:24px">
          <div class="disc-section-title">${s.title}</div>
          <div class="disc-scroll">${s.data.map(p => `
            <div class="product-card-horiz" onclick="Modal.quickView('${p.id}')">
              <div class="product-card-horiz-img" style="background-image:url('${escapeHtml(p.imageUrl || 'https://placehold.co/150x150/f0f0f0/aaa?text=No+Image')}')"></div>
              <div class="product-card-horiz-body">
                <div class="product-card-horiz-name">${escapeHtml(p.name)}</div>
                <div class="product-card-horiz-price">TZS ${(p.price || 0).toLocaleString()}</div>
                ${p.averageRating ? `<div class="product-card-horiz-rating">★ ${p.averageRating.toFixed(1)}</div>` : ''}
              </div>
            </div>
          `).join('')}</div>
        </div>`;
      });
      html += '</div>';
      this._showPage(html);
    } catch { this._showPage('<div class="empty-state"><p class="text2">Failed to load discovery feed.</p></div>'); }
  },

  // ── Helpers ───────────────────────────────────────────────────
  _showPage(html) {
    document.getElementById('accountContent').innerHTML = html;
  },

  _orderCard(order, showBuyAgain) {
    const statusColors = { PENDING: 'var(--warning)', ACCEPTED: 'var(--info)', PREPARING: 'var(--info)', ON_THE_WAY: 'var(--info)', DELIVERED: 'var(--success)', CANCELLED: 'var(--danger)' };
    const color = statusColors[order.status] || 'var(--text2)';
    const items = order.items || [];
    return `
      <div class="order-card">
        <div class="order-card-header">
          <div><span class="fw-600">Order</span> <span class="text2" style="font-size:12px">#${order.id.slice(0,8)}</span></div>
          <span class="order-status-badge" style="background:${color}15;color:${color};border:1px solid ${color}30">${order.status.replace(/_/g,' ')}</span>
        </div>
        <div class="order-card-body">
          ${items.slice(0,3).map(i => `<div class="order-card-item"><span>${i.quantity}× ${escapeHtml(i.productNameSnapshot || 'Item')}</span><span>TZS ${((i.priceAtTime || 0) * i.quantity).toLocaleString()}</span></div>`).join('')}
          ${items.length > 3 ? `<div class="text2" style="font-size:12px">+${items.length - 3} more items</div>` : ''}
        </div>
        <div class="order-card-footer">
          <span style="font-size:12px;color:var(--text2)">${new Date(order.createdAt).toLocaleDateString()}</span>
          <span class="fw-600">TZS ${(order.totalAmount || 0).toLocaleString()}</span>
        </div>
        <div class="order-card-actions">
          <button class="btn btn-ghost btn-xs" onclick="AccountCenter._showTimeline('${order.id}')">Timeline</button>
          ${showBuyAgain && order.status !== 'CANCELLED' ? `<button class="btn btn-primary btn-xs" onclick="AccountCenter._buyAgain('${order.id}')">Buy Again</button>` : ''}
          ${(order.status === 'PENDING' || order.status === 'ACCEPTED') ? `<button class="btn btn-ghost btn-xs text-danger" onclick="AccountCenter._showCancelForm('${order.id}')">Cancel</button>` : ''}
          ${order.status === 'DELIVERED' ? `<button class="btn btn-ghost btn-xs" onclick="AccountCenter.renderReviews()">Review</button>` : ''}
        </div>
      </div>`;
  },

  async _showTimeline(orderId) {
    try {
      const res = await API.fetch(EP.ORDER_TIMELINE(orderId));
      const data = await res.json();
      const timeline = data.data || [];
      const html = `
        <div class="modal-content-inner">
          <div class="h4" style="margin-bottom:16px">Order Timeline</div>
          <div class="timeline">${timeline.map((t, i) => `
            <div class="timeline-item ${i === timeline.length - 1 ? 'active' : ''}">
              <div class="timeline-dot"></div>
              <div class="timeline-body">
                <div class="fw-600">${escapeHtml(t.label)}</div>
                <div class="text2" style="font-size:12px">${new Date(t.createdAt).toLocaleString()}</div>
                ${t.note ? `<div style="font-size:13px;margin-top:4px">${escapeHtml(t.note)}</div>` : ''}
              </div>
            </div>
          `).join('')}</div>
          <button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="closeAll()">Close</button>
        </div>`;
      openModal(html);
    } catch { Toast.error('Failed to load timeline'); }
  },

  async _buyAgain(orderId) {
    try {
      await API.fetch(EP.ORDER_BUY_AGAIN(orderId), { method: 'POST' });
      Toast.success('New order placed!');
      this.renderActiveOrders();
    } catch (e) { Toast.error('Failed to re-order. Some items may be unavailable.'); }
  },

  _showCancelForm(orderId) {
    const reasons = [
      { key: 'changed_mind', label: 'Changed my mind' },
      { key: 'found_better', label: 'Found a better option' },
      { key: 'too_long', label: 'Taking too long' },
      { key: 'wrong_item', label: 'Ordered wrong item' },
      { key: 'other', label: 'Other' },
    ];
    const html = `
      <div class="modal-content-inner">
        <div class="h4" style="margin-bottom:12px">Cancel Order</div>
        <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Please tell us why you're cancelling:</p>
        ${reasons.map(r => `<label class="radio-row" style="display:block;padding:8px 0;cursor:pointer"><input type="radio" name="cancelReason" value="${r.key}" data-label="${r.label}"> ${r.label}</label>`).join('')}
        <textarea class="input" id="cancelMessage" placeholder="Additional details (optional)" rows="2" style="margin-top:8px;margin-bottom:12px"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeAll()">Keep Order</button>
          <button class="btn btn-danger btn-sm" onclick="AccountCenter._confirmCancel('${orderId}')">Cancel Order</button>
        </div>
      </div>`;
    openModal(html);
  },

  async _confirmCancel(orderId) {
    const selected = document.querySelector('input[name="cancelReason"]:checked');
    if (!selected) { Toast.error('Please select a reason'); return; }
    try {
      await API.fetch(EP.ORDER_CANCEL(orderId), { method: 'POST', body: JSON.stringify({ reason: selected.value, reasonLabel: selected.dataset.label, customMessage: document.getElementById('cancelMessage')?.value }) });
      Toast.success('Order cancelled');
      closeAll();
      this.renderActiveOrders();
    } catch { Toast.error('Failed to cancel order'); }
  },
};
/* === src\components\modal.js === */
// ── KIMBWETA BITES — Modal Component ───────────────────────────

const Modal = {
  quickView(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    // Track recently viewed
    RecentlyViewed.add(p);

    const stockPct  = Math.min(100, (p.stock / 20) * 100);
    const icon      = getProductIcon(p);
    const desc      = p.description || 'Freshly prepared and delivered straight to your campus location.';
    const isLong    = desc.length > 90;
    const shortDesc = isLong ? desc.slice(0, 90) + '...' : desc;

    // "You May Also Like" — same category, max 6
    const similar = PRODUCTS.filter(x => x.id !== p.id && x.cat === p.cat).slice(0, 6);

    const alsoLike = similar.length ? `
      <div class="also-like-section">
        <div class="h4" style="margin-bottom:12px">You May Also Like</div>
        <div class="also-like-grid">
          ${similar.map(s => `
            <div class="also-like-card" onclick="Modal.quickView('${s.id}')">
              <div class="also-like-img">
                ${s.imageUrl
                  ? `<img src="${s.imageUrl}" alt="${s.name}" style="width:100%;height:100%;object-fit:cover">`
                  : getProductIcon(s)}
                <button class="also-like-add" onclick="event.stopPropagation();Cart.quickAdd('${s.id}')">
                  ${Icons.plus}
                </button>
              </div>
              <div class="also-like-info">
                <div class="also-like-name">${s.name}</div>
                <div class="also-like-price">${fmtPrice(s.price)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>` : '';

    document.getElementById('quickViewContent').innerHTML = `
      <div class="modal-header">
        <div>
          <span class="label">Quick View</span>
          <div class="h3" style="margin-top:4px">${p.name}</div>
        </div>
        <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
      </div>
      <div class="modal-body">
        <div class="qv-img">
          ${p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r2)" onerror="this.style.display='none'">`
            : `<div style="font-size:64px;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${icon}</div>`}
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          ${p.popular ? `<span class="badge badge-brand">${Icons.fire} Popular</span>` : ''}
          ${p.stock > 0
            ? `<span class="badge badge-green">${Icons.check} In stock</span>`
            : `<span class="badge badge-red">Sold out</span>`}
        </div>

        <div class="qv-price">${fmtPrice(p.price)}</div>
        <p style="font-size:13px;color:var(--text3);margin-bottom:14px">per serving</p>

        <!-- Description with read more -->
        <div style="margin-bottom:18px">
          <p style="font-size:14px;color:var(--text2);line-height:1.65" id="qvShortDesc">${shortDesc}</p>
          ${isLong ? `
            <button class="read-more-btn" id="readMoreBtn" onclick="Modal.toggleReadMore()">Read more ▾</button>
            <div class="read-more-content" id="qvFullDesc">${desc}</div>` : ''}
        </div>

        <!-- Stock -->
        <div class="qv-stock">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          <span style="font-size:13px;color:var(--text2)">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
          <div class="stock-bar"><div class="stock-fill" style="width:${stockPct}%"></div></div>
        </div>

        <!-- Add to cart -->
        <button
          class="btn btn-primary btn-lg"
          style="width:100%;margin-bottom:4px"
          ${p.stock === 0 ? 'disabled style="opacity:.4;cursor:not-allowed;width:100%"' : ''}
          onclick="Cart.add({id:'${p.id}',name:'${p.name}',price:${p.price},icon:'${p.icon||'food'}',campusId:'${p.campusId||''}'}); Modal._addFeedback(this)"
        >
          ${Icons.cart} ${p.stock === 0 ? 'Out of Stock' : `Add to Cart — ${fmtPrice(p.price)}`}
        </button>

        ${alsoLike}
      </div>`;

    document.getElementById('quickViewModal').classList.add('open');
    document.getElementById('overlay').classList.add('open');
    document.body.classList.add('no-scroll');
  },

  toggleReadMore() {
    const full  = document.getElementById('qvFullDesc');
    const short = document.getElementById('qvShortDesc');
    const btn   = document.getElementById('readMoreBtn');
    if (!full) return;
    const open = full.classList.toggle('open');
    if (short) short.style.display = open ? 'none' : 'block';
    if (btn)   btn.textContent = open ? 'Show less ▴' : 'Read more ▾';
  },

  /** Brief visual feedback when "Add to Cart" clicked */
  _addFeedback(btn) {
    if (!btn || btn.disabled) return;
    const orig = btn.innerHTML;
    btn.innerHTML = `${Icons.check} Added!`;
    btn.style.background = 'linear-gradient(135deg,#22C55E,#4ade80)';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      closeAll();
    }, 900);
  },
};
/* === src\components\search.js === */
// ── KIMBWETA BITES — Search Component ──────────────────────────

const Search = {
  _timer: null,

  handle(query) {
    clearTimeout(Search._timer);
    const dd = document.getElementById('searchDropdown');
    if (!query || query.length < 2) { dd?.classList.remove('open'); return; }

    // Show loading state immediately
    if (dd) {
      dd.innerHTML = `<div style="padding:14px;text-align:center;color:var(--text3);font-size:13px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite;display:inline-block;vertical-align:middle;margin-right:6px"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Searching...
      </div>`;
      dd.classList.add('open');
    }

    Search._timer = setTimeout(() => Search._run(query), KB.SEARCH_DEBOUNCE_MS);
  },

  async _run(query) {
    const dd = document.getElementById('searchDropdown');
    if (!dd) return;

    let results = [];

    try {
      const user = Session.get();
      const data = await API.getProducts(user?.campusId || null, null, query);
      const items = data?.data;
      const products = Array.isArray(items) ? items : (items?.data || []);
      if (products.length) {
        results = products.map(mapProduct);
      }
    } catch { /* ignore */ }

    if (!results.length) {
      dd.innerHTML = `
        <div class="error-state" style="padding:20px 14px">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p>No results for "<strong>${query}</strong>"</p>
        </div>`;
      return;
    }

    dd.innerHTML = results.slice(0, 7).map(p => `
      <div class="search-result-item" onclick="Modal.quickView('${p.id}');Search.close()">
        <div class="search-result-img">
          ${p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`
            : getProductIcon(p)}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${highlightMatch(p.name, query)}
          </div>
          <div style="font-size:12px;color:var(--text3);margin-top:1px">${fmtPrice(p.price)} · ${p.cat}</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="event.stopPropagation();Cart.quickAdd('${p.id}')">+</button>
      </div>`).join('');
  },

  close() {
    document.getElementById('searchDropdown')?.classList.remove('open');
  },
};
/* === src\components\floating-follow.js === */
// ── KIMBWETA BITES — Floating Follow Button ─────────────────────

const FAB = {
  open:        false,
  tooltipShown:false,
  links:       {},

  async init() {
    try {
      const data = await API.getSocialLinks();
      if (data && data.data) Object.assign(FAB.links, data.data);
    } catch (e) {
      FAB.links.whatsapp  = FAB.links.whatsapp  || 'https://wa.me/255757744555';
      FAB.links.instagram = FAB.links.instagram || 'https://instagram.com/kimbwetabites';
      FAB.links.call      = FAB.links.call      || 'tel:+255757744555';
    }

    // One-time tooltip: auto-show after 2s, hide after 4s
    if (!Storage.get('kb_fab_shown')) {
      setTimeout(() => {
        const tip = document.getElementById('fabTooltip');
        if (tip) {
          tip.style.opacity = '1';
          setTimeout(() => {
            tip.style.opacity = '0';
            Storage.set('kb_fab_shown', true);
            document.getElementById('fabWrap')?.classList.add('shown-once');
          }, 4000);
        }
      }, 2000);
    } else {
      document.getElementById('fabWrap')?.classList.add('shown-once');
    }

    // Close on scroll
    window.addEventListener('scroll', () => { if (FAB.open) FAB.toggle(); }, { passive: true });
  },

  toggle() {
    FAB.open = !FAB.open;
    const btn  = document.getElementById('fabMain');
    const menu = document.getElementById('fabMenu');
    const wrap = document.getElementById('fabWrap');
    btn?.classList.toggle('open',  FAB.open);
    menu?.classList.toggle('open', FAB.open);
    wrap?.classList.toggle('open', FAB.open);
  },

  close() { if (FAB.open) FAB.toggle(); },

  action(type) {
    const url = FAB.links[type];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    FAB.toggle();
  },
};

// Close when clicking outside FAB
document.addEventListener('click', (e) => {
  if (FAB.open && !e.target.closest('#fabWrap')) FAB.toggle();
});