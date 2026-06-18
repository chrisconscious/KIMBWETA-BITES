// ── KIMBWETA BITES — Cart ───────────────────────────────────────

const CartStore = {
  data: Storage.get('kb_cart', {}),
  save() { Storage.set('kb_cart', this.data); },
  add(p) {
    if (!this.data[p.id]) this.data[p.id] = { ...p, qty: 0 };
    this.data[p.id].qty++;
    this.save();
  },
  remove(id)      { delete this.data[id]; this.save(); },
  update(id, d)   { if (!this.data[id]) return; this.data[id].qty += d; if (this.data[id].qty <= 0) this.remove(id); else this.save(); },
  items()         { return Object.values(this.data); },
  count()         { return this.items().reduce((s,i) => s + i.qty, 0); },
  total()         { return this.items().reduce((s,i) => s + i.price * i.qty, 0); },
  clear()         { this.data = {}; this.save(); },
};

const Cart = {
  add(product) {
    CartStore.add(product);
    Cart.updateUI();
    Toast.show('success', `${product.name} added!`);
    Products.renderAll();
  },
  updateQty(id, delta) {
    CartStore.update(id, delta);
    Cart.updateUI();
    Products.renderAll();
  },
  quickAdd(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p || p.stock === 0) return;
    Cart.add({ id:p.id, name:p.name, price:p.price, icon:p.icon||'food', campusId:p.campusId||'' });
  },

  updateUI() {
    const count = CartStore.count();
    const total = CartStore.total();

    // Nav badges
    ['navCartCount','navCartCount2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
    });

    // Float cart
    const fc = document.getElementById('floatCart');
    if (fc) {
      fc.classList.toggle('visible', count > 0);
      const ft = document.getElementById('floatCartText');
      const fp = document.getElementById('floatCartPrice');
      if (ft) ft.textContent = `View Cart · ${count} item${count>1?'s':''}`;
      if (fp) fp.textContent = fmtPrice(total);
    }

    // Sticky cart
    const sc = document.getElementById('stickyCart');
    if (sc) {
      sc.classList.toggle('visible', count > 0);
      const scc = document.getElementById('stickyCartCount');
      const sct = document.getElementById('stickyCartTotal');
      if (scc) scc.textContent = `${count} item${count!==1?'s':''}`;
      if (sct) sct.textContent = fmtPrice(total);
    }

    const ci = document.getElementById('cartItemCount');
    if (ci) ci.textContent = `${count} item${count!==1?'s':''}`;

    Cart.renderDrawer();
  },

  renderDrawer() {
    const body   = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');
    if (!body) return;
    const items = CartStore.items();

    if (!items.length) {
      body.innerHTML = `<div class="cart-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <div class="h3">Your cart is empty</div>
        <div style="font-size:14px;color:var(--text2)">Add some delicious items to get started</div>
        <button class="btn btn-primary" onclick="closeAll()">Browse Menu</button>
      </div>`;
      if (footer) footer.innerHTML = '';
      return;
    }

    body.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${ProductIcons[item.icon] || ProductIcons.food}</div>
        <div style="flex:1;min-width:0">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${fmtPrice(item.price * item.qty)}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="Cart.updateQty('${item.id}',-1)">${Icons.minus}</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty('${item.id}',1)">${Icons.plus}</button>
        </div>
      </div>`).join('');

    if (footer) footer.innerHTML = `
      <div class="cart-total-row">
        <span style="font-size:15px;color:var(--text2)">Subtotal</span>
        <span class="grad-text" style="font-family:var(--ff-display);font-weight:800;font-size:22px">${fmtPrice(CartStore.total())}</span>
      </div>
      <p style="font-size:12px;color:var(--text3);margin-bottom:12px;text-align:center">Delivery fee added at checkout</p>
      <button class="btn btn-primary btn-lg" style="width:100%" onclick="startCheckout()">
        ${Icons.cart} Proceed to Checkout
      </button>`;
  },
};

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.body.classList.add('no-scroll');
  Cart.updateUI();
}

function closeAll() {
  ['cartDrawer','overlay','quickViewModal','authModal','checkoutModal'].forEach(id =>
    document.getElementById(id)?.classList.remove('open')
  );
  document.body.classList.remove('no-scroll');
}
