-- =============================================================================
-- KIMBWETA CAMPUS COMMERCE PLATFORM
-- Production PostgreSQL Database Schema
-- Version: 1.0.0
-- Description: Multi-tenant campus-based snack and small-item delivery platform
--              for universities across Tanzania. Designed for scale, reliability,
--              and operational transparency.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "postgis";         -- Geospatial support (lat/lng queries)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Trigram indexes for fuzzy search on product names

-- =============================================================================
-- SECTION 1: ENUM TYPE DEFINITIONS
-- All enums are defined before table creation to avoid dependency issues.
-- =============================================================================

-- User roles within the platform
CREATE TYPE user_role AS ENUM (
    'customer',     -- End user placing orders
    'admin',        -- Campus-level administrator managing products/orders
    'super_admin'   -- Platform-level administrator with global access
);

-- User account lifecycle status
CREATE TYPE user_status AS ENUM (
    'active',       -- Normal, fully functional account
    'blocked',      -- Suspended due to violations or manual action
    'pending'       -- Registered but not yet phone-verified
);

-- Tanzania regions with active university presence
-- Normalized to snake_upper_case for programmatic use
CREATE TYPE tz_region AS ENUM (
    'DAR_ES_SALAAM',
    'ARUSHA',
    'MWANZA',
    'DODOMA',
    'MBEYA',
    'MOROGORO',
    'IRINGA',
    'KIGOMA',
    'TANGA',
    'ZANZIBAR'
);

-- Product approval lifecycle
CREATE TYPE product_status AS ENUM (
    'PENDING',      -- Submitted by admin, awaiting super_admin review
    'APPROVED',     -- Live and visible to customers
    'REJECTED',     -- Declined by super_admin with reason
    'ARCHIVED'      -- Manually retired, hidden from listings
);

-- Order fulfillment lifecycle
-- Mirrors real-world delivery flow: placed → kitchen → rider → delivered
CREATE TYPE order_status AS ENUM (
    'PENDING',      -- Placed, not yet accepted by admin
    'ACCEPTED',     -- Admin confirmed the order
    'PREPARING',    -- Kitchen is preparing
    'ON_THE_WAY',   -- Rider picked up, en route to customer
    'DELIVERED',    -- Successfully completed
    'CANCELLED'     -- Cancelled by customer, admin, or system timeout
);

-- Accepted payment methods in the Tanzanian market
CREATE TYPE payment_method AS ENUM (
    'CASH',         -- Cash on delivery
    'MOBILE'        -- M-Pesa, Tigo Pesa, Airtel Money, HaloPesa
);

-- Payment lifecycle independent of order status
CREATE TYPE payment_status AS ENUM (
    'PENDING',      -- Awaiting payment confirmation
    'PAID',         -- Payment confirmed
    'FAILED',       -- Payment attempt failed
    'REFUNDED'      -- Refund issued to customer
);

-- Ad engagement event types for analytics
CREATE TYPE ad_event_type AS ENUM (
    'VIEW',         -- Ad rendered on screen
    'CLICK'         -- User tapped/clicked the ad
);

-- OTP delivery channel
CREATE TYPE otp_channel AS ENUM (
    'SMS',          -- Sent via SMS to phone_number
    'EMAIL'         -- Sent via email (future capability)
);


-- =============================================================================
-- SECTION 2: CORE TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: users
-- Central identity table. Phone-first auth model; email is optional.
-- Supports multiple roles but a user holds exactly one role at registration.
-- For campus admin assignment, see campus_admins join table.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(150)    NOT NULL,
    email               VARCHAR(255)    UNIQUE,                      -- Optional; unique when provided
    phone_number        VARCHAR(20)     NOT NULL UNIQUE,             -- E.164 format recommended (+255...)
    password_hash       TEXT,                                         -- NULL for pure OTP users
    phone_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    email_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    role                user_role       NOT NULL DEFAULT 'customer',
    status              user_status     NOT NULL DEFAULT 'pending',
    profile_image_url   TEXT,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ                                  -- Soft delete; keeps order history intact
);

COMMENT ON TABLE users IS 'Primary identity store for all platform actors. Phone is the canonical identifier.';
COMMENT ON COLUMN users.password_hash IS 'Nullable — users authenticating exclusively via OTP will have NULL here.';
COMMENT ON COLUMN users.phone_number IS 'Must be stored in E.164 format (e.g., +255712345678) for SMS routing.';


