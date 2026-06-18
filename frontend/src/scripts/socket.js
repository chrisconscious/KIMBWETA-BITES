// ── KIMBWETA BITES — Socket.io Client v2.0 ─────────────────────

const SocketClient = {
  socket: null,

  connect() {
    if (typeof io === 'undefined') return; // socket.io CDN not loaded
    if (this.socket?.connected) return;

    const token = Storage.getStr('kb_token');
    if (!token) return; // Don't connect unauthenticated

    const serverUrl = KB.API_BASE.replace('/api/v1', '');

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
    });

    this.socket.on('connect', () => {
      console.info('[Socket] Connected');
    });

    // Order updates → toast notification + refresh tracking
    this.socket.on('order_updated', (event) => {
      const status = (event.status || '').replace(/_/g, ' ');
      Toast.show('info', `Order update: ${status}`);
      API.invalidate('/orders');
      if (typeof Tracking !== 'undefined' && document.getElementById('view-tracking')?.classList.contains('active')) {
        Tracking.load();
      }
    });

    // New orders (for admin pages that include this script)
    this.socket.on('new_order', (event) => {
      const user = Session.get();
      if (['admin', 'super_admin'].includes(user?.role)) {
        Toast.show('info', `🔔 New order — TZS ${Number(event.totalAmount || 0).toLocaleString()}`);
        // Refresh orders if loadDashboard exists (admin pages)
        if (typeof loadDashboard === 'function') loadDashboard();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.info('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  },

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  },
};
