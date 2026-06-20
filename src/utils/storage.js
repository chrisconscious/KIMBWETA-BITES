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