-- -----------------------------------------------------------------------------
-- TABLE: campuses
-- Represents a university or institution onboarded onto the platform.
-- Each campus is an isolated commerce unit (products, admins, orders).
-- -----------------------------------------------------------------------------
CREATE TABLE campuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200)    NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    region          tz_region       NOT NULL,
    address_text    TEXT,                                            -- Human-readable address fallback
    latitude        NUMERIC(10, 7),                                  -- Campus center coordinates
    longitude       NUMERIC(10, 7),
    logo_url        TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE campuses IS 'Each row represents one onboarded university/campus. Acts as the primary tenant boundary.';


-- -----------------------------------------------------------------------------
-- TABLE: campus_admins
-- Junction table assigning admin users to specific campuses.
-- A user with role=admin must have a row here to manage a campus.
-- One admin can be assigned to multiple campuses (e.g., satellite campuses).
-- -----------------------------------------------------------------------------
CREATE TABLE campus_admins (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campus_id   UUID            NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    assigned_by UUID            REFERENCES users(id) ON DELETE SET NULL, -- super_admin who made assignment
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Prevent duplicate assignments of the same admin to the same campus
    CONSTRAINT uq_campus_admin UNIQUE (user_id, campus_id)
);

COMMENT ON TABLE campus_admins IS 'M:N join table. Grants an admin user operational authority over a specific campus.';


-- =============================================================================
-- SECTION 3: PRODUCT & INVENTORY TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: categories
-- Product taxonomy. Admins assign products to categories for filtering/search.
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100)    NOT NULL UNIQUE,
    icon_url    TEXT,
    sort_order  SMALLINT        NOT NULL DEFAULT 0,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Product categories (e.g., Snacks, Drinks, Stationery). Global across all campuses.';


-- -----------------------------------------------------------------------------
-- TABLE: products
-- Campus-scoped product catalog with super_admin approval gate.
-- Products are not visible to customers until status = APPROVED.
-- price stored in TZS (Tanzanian Shilling) as integer cents to avoid float issues.
-- -----------------------------------------------------------------------------
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    price           INTEGER         NOT NULL CHECK (price >= 0),     -- Price in TZS (no decimals needed)
    image_url       TEXT,
    campus_id       UUID            NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
    category_id     UUID            REFERENCES categories(id) ON DELETE SET NULL,
    created_by      UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- admin who listed it
    status          product_status  NOT NULL DEFAULT 'PENDING',
    approved_by     UUID            REFERENCES users(id) ON DELETE SET NULL,          -- super_admin reviewer
    approved_at     TIMESTAMPTZ,
    rejection_note  TEXT,                                             -- Reason if REJECTED
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,            -- Toggle visibility without changing status
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ                                       -- Soft delete; preserves order_items history
);

COMMENT ON TABLE products IS 'Campus-specific product listings. Must be approved by super_admin before being orderable.';
COMMENT ON COLUMN products.price IS 'Stored in TZS whole units. No fractional cents in Tanzanian commerce.';


-- -----------------------------------------------------------------------------
-- TABLE: inventory
-- One-to-one with products. Tracks real-time stock levels.
-- Separate table allows inventory operations without locking the products table.
-- -----------------------------------------------------------------------------
CREATE TABLE inventory (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID        NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    quantity            INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold INTEGER     NOT NULL DEFAULT 5,              -- Alert fires when quantity <= this
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE inventory IS 'Live stock tracker. Alert systems should query WHERE quantity <= low_stock_threshold.';


-- =============================================================================
-- SECTION 4: ORDER TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: orders
-- The central transaction record. Campus-scoped so routing is always clear.
-- Location is captured at order time (snapshot), not linked to a saved address.
-- phone_snapshot captures the phone at order time in case user updates theirs later.
-- -----------------------------------------------------------------------------
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    campus_id           UUID            NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
    total_amount        INTEGER         NOT NULL CHECK (total_amount >= 0), -- TZS
    status              order_status    NOT NULL DEFAULT 'PENDING',
    payment_method      payment_method  NOT NULL,
    payment_status      payment_status  NOT NULL DEFAULT 'PENDING',
    phone_snapshot      VARCHAR(20)     NOT NULL,                    -- Phone at time of order
    location_lat        NUMERIC(10, 7),                              -- Delivery GPS lat
    location_lng        NUMERIC(10, 7),                              -- Delivery GPS lng
    location_text       TEXT,                                        -- Human fallback: "Block C, Room 14"
    rider_id            UUID            REFERENCES users(id) ON DELETE SET NULL, -- Future: rider role
    rider_notes         TEXT,                                        -- Instructions from rider to customer
    cancellation_reason TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ                                  -- Soft delete (admin hide, not true delete)
);

