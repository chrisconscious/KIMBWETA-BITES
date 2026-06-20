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
