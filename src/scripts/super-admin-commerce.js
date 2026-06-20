// ── KIMBWETA BITES — Super Admin Commerce Analytics v1.0 ──────

const SuperAdminCommerce = {
  async init() {
    const user = Session.get();
    if (!user || user.role !== 'super_admin') {
      document.getElementById('commerceContent').innerHTML = '<p class="text3" style="text-align:center;padding:40px">Access denied. Super admin only.</p>';
      return;
    }
    this.renderOverview();
  },

  async _fetch(path) {
    try {
      const res = await API.fetch(path);
      return await res.json();
    } catch { return null; }
  },

  // ── Overview ──────────────────────────────────────────────────
  async renderOverview() {
    this._showPage('<div class="loading-state">Loading overview...</div>');
    const data = await this._fetch(EP.SA_COMMERCE_OVERVIEW);
    if (!data) { this._showPage('<div class="empty-state"><p class="text2">Failed to load analytics.</p></div>'); return; }
    const d = data.data || {};

    const html = `
      <div class="acct-page">
        <div class="h3" style="margin-bottom:20px">Commerce Overview</div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value">${(d.totalRevenue || 0).toLocaleString()}</div><div class="stat-label">Total Revenue (TZS)</div></div>
          <div class="stat-card"><div class="stat-value">${(d.totalOrders || 0).toLocaleString()}</div><div class="stat-label">Total Orders</div></div>
          <div class="stat-card"><div class="stat-value">${(d.totalProducts || 0).toLocaleString()}</div><div class="stat-label">Products</div></div>
          <div class="stat-card"><div class="stat-value">${(d.totalUsers || 0).toLocaleString()}</div><div class="stat-label">Users</div></div>
          <div class="stat-card"><div class="stat-value">${(d.totalCampuses || 0).toLocaleString()}</div><div class="stat-label">Active Campuses</div></div>
          <div class="stat-card"><div class="stat-value">${(d.ordersToday || 0).toLocaleString()}</div><div class="stat-label">Orders Today</div></div>
          <div class="stat-card"><div class="stat-value">TZS ${(d.revenueToday || 0).toLocaleString()}</div><div class="stat-label">Revenue Today</div></div>
          <div class="stat-card"><div class="stat-value">${(d.pendingProducts || 0).toLocaleString()}</div><div class="stat-label">Pending Products</div></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="SuperAdminCommerce.renderRevenue()">Revenue Trend</button>
          <button class="btn btn-ghost btn-sm" onclick="SuperAdminCommerce.renderOrderAnalytics()">Order Analytics</button>
          <button class="btn btn-ghost btn-sm" onclick="SuperAdminCommerce.renderTopProducts()">Top Products</button>
          <button class="btn btn-ghost btn-sm" onclick="SuperAdminCommerce.renderCampusPerformance()">Campus Performance</button>
        </div>
      </div>`;
    this._showPage(html);
  },

  // ── Revenue ───────────────────────────────────────────────────
  async renderRevenue() {
    this._showPage('<div class="loading-state">Loading revenue data...</div>');
    const data = await this._fetch(EP.SA_COMMERCE_REVENUE + '?days=30');
    if (!data) { this._showPage('<div class="empty-state"><p class="text2">Failed to load.</p></div>'); return; }
    const revenue = data.data || [];

    const total = revenue.reduce((s, r) => s + (r.revenue || 0), 0);
    const maxVal = Math.max(...revenue.map(r => r.revenue || 0), 1);
    const html = `
      <div class="acct-page">
        <div class="page-back" onclick="SuperAdminCommerce.renderOverview()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Overview</div>
        <div class="h3" style="margin-bottom:4px">Revenue (30 Days)</div>
        <div class="h2" style="margin-bottom:20px">TZS ${total.toLocaleString()}</div>
        <div class="bar-chart">${revenue.map(r => `
          <div class="bar-col">
            <div class="bar-fill" style="height:${((r.revenue || 0) / maxVal) * 100}%"></div>
            <div class="bar-label">${r.date ? r.date.slice(5) : ''}</div>
          </div>
        `).join('')}</div>
      </div>`;
    this._showPage(html);
  },

  // ── Order Analytics ───────────────────────────────────────────
  async renderOrderAnalytics() {
    this._showPage('<div class="loading-state">Loading order analytics...</div>');
    const data = await this._fetch(EP.SA_COMMERCE_ORDERS + '?days=30');
    if (!data) { this._showPage('<div class="empty-state"><p class="text2">Failed to load.</p></div>'); return; }
    const d = data.data || {};

    const statuses = d.byStatus || {};
    const paymentStatuses = d.byPaymentStatus || {};
    const statusLabels = { PENDING: 'Pending', ACCEPTED: 'Accepted', PREPARING: 'Preparing', ON_THE_WAY: 'On The Way', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
    const paymentLabels = { PENDING: 'Pending', PAID: 'Paid', FAILED: 'Failed', REFUNDED: 'Refunded' };

    const html = `
      <div class="acct-page">
        <div class="page-back" onclick="SuperAdminCommerce.renderOverview()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Overview</div>
        <div class="h3" style="margin-bottom:16px">Order Analytics (30 Days)</div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value">${d.total || 0}</div><div class="stat-label">Total Orders</div></div>
          <div class="stat-card"><div class="stat-value">${d.cancellationRate || 0}%</div><div class="stat-label">Cancellation Rate</div></div>
        </div>
        <div class="h4" style="margin:16px 0 8px">By Status</div>
        <div class="simple-list">${Object.entries(statuses).map(([k, v]) => `<div class="simple-row"><span>${statusLabels[k] || k}</span><span class="fw-600">${v}</span></div>`).join('')}</div>
        <div class="h4" style="margin:16px 0 8px">By Payment</div>
        <div class="simple-list">${Object.entries(paymentStatuses).map(([k, v]) => `<div class="simple-row"><span>${paymentLabels[k] || k}</span><span class="fw-600">${v}</span></div>`).join('')}</div>
      </div>`;
    this._showPage(html);
  },

  // ── Top Products ──────────────────────────────────────────────
  async renderTopProducts() {
    this._showPage('<div class="loading-state">Loading top products...</div>');
    const data = await this._fetch(EP.SA_COMMERCE_TOP + '?limit=20');
    if (!data) { this._showPage('<div class="empty-state"><p class="text2">Failed to load.</p></div>'); return; }
    const products = data.data || [];

    const html = `
      <div class="acct-page">
        <div class="page-back" onclick="SuperAdminCommerce.renderOverview()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Overview</div>
        <div class="h3" style="margin-bottom:16px">Top Products</div>
        <div class="simple-list">${products.map((p, i) => `
          <div class="simple-row">
            <span style="display:flex;align-items:center;gap:8px"><span class="rank-badge">${p.rank}</span> <span>${esc(p.name)}</span> <span class="text2" style="font-size:11px">${esc(p.campus || '')}</span></span>
            <span class="fw-600">${p.totalOrders} orders</span>
          </div>
        `).join('')}</div>
      </div>`;
    this._showPage(html);
  },

  // ── Campus Performance ────────────────────────────────────────
  async renderCampusPerformance() {
    this._showPage('<div class="loading-state">Loading campus data...</div>');
    const data = await this._fetch(EP.SA_COMMERCE_CAMPUS);
    if (!data) { this._showPage('<div class="empty-state"><p class="text2">Failed to load.</p></div>'); return; }
    const campuses = data.data || [];

    const html = `
      <div class="acct-page">
        <div class="page-back" onclick="SuperAdminCommerce.renderOverview()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Back to Overview</div>
        <div class="h3" style="margin-bottom:16px">Campus Performance</div>
        ${campuses.map(c => `
          <div class="campus-card">
            <div class="campus-card-header">
              <span class="fw-600">${esc(c.name)}</span>
              <span class="text2" style="font-size:12px">${esc(c.city || '')} • ${esc(c.region || '')}</span>
            </div>
            <div class="campus-card-stats">
              <div class="campus-stat"><span class="campus-stat-val">${c.totalOrders || 0}</span><span class="campus-stat-lbl">Orders</span></div>
              <div class="campus-stat"><span class="campus-stat-val">${c.totalProducts || 0}</span><span class="campus-stat-lbl">Products</span></div>
              <div class="campus-stat"><span class="campus-stat-val">${c.totalUsers || 0}</span><span class="campus-stat-lbl">Users</span></div>
              <div class="campus-stat"><span class="campus-stat-val">TZS ${(c.totalRevenue || 0).toLocaleString()}</span><span class="campus-stat-lbl">Revenue</span></div>
            </div>
          </div>
        `).join('')}
      </div>`;
    this._showPage(html);
  },

  _showPage(html) {
    document.getElementById('commerceContent').innerHTML = html;
  },
};