COMMENT ON TABLE orders IS 'Immutable transaction record. Statuses advance forward; CANCELLED is terminal. Never hard-delete.';
COMMENT ON COLUMN orders.phone_snapshot IS 'Denormalized phone captured at order time. User may change phone later.';
COMMENT ON COLUMN orders.total_amount IS 'Computed and stored at checkout. Source of truth for billing, not recalculated.';


-- -----------------------------------------------------------------------------
-- TABLE: order_items
-- Line items within an order. price_at_time is a critical snapshot —
-- product prices may change, but the order must reflect what was charged.
-- -----------------------------------------------------------------------------
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- Don't delete products with orders
    quantity        SMALLINT    NOT NULL CHECK (quantity > 0),
    price_at_time   INTEGER     NOT NULL CHECK (price_at_time >= 0), -- TZS snapshot at purchase
    product_name_snapshot VARCHAR(200) NOT NULL                      -- Name snapshot in case product is renamed/deleted
);

COMMENT ON TABLE order_items IS 'Immutable line items. price_at_time and product_name_snapshot protect billing integrity.';


-- =============================================================================
-- SECTION 5: ADS SYSTEM
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: ads
-- Banner advertisements shown to users. campus_id = NULL means global (all campuses).
-- Date-gating allows future scheduling of campaigns.
-- -----------------------------------------------------------------------------
CREATE TABLE ads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(200)    NOT NULL,
    image_url       TEXT            NOT NULL,
    target_url      TEXT,                                            -- Where tapping the ad goes
    campus_id       UUID            REFERENCES campuses(id) ON DELETE SET NULL, -- NULL = show on all campuses
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    start_date      DATE,                                            -- Inclusive start; NULL = immediately
    end_date        DATE,                                            -- Inclusive end; NULL = indefinite
    impression_cap  INTEGER,                                         -- Max views allowed (NULL = unlimited)
    created_by      UUID            REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ                                      -- Soft delete preserves event history
);

COMMENT ON TABLE ads IS 'Promotional banners. campus_id = NULL broadcasts ad to all campuses (global placement).';


-- -----------------------------------------------------------------------------
-- TABLE: ad_events
-- Append-only event log for ad engagement analytics.
-- High-insert table — kept narrow for write performance.
-- No UPDATE or DELETE should ever occur on this table.
-- -----------------------------------------------------------------------------
CREATE TABLE ad_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id       UUID            NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    user_id     UUID            REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous views
    event_type  ad_event_type   NOT NULL,
    ip_address  INET,                                                -- For deduplication / fraud detection
    user_agent  TEXT,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ad_events IS 'Append-only click/view log. Never update or delete rows — aggregate queries derive metrics.';


-- =============================================================================
-- SECTION 6: ANALYTICS & OBSERVABILITY
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: events
-- General-purpose analytics event bus. Schemaless via JSONB metadata.
-- Designed for high write volume — no foreign key on user_id intentionally
-- to allow anonymous/pre-registration events without blocking inserts.
-- -----------------------------------------------------------------------------
CREATE TABLE events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID,                                                -- Nullable; no FK for write performance
    session_id  UUID,                                                -- Client-generated session identifier
    campus_id   UUID,                                                -- Context campus (if applicable)
    event_type  VARCHAR(100)    NOT NULL,                            -- e.g., 'product_viewed', 'checkout_started'
    metadata    JSONB           NOT NULL DEFAULT '{}',               -- Flexible payload per event_type
    ip_address  INET,
    platform    VARCHAR(50),                                         -- 'ios', 'android', 'web'
    app_version VARCHAR(20),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE events IS 'Schemaless event bus. No FK on user_id deliberately — allows guest/anonymous event capture.';
COMMENT ON COLUMN events.metadata IS 'JSONB payload; schema defined per event_type in application layer documentation.';


-- -----------------------------------------------------------------------------
-- TABLE: audit_logs
-- Immutable log of all sensitive/privileged actions in the system.
-- Written by application middleware after every state-changing admin operation.
-- Never truncated or soft-deleted — compliance artifact.
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID,                                            -- Actor (admin/super_admin); no FK for integrity
    action          VARCHAR(100)    NOT NULL,                        -- e.g., 'product.approved', 'user.blocked'
    entity_type     VARCHAR(100),                                    -- e.g., 'product', 'order', 'user'
    entity_id       UUID,                                            -- PK of the affected row
    campus_id       UUID,                                            -- Campus context for routing
    metadata        JSONB           NOT NULL DEFAULT '{}',           -- Before/after state diff or context
    ip_address      INET,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()           -- No updated_at; logs are immutable
);

