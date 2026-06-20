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
