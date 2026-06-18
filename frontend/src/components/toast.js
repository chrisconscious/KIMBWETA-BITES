// ── KIMBWETA BITES — Toast Notifications ───────────────────────

const Toast = {
  _icons: {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)"   stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  },

  show(type, message, duration = 3000) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;

    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `${Toast._icons[type] || Toast._icons.info} <span>${message}</span>`;
    wrap.appendChild(t);

    setTimeout(() => {
      t.style.opacity   = '0';
      t.style.transform = 'translateX(20px)';
      t.style.transition= 'all .3s ease';
      setTimeout(() => t.remove(), 320);
    }, duration);
  },
};

// Legacy alias
function showToast(type, message) { Toast.show(type, message); }