COMMENT ON TABLE audit_logs IS 'Compliance-grade immutable audit trail. Application must write here for every privileged action.';


-- =============================================================================
-- SECTION 7: AUTHENTICATION
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: otp_codes
-- Short-lived one-time passwords for phone and email verification.
-- user_id is nullable to allow OTP send before user record exists (registration flow).
-- Verified = TRUE after successful match; expired codes are purged by a background job.
-- -----------------------------------------------------------------------------
CREATE TABLE otp_codes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            REFERENCES users(id) ON DELETE CASCADE, -- NULL during pre-registration
    phone_number    VARCHAR(20),                                     -- Target phone (for SMS OTPs)
    email           VARCHAR(255),                                    -- Target email (for email OTPs)
    channel         otp_channel     NOT NULL DEFAULT 'SMS',
    code            VARCHAR(10)     NOT NULL,                        -- 4-6 digit code (store hashed in prod)
    expires_at      TIMESTAMPTZ     NOT NULL,                        -- Typically NOW() + 10 minutes
    verified        BOOLEAN         NOT NULL DEFAULT FALSE,
    attempts        SMALLINT        NOT NULL DEFAULT 0,              -- Track brute-force attempts
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Ensure at least one delivery target is provided
    CONSTRAINT chk_otp_target CHECK (phone_number IS NOT NULL OR email IS NOT NULL)
);

COMMENT ON TABLE otp_codes IS 'Short-lived auth tokens. Background job should purge WHERE expires_at < NOW() AND verified = FALSE.';
COMMENT ON COLUMN otp_codes.code IS 'Store as bcrypt hash in production. Raw code only during development.';
COMMENT ON COLUMN otp_codes.attempts IS 'Increment on each failed verification attempt. Lock after 5 attempts.';


-- -----------------------------------------------------------------------------
-- TABLE: refresh_tokens
-- Persistent session tokens for JWT refresh flow.
-- Revoked via is_revoked flag rather than deletion for audit purposes.
-- -----------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT            NOT NULL UNIQUE,                 -- SHA-256 hash of the actual token
    device_info     TEXT,                                            -- User-agent or device fingerprint
    ip_address      INET,
    expires_at      TIMESTAMPTZ     NOT NULL,
    is_revoked      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE refresh_tokens IS 'JWT refresh token store. Rotate on every use; revoke all on logout/password change.';


-- =============================================================================
-- SECTION 8: NOTIFICATION SYSTEM (EXTENSIBLE)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: notifications
-- Persistent in-app notification records. Push/SMS delivery handled externally.
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200)    NOT NULL,
    body            TEXT            NOT NULL,
    type            VARCHAR(50)     NOT NULL,                        -- 'order_update', 'promo', 'system'
    reference_id    UUID,                                            -- FK-like pointer (order_id, ad_id, etc.)
    reference_type  VARCHAR(50),                                     -- Entity type of reference_id
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Persistent inbox for in-app notifications. Push dispatch handled by a separate service layer.';


-- =============================================================================
-- SECTION 9: INDEXES
-- Critical for query performance at scale. Covers FK lookups, status filters,
-- geospatial proximity, and full-text search patterns.
-- =============================================================================

