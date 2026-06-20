// ── KIMBWETA BITES — Product Card Component ────────────────────
// Product card HTML generation is handled in src/scripts/products.js
// via Products.renderCard(p).
//
// This file exposes card-level utilities used across the app.

/**
 * Animate a "added to cart" pulse on the add button.
 * @param {Element} btn - The add button element
 */
function animateAddBtn(btn) {
  if (!btn) return;
  btn.style.transform = 'scale(0.88)';
  setTimeout(() => { btn.style.transform = ''; }, 150);
}

/**
 * Render a mini product card for "You May Also Like" section.
 * Full implementation is in src/components/modal.js
 */
function renderAlsoLikeCard(product) {
  return `
    <div class="also-like-card" onclick="Modal.quickView('${product.id}')">
      <div class="also-like-img">
        ${getProductIcon(product)}
        <button class="also-like-add" onclick="event.stopPropagation();Cart.quickAdd('${product.id}')">
          ${Icons.plus}
        </button>
      </div>
      <div class="also-like-info">
        <div class="also-like-name">${product.name}</div>
        <div class="also-like-price">${fmtPrice(product.price)}</div>
      </div>
    </div>`;
}

/**
 * Render a skeleton placeholder card while products load.
 */
function renderSkeletonCard() {
  return `
    <div class="skel-card">
      <div class="skel-img"></div>
      <div style="padding:14px;display:flex;flex-direction:column;gap:8px">
        <div class="skel skel-h w80"></div>
        <div class="skel skel-h w60"></div>
        <div class="skel skel-h w40" style="height:28px;margin-top:4px"></div>
      </div>
    </div>`;
}
