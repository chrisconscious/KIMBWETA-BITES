// ── KIMBWETA BITES — API Endpoints v2.0 ────────────────────────
const EP = {
  // Auth
  LOGIN:          '/auth/login',        // password login (NEW)
  REGISTER:       '/auth/register',
  OTP_SEND:       '/auth/otp/send',
  OTP_VERIFY:     '/auth/otp/verify',
  TOKEN_REFRESH:  '/auth/token/refresh',
  LOGOUT:         '/auth/logout',
  ME:             '/users/me',

  // Products
  PRODUCTS_PUBLIC: '/products/public',
  PRODUCT:         (id) => `/products/${id}`,

  // Categories
  CATEGORIES:          '/categories',
  CATEGORIES_PUBLIC:   '/categories/public',
  CATEGORY:            (id) => `/categories/${id}`,
  CATEGORY_STATUS:     (id) => `/categories/${id}/status`,
  CATEGORIES_REORDER:  '/categories/reorder',
  CATEGORIES_UPLOAD:   '/categories/upload-icon',

  // Campuses
  CAMPUSES:            '/campuses',
  CAMPUSES_ALL:        '/campuses/all',
  CAMPUS:              (id) => `/campuses/${id}`,
  CAMPUS_STATS:        (id) => `/campuses/${id}/stats`,
  CAMPUS_TOGGLE_ACTIVE: (id) => `/campuses/${id}/toggle-active`,

  // Orders
  ORDERS:       '/orders',
  ORDER:        (id) => `/orders/${id}`,
  ORDER_STATUS: (id) => `/orders/${id}/status`,

  // Ads
  ADS:              '/ads',
  ADS_ACTIVE:       '/ads/active',
  ADS_ANALYTICS:    '/ads/analytics',
  ADS_UPLOAD:       '/ads/upload',
  AD:               (id) => `/ads/${id}`,
  AD_EVENT:         (id) => `/ads/${id}/events`,
  AD_PERFORMANCE:   (id) => `/ads/${id}/performance`,
  AD_PUBLISH:       (id) => `/ads/${id}/publish`,
  AD_PAUSE:         (id) => `/ads/${id}/pause`,
  AD_TOGGLE:        (id) => `/ads/${id}/toggle`,

  // Settings
  SETTINGS_PUBLIC: '/settings/public',
  SETTINGS:        '/settings',
  SETTINGS_LOGO:   '/settings/upload-logo',
  SETTINGS_LOGO_REMOVE: '/settings/logo',
  SETTINGS_SET:    '/settings/set',
  SETTINGS_PRELOADER_LOGO: '/settings/preloader-logo',
  SETTINGS_PRELOADER_LOGO_REMOVE: '/settings/preloader-logo',

  // Analytics
  ANALYTICS_EVENTS: '/analytics/events',
  ANALYTICS_REPORT: '/analytics/report',

  // Payment Details (dynamic per campus)
  PAYMENT_DETAILS: (campusId) => `/payment-details?campus_id=${campusId}`,

  // Social Links
  SOCIAL_LINKS: '/social-links',
  SOCIAL_LINKS_ALL: '/social-links/all',
  SOCIAL_LINK: (platform) => `/social-links/${platform}`,
  SOCIAL_LINK_TOGGLE: (platform) => `/social-links/${platform}/toggle`,

  // Delivery Riders
  RIDERS:             '/delivery-riders',
  RIDERS_AVAILABLE:   '/delivery-riders/available',
  RIDER_APPROVE:      (id) => `/delivery-riders/${id}/approve`,
  RIDER_REJECT:       (id) => `/delivery-riders/${id}/reject`,
  RIDER_AVAILABILITY: '/delivery-riders/availability',

  // Notifications
  NOTIFICATIONS:     '/notifications',
  NOTIFICATION_READ: (id) => `/notifications/${id}/read`,

  // Shares
  SHARE_PRODUCT:    (id) => `/products/${id}/share`,

  // Feedback
  FEEDBACK:        '/feedback',
  FEEDBACK_CANCEL: '/feedback/cancellation',
  FEEDBACK_REC:    '/feedback/recommend',

  // Product Requests
  PRODUCT_REQUESTS: '/product-requests',

  // Super Admin - Customer Insights
  SA_SHARE_ANALYTICS:   '/super-admin/share-analytics',
  SA_CUSTOMER_INSIGHTS: '/super-admin/customer-insights',
  SA_PRODUCT_REQUESTS:  '/super-admin/product-requests',

  // Discovery Engine
  DISCOVERY_TRACK:           '/discovery/track',
  DISCOVERY_FOR_YOU:        '/discovery/for-you',
  DISCOVERY_TRENDING:       '/discovery/trending',
  DISCOVERY_MOST_SHARED:    '/discovery/most-shared',
  DISCOVERY_MOST_PURCHASED: '/discovery/most-purchased',
  DISCOVERY_MOST_LOVED:     '/discovery/most-loved',
  DISCOVERY_NEAR_YOU:       '/discovery/near-you',
  DISCOVERY_FRIENDS_REC:    '/discovery/friends-recommended',
  DISCOVERY_INTERESTS:      '/discovery/interests',
  DISCOVERY_SCORE:          '/discovery/score-interests',
  DISCOVERY_ANALYTICS:      '/discovery/analytics',
  DISCOVERY_SHARE:          '/discovery/share',
  DISCOVERY_SHARE_CLICK:    '/discovery/share/click',
  DISCOVERY_SHARE_PURCHASE: '/discovery/share/purchase',

  // Saved Items
  SAVED_ITEMS:       '/saved-items',

  // Collections
  COLLECTIONS:           '/collections',
  COLLECTION:            (id) => `/collections/${id}`,
  COLLECTION_ITEMS:      (id) => `/collections/${id}/items`,
  COLLECTION_ITEM:       (id, pid) => `/collections/${id}/items/${pid}`,

  // Reviews
  REVIEWS:               '/reviews',
  REVIEWS_PRODUCT:       (pid) => `/reviews/product/${pid}`,
  REVIEW:                (id) => `/reviews/${id}`,

  // Following
  FOLLOWING:             '/following/following',
  FOLLOWERS:             '/following/followers',
  FOLLOW_USER:           (id) => `/following/${id}`,

  // Order Extension
  ORDER_CANCEL:          (id) => `/orders/${id}/cancel`,
  ORDER_TIMELINE:        (id) => `/orders/${id}/timeline`,
  ORDER_BUY_AGAIN:       (id) => `/orders/${id}/buy-again`,

  // Discovery Analytics
  DISCOVER_TRENDING:     '/discover/trending',
  DISCOVER_FOR_YOU:      '/discover/for-you',
  DISCOVER_NEAR_ME:      '/discover/near-me',
  DISCOVER_POPULAR:      '/discover/popular',
  DISCOVER_NEW:          '/discover/new-arrivals',

  // Super Admin Commerce
  SA_COMMERCE_OVERVIEW: '/super-admin/commerce/overview',
  SA_COMMERCE_REVENUE:  '/super-admin/commerce/revenue',
  SA_COMMERCE_ORDERS:   '/super-admin/commerce/orders',
  SA_COMMERCE_TOP:      '/super-admin/commerce/top-products',
  SA_COMMERCE_CAMPUS:   '/super-admin/commerce/campus-performance',
};