-- ---- USERS ----
CREATE INDEX idx_users_phone      ON users (phone_number);
CREATE INDEX idx_users_email      ON users (email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_role       ON users (role);
CREATE INDEX idx_users_status     ON users (status);
CREATE INDEX idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NULL;

-- ---- CAMPUSES ----
CREATE INDEX idx_campuses_region    ON campuses (region);
CREATE INDEX idx_campuses_is_active ON campuses (is_active);

-- ---- CAMPUS_ADMINS ----
CREATE INDEX idx_campus_admins_user_id   ON campus_admins (user_id);
CREATE INDEX idx_campus_admins_campus_id ON campus_admins (campus_id);

-- ---- PRODUCTS ----
CREATE INDEX idx_products_campus_id  ON products (campus_id);
CREATE INDEX idx_products_status     ON products (status);
CREATE INDEX idx_products_category   ON products (category_id);
CREATE INDEX idx_products_created_by ON products (created_by);
CREATE INDEX idx_products_deleted_at ON products (deleted_at) WHERE deleted_at IS NULL;
-- Trigram index for fuzzy name search across product catalog
CREATE INDEX idx_products_name_trgm  ON products USING gin (name gin_trgm_ops);

-- ---- INVENTORY ----
CREATE INDEX idx_inventory_product_id ON inventory (product_id);
-- Partial index for low-stock alert queries
CREATE INDEX idx_inventory_low_stock  ON inventory (product_id, quantity)
    WHERE quantity <= low_stock_threshold;  -- WARNING: Not updatable; use functional approach in app

-- ---- ORDERS ----
CREATE INDEX idx_orders_user_id    ON orders (user_id);
CREATE INDEX idx_orders_campus_id  ON orders (campus_id);
CREATE INDEX idx_orders_status     ON orders (status);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_deleted_at ON orders (deleted_at) WHERE deleted_at IS NULL;
-- Composite for admin dashboard: "show me pending orders on my campus"
CREATE INDEX idx_orders_campus_status ON orders (campus_id, status);

-- ---- ORDER ITEMS ----
CREATE INDEX idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- ---- ADS ----
CREATE INDEX idx_ads_campus_id   ON ads (campus_id);
CREATE INDEX idx_ads_is_active   ON ads (is_active);
CREATE INDEX idx_ads_date_range  ON ads (start_date, end_date);
CREATE INDEX idx_ads_deleted_at  ON ads (deleted_at) WHERE deleted_at IS NULL;

-- ---- AD_EVENTS ----
CREATE INDEX idx_ad_events_ad_id      ON ad_events (ad_id);
CREATE INDEX idx_ad_events_user_id    ON ad_events (user_id);
CREATE INDEX idx_ad_events_type       ON ad_events (event_type);
CREATE INDEX idx_ad_events_created_at ON ad_events (created_at DESC);

-- ---- EVENTS (ANALYTICS) ----
CREATE INDEX idx_events_user_id     ON events (user_id);
CREATE INDEX idx_events_campus_id   ON events (campus_id);
CREATE INDEX idx_events_event_type  ON events (event_type);
CREATE INDEX idx_events_created_at  ON events (created_at DESC);
-- JSONB GIN index for metadata filtering (e.g., WHERE metadata @> '{"source":"homepage"}')
CREATE INDEX idx_events_metadata    ON events USING gin (metadata);

-- ---- AUDIT_LOGS ----
CREATE INDEX idx_audit_logs_user_id      ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity       ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_action       ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at  ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_campus_id   ON audit_logs (campus_id);

-- ---- OTP_CODES ----
CREATE INDEX idx_otp_codes_phone      ON otp_codes (phone_number);
CREATE INDEX idx_otp_codes_user_id    ON otp_codes (user_id);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes (expires_at); -- For cleanup job

-- ---- REFRESH_TOKENS ----
CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- ---- NOTIFICATIONS ----
CREATE INDEX idx_notifications_user_id  ON notifications (user_id);
CREATE INDEX idx_notifications_is_read  ON notifications (user_id, is_read) WHERE is_read = FALSE;


-- =============================================================================
-- SECTION 10: TRIGGERS
-- Automatically maintain updated_at timestamps on all mutable tables.
-- =============================================================================

-- Reusable trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all mutable tables
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_campuses
    BEFORE UPDATE ON campuses
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_campus_admins
    BEFORE UPDATE ON campus_admins
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_inventory
    BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_ads
    BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- SECTION 11: VIEWS
-- Pre-built views for common application query patterns.
-- =============================================================================

-- Active products available for ordering on a given campus
CREATE OR REPLACE VIEW v_active_products AS
SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.campus_id,
    c.name           AS campus_name,
    p.category_id,
    cat.name         AS category_name,
    i.quantity       AS stock_quantity,
    i.low_stock_threshold,
    (i.quantity > 0) AS in_stock
FROM products p
JOIN campuses c      ON c.id = p.campus_id
LEFT JOIN categories cat ON cat.id = p.category_id
LEFT JOIN inventory i    ON i.product_id = p.id
WHERE p.status = 'APPROVED'
  AND p.deleted_at IS NULL
  AND p.is_available = TRUE
  AND c.is_active = TRUE;

COMMENT ON VIEW v_active_products IS 'Customer-facing product feed. Only APPROVED, available, non-deleted products from active campuses.';


-- Order summary for admin dashboards
CREATE OR REPLACE VIEW v_order_summary AS
SELECT
    o.id,
    o.status,
    o.payment_status,
    o.total_amount,
    o.created_at,
    o.campus_id,
    c.name           AS campus_name,
    u.name           AS customer_name,
    u.phone_number   AS customer_phone,
    COUNT(oi.id)     AS item_count
FROM orders o
JOIN campuses c      ON c.id = o.campus_id
JOIN users u         ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.deleted_at IS NULL
GROUP BY o.id, c.name, u.name, u.phone_number;

COMMENT ON VIEW v_order_summary IS 'Aggregated order view for admin panels. Joins user and campus for display without repeated joins in app.';


-- Ad performance metrics
CREATE OR REPLACE VIEW v_ad_performance AS
SELECT
    a.id,
    a.title,
    a.campus_id,
    COUNT(*) FILTER (WHERE ae.event_type = 'VIEW')  AS total_views,
    COUNT(*) FILTER (WHERE ae.event_type = 'CLICK') AS total_clicks,
    ROUND(
        COUNT(*) FILTER (WHERE ae.event_type = 'CLICK')::NUMERIC /
        NULLIF(COUNT(*) FILTER (WHERE ae.event_type = 'VIEW'), 0) * 100, 2
    )                                                 AS ctr_percent
FROM ads a
LEFT JOIN ad_events ae ON ae.ad_id = a.id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.title, a.campus_id;

COMMENT ON VIEW v_ad_performance IS 'Click-through rate and engagement metrics per ad. Powers the ads analytics dashboard.';


-- =============================================================================
-- SECTION 12: SEED DATA (REFERENCE)
-- Safe to run in staging/development. Not idempotent — use with care.
-- =============================================================================

-- Seed categories
INSERT INTO categories (name, sort_order) VALUES
    ('Snacks',       1),
    ('Drinks',       2),
    ('Meals',        3),
    ('Stationery',   4),
    ('Toiletries',   5),
    ('Electronics',  6),
    ('Other',        99);

-- Seed campuses
INSERT INTO campuses (name, city, region) VALUES
    ('University of Dar es Salaam',      'Dar es Salaam', 'DAR_ES_SALAAM'),
    ('Ardhi University',                 'Dar es Salaam', 'DAR_ES_SALAAM'),
    ('Muhimbili University',             'Dar es Salaam', 'DAR_ES_SALAAM'),
    ('National Institute of Transport',   'Dar es Salaam', 'DAR_ES_SALAAM'),
    ('institute of Finance Management',     'Dar es Salaam', 'DAR_ES_SALAAM'),
    ('Tanzana institute of Accountancy',     'Dar es Salaam', 'DAR_ES_SALAAM'),
    ('Sokoine University of Agriculture', 'Morogoro',      'MOROGORO'),
    ('Nelson Mandela African Institute', 'Arusha',        'ARUSHA'),
    ('University of Dodoma',             'Dodoma',        'DODOMA'),
    ('Mzumbe University',                'Morogoro',      'MOROGORO'),
    ('Mbeya University of Science',      'Mbeya',         'MBEYA'),
    ('State University of Zanzibar',     'Zanzibar',      'ZANZIBAR');


-- =============================================================================
-- END OF SCHEMA
-- KIMBWETA v1.0.0 — Built for Tanzania, Ready for Scale
-- =============================================================================

-- ─────────────────────────────────────────────────────────────
-- MISSING TABLES (added for completeness - use prisma db push)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS delivery_riders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id       UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  vehicle_type    VARCHAR(50),
  vehicle_plate   VARCHAR(50),
  id_number       VARCHAR(100),
  status          VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
  is_available    BOOLEAN NOT NULL DEFAULT false,
  registered_by   UUID REFERENCES users(id),
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMP WITH TIME ZONE,
  rejection_note  TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS payment_details (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id     UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  provider      VARCHAR(50) NOT NULL,
  phone_number  VARCHAR(20) NOT NULL,
  account_name  VARCHAR(200),
  instructions  TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform   VARCHAR(50) NOT NULL UNIQUE,
  url        TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id  UUID,
  campus_id   UUID REFERENCES campuses(id) ON DELETE SET NULL,
  event_type  VARCHAR(100) NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  ip_address  VARCHAR(45),
  platform    VARCHAR(20),
  app_version VARCHAR(20),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_delivery_riders_campus ON delivery_riders(campus_id);
CREATE INDEX IF NOT EXISTS idx_delivery_riders_status ON delivery_riders(status);
CREATE INDEX IF NOT EXISTS idx_payment_details_campus ON payment_details(campus_id);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
