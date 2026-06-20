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
