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
