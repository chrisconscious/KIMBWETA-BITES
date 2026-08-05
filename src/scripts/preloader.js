(function() {
  var $ = function(id) { return document.getElementById(id); };
  var a = function(el, cls) { if (el) el.classList.add(cls); };
  var q = function(s) { return document.querySelectorAll(s); };

  var pl = $('pl'), logoWrap = $('pl-logo-wrap'), glow = $('pl-glow');
  var plImg = $('pl-img');
  var elWelcome = $('pl-line-welcome'), elHero = $('pl-line-hero'), elClosing = $('pl-line-closing');

  var apiBase = window.KIMBWETA_API || 'https://kimbweta-bites.onrender.com/api/v1';
  var renderBase = apiBase.replace('/api/v1', '');
  var revealed = false;
  var preloaderSettings = {logo:'',line1:'WELCOME TO',line2:'KIMBWETA BITES',closing:'',closingEnabled:true,duration:3};
  var plLogoSrc = '';

  var setSrc = function(u) {
    if (plImg) {
      if (u) {
        if (u.indexOf('://') === -1) u = renderBase + (u.indexOf('/') === 0 ? '' : '/') + u;
        plImg.src = u;
        plImg.style.display = '';
      } else {
        plImg.removeAttribute('src');
        plImg.style.display = 'none';
      }
    }
  };

  var splitChars = function(el, text, opts) {
    opts = opts || {};
    var stagger = opts.stagger || 35;
    var accentStart = opts.accentStart || -1;
    var accentEnd = opts.accentEnd || -1;
    el.innerHTML = '';
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span');
      s.className = 'pl-char';
      s.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      s.style.transitionDelay = (i * stagger) + 'ms';
      if (i >= accentStart && i < accentEnd) s.classList.add('accent');
      el.appendChild(s);
    }
  };

  var splitWords = function(el, text, accentIdxs) {
    el.innerHTML = '';
    var words = text.split(' ');
    for (var i = 0; i < words.length; i++) {
      var s = document.createElement('span');
      s.className = 'pl-word';
      s.textContent = words[i];
      s.style.transitionDelay = (i * 100) + 'ms';
      if (accentIdxs && accentIdxs.indexOf(i) >= 0) s.classList.add('warm');
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    }
  };

  var reveal = function() {
    if (revealed) return; revealed = true;

    // Phase 1: Logo fades in and scales up
    setTimeout(function() { if (plImg) a(plImg, 'in'); }, 120);

    // Phase 2: White ambient glow pulse behind logo
    setTimeout(function() { if (glow) a(glow, 'active'); }, 550);

    // Phase 3: Premium pop emphasis (100% → 104% → 100%)
    setTimeout(function() { a(logoWrap, 'pop'); }, 950);

    // ─── Text Sequences ───
    setTimeout(function() {
      var cs = q('#pl-line-welcome .pl-char');
      for (var i = 0; i < cs.length; i++) a(cs[i], 'in');
    }, 1400);
    setTimeout(function() {
      var cs = q('#pl-line-hero .pl-char');
      for (var i = 0; i < cs.length; i++) a(cs[i], 'in');
    }, 1550);
    setTimeout(function() { a($('pl-line-community'), 'in'); }, 1700);
    setTimeout(function() {
      var ws = q('#pl-line-community .pl-word');
      for (var i = 0; i < ws.length; i++) a(ws[i], 'in');
    }, 1780);
    setTimeout(function() {
      var ps = q('.pl-pillar');
      var ss = q('.pl-pillar-sep');
      for (var i = 0; i < ps.length; i++) (function(idx) {
        setTimeout(function() {
          a(ps[idx], 'in');
          if (idx > 0 && ss[idx - 1]) a(ss[idx - 1], 'in');
        }, idx * 160);
      })(i);
    }, 1900);
    setTimeout(function() {
      if (preloaderSettings.closingEnabled && preloaderSettings.closing) {
        a($('pl-line-closing'), 'in');
      }
    }, 2100);

    // Phase 9: Wait for data with generous timeout
    var dur = Math.max(preloaderSettings.duration || 3, 2);
    var fadeDelay = 2800 + (dur - 3) * 400;
    setTimeout(function() {
      var cs = Date.now();
      var MAX_WAIT = 20000;
      (function ck() {
        if (window.__KB_READY__) {
          a(pl, 'out');
          setTimeout(function() { if (pl && pl.parentNode) pl.parentNode.removeChild(pl); }, 420);
        } else if (Date.now() - cs > MAX_WAIT) {
          a(pl, 'out');
          setTimeout(function() {
            if (pl && pl.parentNode) pl.parentNode.removeChild(pl);
            var ld = document.getElementById('pageLoader');
            if (ld) ld.style.display = 'flex';
          }, 420);
        } else { setTimeout(ck, 250); }
      })();
    }, fadeDelay);
  };

  var skipPreloader = function() {
    if (pl) { pl.style.display = 'none'; if (pl.parentNode) pl.parentNode.removeChild(pl); }
    window.__KB_READY__ = true;
  };

  var applySettings = function(d) {
    var data = d && d.data ? d.data : {};
    if (data.preloader_enabled === 'false') { skipPreloader(); return; }
    preloaderSettings = {
      logo: data.preloader_logo || data.site_logo || '',
      line1: data.preloader_welcome_line1 || 'WELCOME TO',
      line2: data.preloader_welcome_line2 || 'KIMBWETA BITES',
      closing: (data.preloader_tagline_enabled !== 'false' && data.preloader_tagline) ? data.preloader_tagline : '',
      closingEnabled: data.preloader_tagline_enabled !== 'false',
      duration: parseInt(data.preloader_duration) || 3,
    };
    splitChars(elWelcome, preloaderSettings.line1, { stagger: 30 });
    var accentS2 = preloaderSettings.line2.toUpperCase().indexOf('BITES');
    var accentE2 = accentS2 >= 0 ? accentS2 + 5 : -1;
    splitChars(elHero, preloaderSettings.line2, { stagger: 38, accentStart: accentS2, accentEnd: accentE2 });
    splitWords($('pl-line-community'), 'Connecting Friends Through Food.', [1]);
    if (preloaderSettings.closing) {
      ($('pl-line-closing')).style.display = 'block';
      ($('pl-line-closing')).textContent = preloaderSettings.closing;
    } else {
      ($('pl-line-closing')).style.display = 'none';
    }
  };

  var tryReveal = function() {
    if (revealed) return;
    reveal();
  };

  // Preview mode
  var qp = new URLSearchParams(window.location.search);
  if (qp.get('preview') === '1') {
    var pl1 = qp.get('l1') || 'WELCOME TO';
    var pl2 = qp.get('l2') || 'KIMBWETA BITES';
    var pt  = qp.get('t') || '';
    var pd  = parseInt(qp.get('d')) || 3;
    var plogo = qp.get('l') || '';
    var accentS = pl2.toUpperCase().indexOf('BITES');
    var accentE = accentS >= 0 ? accentS + 5 : -1;
    preloaderSettings = {
      logo: plogo, line1: pl1, line2: pl2,
      closing: pt, closingEnabled: !!pt,
      duration: pd,
    };
    splitChars(elWelcome, pl1, { stagger: 30 });
    splitChars(elHero, pl2, { stagger: 38, accentStart: accentS, accentEnd: accentE });
    splitWords($('pl-line-community'), 'Connecting Friends Through Food.', [1]);
    if (pt) { elClosing.style.display = 'block'; elClosing.textContent = pt; }
    else { elClosing.style.display = 'none'; }
    setSrc(plogo);
    tryReveal();
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiBase + '/settings/public', true);
    xhr.onload = function() {
      try {
        var d = JSON.parse(xhr.responseText);
        applySettings(d);
        var u = preloaderSettings.logo;
        setSrc(u);
      } catch(e) { setSrc(); }
      tryReveal();
    };
    xhr.onerror = function() { setSrc(); tryReveal(); };
    xhr.send();
    setTimeout(function() { if (!revealed) { setSrc(); tryReveal(); } }, 2000);
  }
})();

// Watch for __KB_READY__ to hide pageLoader
(function() {
  var ld = document.getElementById('pageLoader');
  if (!ld) return;
  var iv = setInterval(function() {
    if (window.__KB_READY__) {
      clearInterval(iv);
      ld.style.display = 'none';
    }
  }, 200);
})();
