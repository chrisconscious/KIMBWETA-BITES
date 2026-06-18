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
