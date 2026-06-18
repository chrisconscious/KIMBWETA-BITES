// ── KIMBWETA BITES — Navbar Component ──────────────────────────
// Renders user nav state (logged-in avatar vs Sign in button)
// Called by: auth.js → renderUserNav(), boot sequence

// renderUserNav() is defined in auth.js and called on boot.
// This file holds navbar-specific utilities.

/**
 * Update the cart count badges in all navbars.
 * Called by Cart.updateUI()
 */
function updateNavCartBadges(count) {
  ['navCartCount', 'navCartCount2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

/**
 * Highlight the active nav item in admin/super-admin sidebars.
 * @param {string} viewId - 'admin' or 'superadmin'
 * @param {Element} activeItem - The clicked nav-item element
 */
function setActiveNavItem(viewId, activeItem) {
  document.querySelectorAll(`#view-${viewId} .nav-item`)
    .forEach(i => i.classList.remove('active'));
  if (activeItem) activeItem.classList.add('active');
}
