// ── KIMBWETA BITES — Checkout v2.0 ─────────────────────────────

const Checkout = {
  async _loadCampuses() {
    try {
      const data = await API.getCampuses();
      return data?.data || [];
    } catch { return []; }
  },

  _nonEmpty(s) {
    return s && String(s).trim().length > 0;
  },

  async _resolveCampusId(user, items) {
    if (Checkout._nonEmpty(user?.campusId)) return user.campusId;
    for (const item of items) {
      if (Checkout._nonEmpty(item.campusId)) return item.campusId;
    }
    return null;
  },

  async open() {
    const items = CartStore.items();
    if (!items.length) { Toast.show('error', 'Your cart is empty'); return; }
    const total    = CartStore.total();
    const user     = Session.get();
    const campusId = await Checkout._resolveCampusId(user, items);

    // If campusId still missing, load campuses for a dropdown
    const needCampusSelector = !campusId;
    let campuses = [];
    let campusOptionsHtml = '';
    if (needCampusSelector) {
      campuses = await Checkout._loadCampuses();
      campusOptionsHtml = campuses.map(c =>
        `<option value="${c.id}">${escapeHtml(c.name)}</option>`
      ).join('');
    }

    // Fetch payment details from backend (dynamic per campus)
    let paymentDetails = [];
    if (campusId) {
      try {
        const data = await API.getPaymentDetails(campusId);
        paymentDetails = data?.data || [];
      } catch { /* use empty */ }
    }

    const mobilePayHtml = paymentDetails.length
      ? paymentDetails.map(p => `
          <div style="background:var(--bg3);border-radius:var(--r);padding:14px;margin-top:8px">
            <div class="label" style="margin-bottom:6px">Send payment to</div>
            <div style="font-size:15px;font-weight:700;color:var(--brand)">${p.provider}</div>
            <div style="font-size:15px;font-weight:700;font-family:monospace;margin:4px 0">${p.phoneNumber}</div>
            <div style="font-size:13px;color:var(--text2)">${p.accountName}</div>
            ${p.instructions ? `<div style="font-size:12px;color:var(--text3);margin-top:6px">${p.instructions}</div>` : ''}
          </div>`).join('')
      : `<div style="background:var(--bg3);border-radius:var(--r);padding:12px;margin-top:8px">
           <div style="font-size:13px;color:var(--text2)">Payment details will be provided after your order is confirmed.</div>
         </div>`;

    document.getElementById('checkoutContent').innerHTML = `
      <div class="modal-header">
        <div><span class="label">Final Step</span><div class="h3" style="margin-top:4px">Complete Your Order</div></div>
        <button class="modal-close" onclick="closeAll()">${Icons.x}</button>
      </div>
      <div class="modal-body">

        <div class="checkout-section">
          <div class="checkout-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Order Summary
          </div>
          ${items.map(i => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:32px;height:32px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center">${ProductIcons[i.icon] || ProductIcons.food}</div>
                <span>${i.name} × ${i.qty}</span>
              </div>
              <span style="font-weight:600">${fmtPrice(i.price * i.qty)}</span>
            </div>`).join('')}
          <div style="display:flex;justify-content:space-between;padding-top:12px;font-family:var(--ff-display);font-weight:700">
            <span>Total</span>
            <span class="grad-text" style="font-size:18px">${fmtPrice(total)}</span>
          </div>
        </div>

        ${user ? `
          <div class="checkout-section">
            <div class="checkout-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Delivery Contact
            </div>
            <div style="background:var(--bg3);border-radius:var(--r);padding:12px 14px">
              <div style="font-weight:600">${user.name}</div>
              <div style="font-size:13px;color:var(--text2);margin-top:2px">${user.phoneNumber}</div>
            </div>
          </div>` : ''}

        ${needCampusSelector ? `
        <div class="checkout-section">
          <div class="checkout-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            Select Campus
          </div>
          <select class="input select" id="checkoutCampus">
            <option value="">Choose your campus</option>
            ${campusOptionsHtml}
          </select>
        </div>` : ''}

        <div class="checkout-section">
          <div class="checkout-section-title">
            ${Icons.mapPin} Delivery Location
          </div>
          <button class="btn btn-ghost" style="width:100%;margin-bottom:10px;gap:8px" onclick="Checkout.getGPS()">
            ${Icons.mapPin} Use GPS Location
          </button>
          <input class="input" placeholder="Block C, Room 14, near library..." id="locationText">
        </div>

        <div class="checkout-section">
          <div class="checkout-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
            Payment Method
          </div>
          <div class="payment-option selected" onclick="Checkout.selectPayment(this,'cash')" id="payOptCash">
            <div class="payment-radio"><div class="payment-radio-inner"></div></div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
            <div><div style="font-weight:600;font-size:14px">Cash on Delivery</div><div style="font-size:12px;color:var(--text2)">Pay when order arrives</div></div>
          </div>
          <div class="payment-option" onclick="Checkout.selectPayment(this,'mobile')" id="payOptMobile">
            <div class="payment-radio"><div class="payment-radio-inner"></div></div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>
            <div><div style="font-weight:600;font-size:14px">Mobile Money</div><div style="font-size:12px;color:var(--text2)">M-Pesa, Tigo, Airtel</div></div>
          </div>
          <div id="mobilePayDetails" style="display:none">${mobilePayHtml}</div>
        </div>

        <button class="btn btn-primary btn-lg" style="width:100%" onclick="Checkout.placeOrder()">
          ${Icons.check} Place Order — ${fmtPrice(total)}
        </button>
      </div>`;

    document.getElementById('checkoutModal').classList.add('open');
    document.getElementById('overlay').classList.add('open');
    document.body.classList.add('no-scroll');
  },

  selectPayment(el, method) {
    document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    const md = document.getElementById('mobilePayDetails');
    if (md) md.style.display = method === 'mobile' ? 'block' : 'none';
  },

  getGPS() {
    if (!navigator.geolocation) { Toast.show('error', 'GPS not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const el = document.getElementById('locationText');
        if (el) el.value = `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        Toast.show('success', 'Location captured!');
      },
      () => Toast.show('error', 'Could not get location')
    );
  },

  async placeOrder() {
    const user         = Session.get();
    const items        = CartStore.items();
    const locationText = document.getElementById('locationText')?.value?.trim();
    if (!locationText) { Toast.show('error', 'Please enter a delivery location'); return; }
    const campusDropdown = document.getElementById('checkoutCampus');
    const campusId = campusDropdown
      ? campusDropdown.value
      : await Checkout._resolveCampusId(user, items);
    if (!Checkout._nonEmpty(campusId)) {
      Toast.show('error', 'Please select your campus to continue');
      return;
    }
    const paymentMethod = document.getElementById('payOptMobile')?.classList.contains('selected') ? 'MOBILE' : 'CASH';

    const payload = {
      campusId,
      paymentMethod,
      locationText,
      items: items.map(i => ({ productId: i.id, quantity: i.qty })),
    };

    try {
      const r = await API.createOrder(payload);
      if (r.ok) {
        closeAll();
        CartStore.clear();
        Cart.updateUI();
        Toast.show('success', 'Order placed successfully!');
        API.invalidate('/orders');
        setTimeout(() => Router.navigate('/orders'), 1000);
        return;
      }
      const data = await r.json();
      const detail = data.errors
        ? Object.values(data.errors).flat().join(', ')
        : '';
      Toast.show('error', detail || data.message || 'Failed to place order');
    } catch {
      Toast.show('error', 'Connection error. Please try again.');
    }
  },
};
