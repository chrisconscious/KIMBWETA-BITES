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
