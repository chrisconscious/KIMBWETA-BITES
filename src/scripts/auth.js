var currentUser = null;

var Session = {
  set: function(user, at, rt) {
    var normalizedUser = { ...user, role: String(user ? user.role || '' : '').toLowerCase() };
    Storage.setStr('kb_token', at);
    Storage.setStr('kb_refresh', rt);
    Storage.set('kb_user', normalizedUser);
    currentUser = normalizedUser;
    renderUserNav();
    if (normalizedUser && normalizedUser.campusId && typeof Products !== 'undefined') Products.fetch(normalizedUser.campusId);
    if (typeof Categories !== 'undefined') Categories.fetch();
  },
  get: function()        { return Storage.get('kb_user'); },
  getToken: function()   { return Storage.getStr('kb_token'); },
  getRefresh: function() { return Storage.getStr('kb_refresh'); },
  clear: function() {
    ['kb_token','kb_refresh','kb_user','kb_user_updated'].forEach(function(k) { Storage.remove(k); });
    currentUser = null;
    renderUserNav();
  },
  isLoggedIn: function() { return !!this.getToken() && !!this.get(); },
};

async function restoreSession() {
  var token  = Session.getToken();
  var cached = Session.get();
  if (!token || !cached) {
    renderUserNav();
    return;
  }
  // Both tokens expired → clear silently, no console 401
  if (typeof _isJWTExpired === 'function' && _isJWTExpired(token)) {
    var rt = Session.getRefresh();
    if (!rt || _isJWTExpired(rt)) {
      Session.clear();
      renderUserNav();
      return;
    }
  }
  currentUser = { ...cached, role: String(cached ? cached.role || '' : '').toLowerCase() };
  var lastUpdated = Storage.get('kb_user_updated');
  var needsRefresh = !lastUpdated || (Date.now() - lastUpdated) > (5 * 60 * 1000);

  if (needsRefresh) {
    try {
      var data = await API.getMe();
      if (data && data.data) {
        currentUser = { ...data.data, role: String(data.data.role || '').toLowerCase() };
        Storage.set('kb_user', currentUser);
        Storage.set('kb_user_updated', Date.now());
      }
    } catch (error) {
      console.warn('restoreSession: getMe failed, using cached data', error);
    }
  }

  renderUserNav();
}

