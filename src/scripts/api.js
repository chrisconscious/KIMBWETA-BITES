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
    return API.fetch('/products', {
      method: 'POST',
      body: formData,
    });
  },
  async updateProduct(id, formData) {
    return API.fetch(`/products/${id}`, {
      method: 'PATCH',
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
    const fd = new FormData();
    fd.append('file', file);
    return API.fetch(EP.SETTINGS_LOGO, {
      method: 'POST',
      body: fd,
    });
  },
  async removeLogo()                         { return API.del(EP.SETTINGS_LOGO_REMOVE); },
  async saveSetting(key, value) {
    API.invalidate('/settings');
    return API.post(EP.SETTINGS_SET, { key, value });
  },
  async uploadPreloaderLogo(file) {
    const fd = new FormData();
    fd.append('file', file);
    return API.fetch(EP.SETTINGS_PRELOADER_LOGO, {
      method: 'POST',
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
