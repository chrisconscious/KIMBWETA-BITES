// ── KIMBWETA BITES — Floating Follow Button ─────────────────────

const FAB = {
  open:        false,
  tooltipShown:false,
  links:       {},

  async init() {
    try {
      const data = await API.getSocialLinks();
      if (data && data.data) Object.assign(FAB.links, data.data);
    } catch (e) {
      FAB.links.whatsapp  = FAB.links.whatsapp  || 'https://wa.me/255757744555';
      FAB.links.instagram = FAB.links.instagram || 'https://instagram.com/kimbwetabites';
      FAB.links.call      = FAB.links.call      || 'tel:+255757744555';
    }

    // One-time tooltip: auto-show after 2s, hide after 4s
    if (!Storage.get('kb_fab_shown')) {
      setTimeout(() => {
        const tip = document.getElementById('fabTooltip');
        if (tip) {
          tip.style.opacity = '1';
          setTimeout(() => {
            tip.style.opacity = '0';
            Storage.set('kb_fab_shown', true);
            document.getElementById('fabWrap')?.classList.add('shown-once');
          }, 4000);
        }
      }, 2000);
    } else {
      document.getElementById('fabWrap')?.classList.add('shown-once');
    }

    // Close on scroll
    window.addEventListener('scroll', () => { if (FAB.open) FAB.toggle(); }, { passive: true });
  },

  toggle() {
    FAB.open = !FAB.open;
    const btn  = document.getElementById('fabMain');
    const menu = document.getElementById('fabMenu');
    const wrap = document.getElementById('fabWrap');
    btn?.classList.toggle('open',  FAB.open);
    menu?.classList.toggle('open', FAB.open);
    wrap?.classList.toggle('open', FAB.open);
  },

  close() { if (FAB.open) FAB.toggle(); },

  action(type) {
    const url = FAB.links[type];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    FAB.toggle();
  },
};

// Close when clicking outside FAB
document.addEventListener('click', (e) => {
  if (FAB.open && !e.target.closest('#fabWrap')) FAB.toggle();
});