function renderUserNav() {
  var containers = ['userNavBtn', 'userNavBtn2', 'userNavBtnDiscovery'];
  for (var c = 0; c < containers.length; c++) {
    var el = document.getElementById(containers[c]);
    if (!el) continue;

    if (currentUser) {
      var role = String(currentUser.role || '').toLowerCase();
      var isAdmin = role === 'admin' || role === 'super_admin';
      var initial = (currentUser.name || 'U').charAt(0).toUpperCase();
      var roleLabel = role.replace('_', ' ');
      var dashHref = role === 'super_admin' ? 'super-admin.html' : (role === 'admin' ? 'admin.html' : '#');
      var dashAction = isAdmin ? 'goAdmin()' : '';
      var dashHtml = isAdmin
        ? '<div class="dropdown-divider"></div><button class="dropdown-item" onclick="goAdmin()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>Dashboard</button>'
        : '';

      el.innerHTML =
        '<div class="user-dropdown" onclick="event.stopPropagation()">' +
          '<button class="user-btn" onclick="this.closest(\'.user-dropdown\').classList.toggle(\'open\')">' +
            '<div class="user-avatar">' + initial + '</div>' +
            '<span class="user-name">' + escapeHtml(currentUser.name || 'User') + '</span>' +
            '<svg class="user-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="dropdown-menu">' +
            '<div class="dropdown-header">' +
              '<div class="dropdown-user-name">' + escapeHtml(currentUser.name || 'User') + '</div>' +
              '<div class="dropdown-user-role">' + roleLabel + '</div>' +
            '</div>' +
            dashHtml +
            '<div class="dropdown-divider"></div>' +
            '<button class="dropdown-item" onclick="Router.navigate(\'/account\')">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
              'Account Center' +
            '</button>' +
            '<div class="dropdown-divider"></div>' +
            '<button class="dropdown-item danger" onclick="Auth.logout()">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>' +
              'Sign Out' +
            '</button>' +
          '</div>' +
        '</div>';
    } else {
      el.innerHTML =
        '<button class="btn btn-primary btn-sm" onclick="Auth.showLogin()" type="button">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>' +
          'Sign In' +
        '</button>';
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function goAdmin() {
  if (!currentUser) return;
  var role = String(currentUser.role || '').toLowerCase();
  if (role === 'super_admin') {
    window.location.href = 'super-admin.html';
  } else if (role === 'admin') {
    window.location.href = 'admin.html';
  }
}

var pendingPhone = '';

function startCheckout() {
  if (Session.isLoggedIn()) { closeAll(); setTimeout(function() { Checkout.open(); }, 100); return; }
  closeAll();
  Auth.showLogin();
}

function openAuthModal() {
  document.getElementById('authModal').classList.add('active');
  document.getElementById('overlay').classList.add('open');
  document.body.classList.add('no-scroll');
}

var Auth = {
  _campuses: null,

  _loadCampuses: async function() {
    if (Auth._campuses) return Auth._campuses;
    try {
      var data = await API.getCampuses();
      Auth._campuses = data && data.data || [];
    } catch (e) {
      Auth._campuses = [];
    }
    return Auth._campuses;
  },

  showLogin: function() {
    try {
      var authModal = document.getElementById('authModal');
      var authContent = document.getElementById('authContent');
      if (!authModal || !authContent) { alert('Sign In modal not available'); return; }

      authContent.innerHTML =
        '<form onsubmit="Auth.doLogin(); return false;">' +
          '<div class="modal-header">' +
            '<div>' +
              '<div class="h3">Sign In</div>' +
              '<div style="font-size:13px;color:var(--text2);margin-top:4px">Mobile number + password</div>' +
            '</div>' +
            '<button class="modal-close" type="button" onclick="closeAll()">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="modal-body" style="display:flex;flex-direction:column;gap:16px">' +
            '<div class="field"><label>Mobile Number</label>' +
              '<div class="input-wrap">' +
                '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.88 4.18 2 2 0 0 1 4.87 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 9.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
                '<input class="input" placeholder="0757744555" type="tel" id="loginPhone">' +
              '</div>' +
            '</div>' +
            '<div class="field"><label>Password</label>' +
              '<div class="input-wrap">' +
                '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
                '<input class="input" placeholder="Enter password" type="password" id="loginPassword">' +
              '</div>' +
            '</div>' +
            '<div id="loginError" style="color:var(--red);font-size:13px;display:none;padding:10px;background:rgba(220,38,38,.08);border-radius:8px;border:1px solid rgba(220,38,38,.15)"></div>' +
            '<button class="btn btn-primary btn-lg" style="width:100%" id="loginBtn" type="submit">Sign In</button>' +
            '<div style="text-align:center;font-size:13px;color:var(--text3)">' +
              'No account?' +
              ' <span style="color:var(--brand);cursor:pointer;font-weight:600" onclick="Auth.showRegister()">Create one</span>' +
            '</div>' +
            '<div style="text-align:center;font-size:13px;color:var(--text3)">' +
              '<span style="color:var(--brand);cursor:pointer" onclick="Auth.showOtpLogin()">Sign in with OTP instead</span>' +
            '</div>' +
          '</div>' +
        '</form>';

      openAuthModal();
      setTimeout(function() { var el = document.getElementById('loginPhone'); if (el) el.focus(); }, 100);
    } catch (error) {
      console.error('Auth.showLogin error:', error);
      alert('Error showing login form: ' + error.message);
    }
  },

  doLogin: async function() {
    var phone = document.getElementById('loginPhone');
    var password = document.getElementById('loginPassword');
    var errEl = document.getElementById('loginError');
    var btn = document.getElementById('loginBtn');
    phone = phone ? phone.value.trim().replace(/[\s-]/g, '') : '';
    password = password ? password.value : '';

    if (!phone || !password) {
      if (errEl) { errEl.textContent = 'Enter your mobile number and password.'; errEl.style.display = 'block'; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
    if (errEl) errEl.style.display = 'none';

    try {
      console.log('[Auth] Login request:', { phone });
      var r = await API.loginWithPassword(phone, password);
      var data = await r.json();
      console.log('[Auth] Login response:', r.status, data);

      if (!r.ok) {
        if (errEl) { errEl.textContent = data && data.message || 'Invalid phone number or password.'; errEl.style.display = 'block'; }
        return;
      }

      var payload = (data && data.data && data.data.data) || (data && data.data) || {};
      var token = payload.accessToken || payload.token;
      var refreshToken = payload.refreshToken || null;
      var user = payload.user || payload;
      var normalizedRole = String(user ? user.role || '' : '').toLowerCase();

      if (!token || !user) {
        if (errEl) { errEl.textContent = 'Invalid response from server.'; errEl.style.display = 'block'; }
        return;
      }

      Session.set({ ...user, role: normalizedRole }, token, refreshToken);
      closeAll();
      Toast.show('success', 'Welcome back, ' + (user.name || 'user') + '!');

      var lowerRole = normalizedRole;
      if (lowerRole === 'super_admin') {
        setTimeout(function() { window.location.href = 'super-admin.html'; }, 500);
      } else if (lowerRole === 'admin') {
        setTimeout(function() { window.location.href = 'admin.html'; }, 500);
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      if (errEl) { errEl.textContent = 'Server temporarily unavailable. Please try again.'; errEl.style.display = 'block'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    }
  },

  showOtpLogin: function() {
    var modal = document.getElementById('authContent');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-header">' +
        '<div>' +
          '<div class="h3">Sign In with OTP</div>' +
          '<div style="font-size:13px;color:var(--text2);margin-top:4px">A 6-digit code will be sent to your phone</div>' +
        '</div>' +
        '<button class="modal-close" onclick="closeAll()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal-body" style="display:flex;flex-direction:column;gap:16px">' +
        '<div class="field"><label>Mobile Number</label>' +
          '<div class="input-wrap">' +
            '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.88 4.18 2 2 0 0 1 4.87 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 9.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
            '<input class="input" placeholder="0757744555" type="tel" id="otpPhone">' +
          '</div>' +
        '</div>' +
        '<div id="otpSendError" style="color:var(--red);font-size:13px;display:none"></div>' +
        '<button class="btn btn-primary btn-lg" style="width:100%" id="sendOtpBtn" onclick="Auth.sendOtpForLogin()">Send OTP</button>' +
        '<div style="text-align:center;font-size:13px;color:var(--text3)">' +
          '<span style="color:var(--brand);cursor:pointer" onclick="Auth.showLogin()">Back to password login</span>' +
        '</div>' +
      '</div>';
    openAuthModal();
  },

  sendOtpForLogin: async function() {
    var phone = document.getElementById('otpPhone');
    var errEl = document.getElementById('otpSendError');
    var btn = document.getElementById('sendOtpBtn');
    phone = phone ? phone.value.trim() : '';
    if (!phone) { if (errEl) { errEl.textContent = 'Enter your phone number.'; errEl.style.display = 'block'; } return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    try {
      console.log('[Auth] Send OTP request:', { phone });
      var r = await API.sendOtp(phone);
      var data = await r.json();
      console.log('[Auth] Send OTP response:', r.status, data);
      if (r.ok) {
        pendingPhone = phone;
        Auth.showOtpVerify(phone);
      } else {
        if (errEl) { errEl.textContent = data && data.message || 'Failed to send OTP.'; errEl.style.display = 'block'; }
      }
    } catch (e) {
      console.error('[Auth] Send OTP error:', e);
      if (errEl) { errEl.textContent = 'Connection error.'; errEl.style.display = 'block'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send OTP'; }
    }
  },

  showOtpVerify: function(phone) {
    var modal = document.getElementById('authContent');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-header">' +
        '<div>' +
          '<div class="h3">Enter OTP</div>' +
          '<div style="font-size:13px;color:var(--text2);margin-top:4px">Sent to <strong>' + escapeHtml(phone) + '</strong></div>' +
        '</div>' +
        '<button class="modal-close" onclick="closeAll()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="otp-inputs">' +
          [0,1,2,3,4,5].map(function(i) {
            return '<input class="otp-input" maxlength="1" id="otp' + i + '">';
          }).join('') +
        '</div>' +
        '<div id="otpVerifyError" style="color:var(--red);font-size:13px;display:none;margin-bottom:12px"></div>' +
        '<button class="btn btn-primary btn-lg" style="width:100%" id="verifyOtpBtn" onclick="Auth.doVerifyOtp()">Verify and Sign In</button>' +
        '<div style="text-align:center;font-size:13px;color:var(--text3);margin-top:12px">' +
          '<span style="color:var(--brand);cursor:pointer" onclick="Auth.sendOtpForLogin()">Resend OTP</span>' +
        '</div>' +
      '</div>';
    openAuthModal();

    for (var i = 0; i < 6; i++) {
      (function(idx) {
        var el = document.getElementById('otp' + idx);
        if (!el) return;
        el.addEventListener('input', function() { if (el.value) { var next = document.getElementById('otp' + (idx + 1)); if (next) next.focus(); } });
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace' && !el.value) { var prev = document.getElementById('otp' + (idx - 1)); if (prev) prev.focus(); }
          if (e.key === 'Enter') Auth.doVerifyOtp();
        });
      })(i);
    }
    setTimeout(function() { var el = document.getElementById('otp0'); if (el) el.focus(); }, 100);
  },

  doVerifyOtp: async function() {
    var otp = '';
    for (var i = 0; i < 6; i++) { var el = document.getElementById('otp' + i); otp += (el ? el.value || '' : ''); }
    var errEl = document.getElementById('otpVerifyError');
    var btn = document.getElementById('verifyOtpBtn');
    if (otp.length < 6) { if (errEl) { errEl.textContent = 'Enter the complete 6-digit code.'; errEl.style.display = 'block'; } return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }
    try {
      console.log('[Auth] OTP verify request:', { phone: pendingPhone });
      var r = await API.verifyOtp(pendingPhone, otp);
      var data = await r.json();
      console.log('[Auth] OTP verify response:', r.status, data);

      if (!r.ok) {
        if (errEl) { errEl.textContent = data && data.message || 'Invalid OTP.'; errEl.style.display = 'block'; }
        if (btn) { btn.disabled = false; btn.textContent = 'Verify and Sign In'; }
        return;
      }

      var payload = (data && data.data && data.data.data) || (data && data.data) || {};
      var token = payload.accessToken || payload.token;
      var refreshToken = payload.refreshToken || null;
      var user = payload.user || payload;
      var normalizedRole = String(user ? user.role || '' : '').toLowerCase();

      if (!token || !user) {
        if (errEl) { errEl.textContent = 'Invalid response from server.'; errEl.style.display = 'block'; }
        if (btn) { btn.disabled = false; btn.textContent = 'Verify and Sign In'; }
        return;
      }

      Session.set({ ...user, role: normalizedRole }, token, refreshToken);
      closeAll();
      Toast.show('success', 'Welcome, ' + (user.name || 'user') + '!');

      var lowerRole = normalizedRole;
      if (lowerRole === 'super_admin') {
        setTimeout(function() { window.location.href = 'super-admin.html'; }, 500);
      } else if (lowerRole === 'admin') {
        setTimeout(function() { window.location.href = 'admin.html'; }, 500);
      }
    } catch (error) {
      console.error('[Auth] OTP verify error:', error);
      if (errEl) { errEl.textContent = 'Connection error.'; errEl.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Verify and Sign In'; }
    }
  },

  showRegister: async function() {
    var campuses = await Auth._loadCampuses();
    var campusOptions = campuses.map(function(c) { return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join('');
    var modal = document.getElementById('authContent');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-header">' +
        '<div>' +
          '<div class="h3">Create Account</div>' +
          '<div style="font-size:13px;color:var(--text2);margin-top:4px">Quick setup to place your order</div>' +
        '</div>' +
        '<button class="modal-close" onclick="closeAll()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal-body" style="display:flex;flex-direction:column;gap:14px">' +
        '<div class="field"><label>Full Name</label>' +
          '<div class="input-wrap">' +
            '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
            '<input class="input" placeholder="e.g. Amina Hassan" id="regName">' +
          '</div>' +
        '</div>' +
        '<div class="field"><label>Campus</label>' +
          '<select class="input select" id="regCampus"><option value="">Select your campus</option>' + campusOptions + '</select>' +
        '</div>' +
        '<div class="field"><label>Phone Number</label>' +
          '<div class="input-wrap">' +
            '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.88 4.18 2 2 0 0 1 4.87 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 9.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
            '<input class="input" placeholder="0757744555" type="tel" id="regPhone">' +
          '</div>' +
        '</div>' +
        '<div class="field"><label>Password</label>' +
          '<div class="input-wrap">' +
            '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
            '<input class="input" placeholder="Minimum 6 characters" type="password" id="regPassword">' +
          '</div>' +
        '</div>' +
        '<div id="regError" style="color:var(--red);font-size:13px;display:none;padding:10px;background:rgba(220,38,38,.08);border-radius:8px"></div>' +
        '<button class="btn btn-primary btn-lg" style="width:100%" id="regBtn" onclick="Auth.doRegister()">Create Account</button>' +
        '<div style="text-align:center;font-size:13px;color:var(--text3)">' +
          'Have an account?' +
          ' <span style="color:var(--brand);cursor:pointer;font-weight:600" onclick="Auth.showLogin()">Sign in</span>' +
        '</div>' +
      '</div>';
    openAuthModal();
  },

  doRegister: async function() {
    var name = document.getElementById('regName');
    var campusId = document.getElementById('regCampus');
    var phone = document.getElementById('regPhone');
    var password = document.getElementById('regPassword');
    var errEl = document.getElementById('regError');
    var btn = document.getElementById('regBtn');

    name = name ? name.value.trim() : '';
    campusId = campusId ? campusId.value : '';
    phone = phone ? phone.value.trim().replace(/[\s-]/g, '') : '';
    password = password ? password.value : '';

    if (!name || !campusId || !phone || !password) {
      if (errEl) { errEl.textContent = 'All fields are required.'; errEl.style.display = 'block'; }
      return;
    }
    if (password.length < 6) {
      if (errEl) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
    if (errEl) errEl.style.display = 'none';

    try {
      console.log('[Auth] Register request:', { name, phone, campusId });
      var r = await API.register({ name: name, phoneNumber: phone, campusId: campusId, password: password, role: 'customer' });
      var data = await r.json();
      console.log('[Auth] Register response:', r.status, data);
      if (r.ok) {
        Toast.show('success', 'Account created! Signing you in...');
        var loginR = await API.loginWithPassword(phone, password);
        var loginData = await loginR.json();
        var loginPayload = (loginData && loginData.data && loginData.data.data) || (loginData && loginData.data) || {};
        var loginToken = loginPayload.accessToken || loginPayload.token;
        var loginRefresh = loginPayload.refreshToken || null;
        var loginUser = loginPayload.user || loginPayload;
        if (loginR.ok && loginToken && loginUser) {
          Session.set({ ...loginUser, role: String(loginUser ? loginUser.role || '' : '').toLowerCase() }, loginToken, loginRefresh);
          closeAll();
          Toast.show('success', 'Welcome, ' + name + '!');
        } else {
          Auth.showLogin();
        }
      } else {
        if (errEl) { errEl.textContent = data && data.message || 'Registration failed.'; errEl.style.display = 'block'; }
      }
    } catch (e) {
      console.error('[Auth] Register error:', e);
      if (errEl) { errEl.textContent = 'Connection error. Please try again.'; errEl.style.display = 'block'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
    }
  },

  logout: async function() {
    closeAll();
    try { await API.post(EP.LOGOUT, {}); } catch (e) {}
    Session.clear();
    Products.fetch();
    Toast.show('info', 'Signed out successfully.');
  },
};