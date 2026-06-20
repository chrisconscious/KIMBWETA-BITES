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
