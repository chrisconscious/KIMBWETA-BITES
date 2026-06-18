// ── KIMBWETA BITES — Helper Utilities ──────────────────────────

/** Format TZS price */
const fmtPrice = (n) => `TZS ${Number(n).toLocaleString()}`;

/** Debounce function */
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

/** Highlight matching text */
function highlightMatch(text, query) {
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark class="search-highlight">$1</mark>');
}

/** Get product icon type from category name */
function catToIcon(catName = '') {
  const c = catName.toLowerCase();
  if (c.includes('drink') || c.includes('juice') || c.includes('soda')) return 'drink';
  if (c.includes('meal') || c.includes('rice') || c.includes('food')) return 'meal';
  if (c.includes('sweet') || c.includes('cake') || c.includes('dessert')) return 'sweet';
  return 'food';
}

/** Map backend product to local format */
function mapProduct(p) {
  return {
    id:          p.id,
    name:        p.name,
    price:       p.price,
    icon:        catToIcon(p.category?.name || ''),
    campusId:    p.campusId || '',
    cat:         (p.category?.name || 'other').toLowerCase(),
    stock:       p.inventory?.quantity ?? 99,
    popular:     p.isFeatured || false,
    imageUrl:    p.imageUrl || null,
    description: p.description || '',
  };
}

/** Escape HTML special chars (XSS safety) */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/** Stagger animate children */
function animateChildren(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.add('stagger-in');
  setTimeout(() => el.classList.remove('stagger-in'), 1000);
}
