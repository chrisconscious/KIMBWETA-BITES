let currentSlide = 0;
let slideTimer = null;

const AdsSlider = {
  async init(campusId) {
    try {
      const data = await API.getAds(campusId);
      if (!data?.data?.length) { AdsSlider._hideAll(); return; }
      const ads = data.data;
      AdsSlider._renderHero(ads.filter(a => a.destination === 'HOMEPAGE'));
      AdsSlider._renderBanner(ads.filter(a => a.destination === 'BANNER_SECTION'));
      AdsSlider._renderFloating(ads.filter(a => a.destination === 'FLOATING_CARD'));
      window.__smartAds = ads.filter(a => a.destination === 'PRODUCT_SECTION');
    } catch {
      AdsSlider._hideAll();
    }
  },

  _hideAll() {
    const el = document.getElementById('adsSlider');
    if (el && !el.querySelector('.slide')) el.style.display = 'none';
  },

  _renderHero(ads) {
    const wrap = document.getElementById('slidesWrap');
    const dots = document.getElementById('sliderDots');
    const slider = document.getElementById('adsSlider');
    if (!ads.length || !wrap) {
      if (slider && !ads.length) slider.style.display = 'none';
      return;
    }
    slider.style.display = 'block';
    const colors = ['linear-gradient(135deg,#FFFFFF,#FCE8E4)','linear-gradient(135deg,#FDE8E6,#FCE8E4)','linear-gradient(135deg,#FFFFFF,#FDE8E6)'];
    wrap.innerHTML = ads.map((ad, i) => `
      <div class="slide">
        <div class="slide-bg" style="background:${ad.imageUrl ? `url(${ad.imageUrl}) center/cover` : colors[i % colors.length]}"></div>
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <div class="slide-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 6-4 8-4 14a4 4 0 0 0 8 0c0-6-4-8-4-14z"/></svg>
            ${ad.description ? ad.description.slice(0,60) : 'Special Offer'}
          </div>
          <h2 class="slide-title h1" style="color:#fff">${ad.title}</h2>
          ${ad.description ? `<p class="slide-sub">${ad.description.slice(0,120)}</p>` : ''}
          <button class="btn btn-primary btn-lg" onclick="AdsSlider._handleClick('${ad.id}','${ad.targetUrl||''}')">
            ${ad.ctaType ? ad.ctaType.replace(/_/g,' ') : 'Order Now'}
          </button>
        </div>
      </div>`).join('');
    if (dots) dots.innerHTML = ads.map((_,i) => `<div class="slider-dot${i===0?' active':''}" onclick="goSlide(${i})"></div>`).join('');
    AdsSlider.startTimer();
  },

  _renderBanner(ads) {
    const wrap = document.getElementById('adBannerSection');
    if (!ads.length || !wrap) { if (wrap) wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    wrap.innerHTML = ads.map(ad => `
      <div class="ad-banner" style="background:${ad.imageUrl ? `url(${ad.imageUrl}) center/cover` : 'linear-gradient(135deg,var(--brand-dark),var(--brand))'}" onclick="AdsSlider._handleClick('${ad.id}','${ad.targetUrl||''}')">
        <div class="ad-banner-overlay"></div>
        <div class="ad-banner-content">
          <div class="ad-banner-tag">${ad.ctaType ? ad.ctaType.replace(/_/g,' ') : 'Promotion'}</div>
          <div class="ad-banner-title">${ad.title}</div>
          ${ad.description ? `<div class="ad-banner-desc">${ad.description.slice(0,100)}</div>` : ''}
        </div>
      </div>
    `).join('');
  },

  _renderFloating(ads) {
    const wrap = document.getElementById('adFloatingCard');
    if (!ads.length || !wrap) { if (wrap) wrap.style.display = 'none'; return; }
    const ad = ads[0];
    wrap.style.display = 'block';
    wrap.innerHTML = `
      <div class="floating-ad-card">
        <button class="floating-ad-close" onclick="this.parentElement.parentElement.style.display='none'; Storage.setStr('kb_ad_dismissed','1')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        ${ad.imageUrl ? `<div class="floating-ad-img" style="background-image:url(${ad.imageUrl})"></div>` : ''}
        <div class="floating-ad-body">
          <div class="floating-ad-title">${ad.title}</div>
          ${ad.description ? `<div class="floating-ad-desc">${ad.description.slice(0,80)}</div>` : ''}
          <button class="btn btn-primary btn-sm" onclick="AdsSlider._handleClick('${ad.id}','${ad.targetUrl||''}')">
            ${ad.ctaType ? ad.ctaType.replace(/_/g,' ') : 'Learn More'}
          </button>
        </div>
      </div>`;
    API.trackAdEvent(ad.id, 'VIEW');
    setTimeout(() => wrap.classList.add('visible'), 2000);
  },

  _handleClick(adId, targetUrl) {
    API.trackAdEvent(adId, 'CLICK');
    if (targetUrl) window.open(targetUrl, '_blank');
  },

  startTimer() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(() => nextSlide(), KB.AD_SLIDE_INTERVAL_MS);
  },
};

function prevSlide() {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
}

function nextSlide() {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
}

function goSlide(n) {
  currentSlide = n;
  updateSlider();
  if (slideTimer) { clearInterval(slideTimer); slideTimer = setInterval(nextSlide, KB.AD_SLIDE_INTERVAL_MS); }
}

function updateSlider() {
  const wrap = document.getElementById('slidesWrap');
  if (!wrap) return;
  wrap.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((d,i) => d.classList.toggle('active', i === currentSlide));
}
