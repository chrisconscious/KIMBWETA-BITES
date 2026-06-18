# 🍔 KIMBWETA BITES — Campus Delivery System

A fully dynamic, fully connected campus food delivery platform for Tanzania universities.

---

## 🔑 Login Credentials

| Role         | Phone        | Password      | Access           |
|--------------|--------------|---------------|------------------|
| Super Admin  | 0757744555   | Lema16family  | super-admin.html |
| Campus Admin | 0712000001   | Lema16family  | admin.html       |

---

## 🏗️ Project Structure

```
kimbweta-system/
├── frontend/
│   ├── index.html          ← Public store (customers)
│   ├── admin.html          ← Campus Admin dashboard
│   ├── super-admin.html    ← Super Admin dashboard
│   └── src/
│       ├── styles/         ← CSS (variables, main, layout, components)
│       ├── scripts/        ← JS (api, auth, products, cart, ads, checkout)
│       ├── components/     ← UI components (toast, modal, search, FAB)
│       ├── config/         ← constants.js, endpoints.js
│       └── utils/          ← storage.js, helpers.js, validators.js
├── backend/
│   ├── src/
│   │   ├── modules/        ← auth, products, orders, ads, campuses, riders…
│   │   ├── middleware/     ← auth, error, validate, audit
│   │   ├── database/       ← prisma.ts
│   │   ├── config/         ← env.ts, logger.ts
│   │   └── utils/          ← jwt.ts, response.ts, otp.ts
│   ├── prisma/
│   │   ├── schema.prisma   ← Full database schema
│   │   └── seed.ts         ← Seeds super admin + sample data
│   ├── .env                ← Environment variables
│   └── package.json
└── database/
    ├── schema.sql          ← PostgreSQL schema
    └── seed.sql            ← SQL seed data
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Step 1: Database

```bash
# Create database user and database
psql -U postgres -c "CREATE USER kimbweta_user WITH PASSWORD 'kimbweta2024';"
psql -U postgres -c "CREATE DATABASE kimbweta OWNER kimbweta_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE kimbweta TO kimbweta_user;"

# Run schema
psql -U kimbweta_user -d kimbweta -f database/schema.sql
```

### Step 2: Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (super admin + sample products)
npm run db:seed

# Start development server
npm run dev
# ✅ API running at http://localhost:3000/api/v1
```

### Step 3: Frontend

No build step required. Serve the `frontend/` folder with any static file server:

**Option A — VS Code Live Server:**
1. Open `frontend/` in VS Code
2. Right-click `index.html` → Open with Live Server
3. Opens at `http://localhost:5500`

**Option B — Python:**
```bash
cd frontend
python3 -m http.server 3001
# Open http://localhost:3001
```

**Option C — Node serve:**
```bash
cd frontend
npx serve . -p 3001
```

---

## 🌐 Environment Variables (backend/.env)

```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database
DATABASE_URL="postgresql://kimbweta_user:kimbweta2024@localhost:5432/kimbweta"

# JWT (change in production!)
JWT_SECRET=kimbweta_jwt_super_secret_change_in_production_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=kimbweta_refresh_secret_change_in_production_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Redis (optional — system works without it using in-memory cache)
REDIS_URL=

# CORS — add your frontend URL here
CORS_ORIGINS=http://localhost:3001,http://localhost:5500,http://127.0.0.1:5500

# OTP (true = log to console in dev, no SMS sent)
OTP_MOCK_MODE=true
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
OTP_RATE_LIMIT_MAX=10

# Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

---

## 📡 Key API Endpoints

### Auth
```
POST /api/v1/auth/login          ← Phone + Password login
POST /api/v1/auth/register       ← Register new user
POST /api/v1/auth/otp/send       ← Send OTP
POST /api/v1/auth/otp/verify     ← Verify OTP → JWT tokens
POST /api/v1/auth/token/refresh  ← Refresh access token
POST /api/v1/auth/logout         ← Revoke session
```

### Public (no auth)
```
GET /api/v1/products/public?campusId=...  ← Approved products
GET /api/v1/ads/active?campusId=...       ← Active ads
GET /api/v1/campuses                      ← All campuses
GET /api/v1/categories                    ← Product categories
```

### Campus Admin (role: admin)
```
GET    /api/v1/products                   ← Admin product list
POST   /api/v1/products                   ← Create product (→ PENDING)
PATCH  /api/v1/products/:id              ← Update product
DELETE /api/v1/products/:id              ← Delete product
GET    /api/v1/orders?campusId=...       ← Campus orders
PATCH  /api/v1/orders/:id/status        ← Update order status
POST   /api/v1/delivery-riders           ← Register rider
GET    /api/v1/campuses/:id/stats        ← Campus statistics
```

### Super Admin (role: super_admin)
```
GET  /api/v1/super-admin/dashboard        ← Platform stats
GET  /api/v1/super-admin/users            ← All users
POST /api/v1/super-admin/campus-admins    ← Assign campus admin
POST /api/v1/products/:id/review          ← Approve/reject product
PATCH /api/v1/delivery-riders/:id/approve ← Approve rider
GET  /api/v1/super-admin/analytics        ← Revenue analytics
```

---

## 🔄 How the System Works

```
1. Super Admin creates Campus Admins via super-admin.html
2. Campus Admin logs in → adds products (status: PENDING)
3. Super Admin approves products → status becomes APPROVED
4. Approved products appear on public index.html
5. Customers browse → add to cart → checkout → place order
6. Campus Admin sees live orders → updates status
7. Customer tracks order in real-time
```

---

## 🔐 Security

- ✅ bcrypt password hashing (12 salt rounds)
- ✅ JWT access tokens (15 min) + refresh tokens (7 days)
- ✅ Role-based access control (customer / admin / super_admin / rider)
- ✅ Campus isolation — admins only see their campus data
- ✅ Rate limiting on all endpoints
- ✅ Input validation with Zod
- ✅ Helmet security headers
- ✅ CORS configured

---

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Ensure PostgreSQL is running
pg_isready -U kimbweta_user -d kimbweta

# Re-run prisma generate
npx prisma generate
```

**Login fails:**
- Phone: `0757744555` or `+255757744555` (both work)
- Run `npm run db:seed` to recreate the super admin account

**Products not showing on public site:**
- Must be APPROVED by super admin first
- Log in as super admin → Approvals tab → approve products

**CORS errors:**
- Add your frontend URL to `CORS_ORIGINS` in `backend/.env`
- Restart backend after changing .env

**Port conflict:**
```bash
# Change backend port in .env
PORT=3001

# Change KB.API_BASE in frontend/src/config/constants.js
API_BASE: 'http://localhost:3001/api/v1'
```
