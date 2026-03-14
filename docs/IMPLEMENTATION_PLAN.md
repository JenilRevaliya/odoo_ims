# CoreInventory — Parallel Implementation Plan
### 2-Developer Delivery: Zero-Conflict GitHub Workflow

> **Version:** 2.0.0 | **Date:** 2026-03-14  
> **Team:** Dev-A (Backend) · Dev-B (Frontend)  
> **Target:** v1.0 fully functional in ~6 weeks  
> **Workflow Map:** See [workflow_commands.md](workflow_commands.md) for exact `/command` per task

---

## Table of Contents

1. [Team Split & Ownership Rules](#1-team-split--ownership-rules)
2. [GitHub Workflow Rules (No Conflicts)](#2-github-workflow-rules-no-conflicts)
3. [Repository Structure](#3-repository-structure)
4. [Phase 0 — Project Setup (Together, Day 1)](#4-phase-0--project-setup-together-day-1)
5. [Phase 1 — Foundation (Week 1)](#5-phase-1--foundation-week-1)
6. [Phase 2 — Core Modules (Week 2–3)](#6-phase-2--core-modules-week-23)
7. [Phase 3 — Operations Engine (Week 3–4)](#7-phase-3--operations-engine-week-34)
8. [Phase 4 — Advanced Features (Week 4–5)](#8-phase-4--advanced-features-week-45)
9. [Phase 5 — Integration & Polish (Week 5–6)](#9-phase-5--integration--polish-week-56)
10. [Sync Points & Merge Gates](#10-sync-points--merge-gates)
11. [Environment & API Contracts](#11-environment--api-contracts)
12. [Done Conditions Per Phase](#12-done-conditions-per-phase)

---

## 1. Team Split & Ownership Rules

### Developer Assignment

| Developer | Role | Domain |
|---|---|---|
| **Dev-A** | Backend Engineer | Database, API, Auth, Business Logic, Migrations |
| **Dev-B** | Frontend Engineer | React Pages, UI Components, State Management, API Integration |

### Golden Rule of Parallel Work

> **Dev-A never touches `frontend/` · Dev-B never touches `backend/`**  
> Shared files (types, API specs) are pre-agreed contracts — not edited unilaterally.

### File Ownership Map

```
/
├── backend/             ← Dev-A ONLY
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── operations/
│   │   │   ├── warehouses/
│   │   │   └── stock-ledger/
│   │   ├── shared/
│   │   ├── config/
│   │   └── server.ts
│   ├── migrations/
│   ├── tests/
│   └── package.json
│
├── frontend/            ← Dev-B ONLY
│   ├── src/
│   │   ├── app/         (Next.js App Router pages)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
│
├── shared/              ← BOTH, but coordinate before editing
│   └── types.ts         (Shared TypeScript interfaces — agreed contract)
│
├── docs/                ← Both can add, never delete
├── docker-compose.yml   ← Dev-A owns
├── .github/             ← Both contribute workflow files
└── README.md            ← Coordinate edits
```

---

## 2. GitHub Workflow Rules (No Conflicts)

### Branch Strategy

```
main           ← Protected. Never direct push. PR only.
  └── dev      ← Integration branch. Merge target for all features.
       ├── feature/backend/[feature-name]   ← Dev-A branches
       └── feature/frontend/[feature-name]  ← Dev-B branches
```

### Rules

```
✅ ALWAYS branch from dev, not main
✅ ALWAYS PR into dev, not main
✅ main ← dev only via a Release PR (at end of each version)
✅ Dev-A prefixes all branches: feature/backend/xxx
✅ Dev-B prefixes all branches: feature/frontend/xxx
✅ Never work directly on dev or main
✅ Rebase dev into your branch BEFORE raising a PR (not merge)
✅ Squash commits on merge into dev (clean history)
✅ PR requires at least 1 review from the other developer
```

### Conflict Prevention Rules

```
1. NEVER edit the same file as the other developer
2. If you need a type that spans both — add it to shared/types.ts
   and notify the other dev via PR comment before merging
3. package.json edits: coordinate via Slack/WhatsApp before pushing
   (both may need the same dependency at similar times)
4. docker-compose.yml: Dev-A owns; Dev-B requests changes via PR comment
5. migrations/: Dev-A owns entirely — no frontend changes here ever
6. README.md: coordinate before editing (different sections)
```

### Daily Workflow

```
Start of day:
  git checkout dev
  git pull origin dev
  git checkout feature/[your]/[feature]
  git rebase dev   ← stays up to date with partner's merged work

End of day:
  git push origin feature/[your]/[feature]
  Comment on open PR if blocked on partner's work
```

---

## 3. Repository Structure

### Initialize Monorepo

```
coreinventory/
├── backend/
├── frontend/
├── shared/
│   └── types.ts
├── docs/
├── docker-compose.yml
├── docker-compose.test.yml
├── .gitignore
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
└── README.md
```

### `.gitignore` (root)

```gitignore
node_modules/
.env
.env.local
.env.production
*.log
dist/
.next/
coverage/
```

---

## 4. Phase 0 — Project Setup (Together, Day 1)

**Duration:** 1 day | **Both developers together (pair session)**  
**Workflows:** `/plan` → `/create` → `/preview`

> This is the ONLY phase where both developers work in the same place.  
> Everything after this is parallel and independent.

### Tasks (Pair — Both)

```
☐ Create GitHub repository: coreinventory
☐ Initialize monorepo folder structure (root + backend/ + frontend/ + shared/)
☐ Configure branch protection rules on main:
    - Require PR review: 1 approver
    - Require status checks to pass before merge
    - Disallow direct push
☐ Create dev branch from main (set as default branch)
☐ Initialize backend/: npm init, TypeScript config, ESLint, Prettier
☐ Initialize frontend/: npx create-next-app@latest ./frontend (TypeScript, App Router)
☐ Set up shared/types.ts with agreed API types (see Section 11)
☐ Create docker-compose.yml with PostgreSQL + Redis services
☐ Create .env.example files for both backend and frontend
☐ Write README.md with setup instructions
☐ Both run full setup locally to confirm it works
☐ Create GitHub Actions: backend-ci.yml + frontend-ci.yml (lint + test stubs)
☐ Commit as initial commit → push to dev
```

### Agreed API Contract (Lock in before separating)

Both developers agree on `shared/types.ts` — this is the shared interface that prevents mismatches.  
**This file is locked until both agree to change it in a joint PR.**

---

## 5. Phase 1 — Foundation (Week 1)

**Duration:** 5 days | **Fully parallel after Phase 0**

---

### Dev-A: Backend Foundation

**Branch:** `feature/backend/foundation`  
**Workflows:** `/generate` → `/tribunal-database` (migrations) → `/tribunal-backend` (auth) → `/test`

#### Day 1–2: Database & Migrations

```
☐ Install: knex / prisma, pg, uuid, dotenv
☐ Configure database connection (pool, env-based URL)
☐ Write migration: 001_create_users.sql
☐ Write migration: 002_create_products.sql
☐ Write migration: 003_create_warehouses_locations.sql
☐ Write migration: 004_create_stock_balances.sql
☐ Write migration: 005_create_operations.sql
☐ Write migration: 006_create_operation_lines.sql
☐ Write migration: 007_create_stock_ledger.sql (append-only)
☐ Write migration: 008_create_otp_tokens.sql
☐ Write trigger: prevent UPDATE/DELETE on stock_ledger
☐ Write seed data: 2 warehouses, 3 locations, 3 products (for dev/testing)
☐ Run migrations locally — confirm all tables created
☐ Write tests: verify trigger blocks UPDATE on stock_ledger
```

#### Day 3–4: Express Server & Auth Module

```
☐ Install: express, cors, helmet, express-rate-limit, compression
☐ Install: jsonwebtoken, bcrypt, ioredis, nodemailer/@sendgrid/mail
☐ Install: zod (input validation), winston (logging)
☐ Set up Express app with global error handler
☐ Implement: POST /auth/signup
☐ Implement: POST /auth/login (JWT access + refresh token)
☐ Implement: POST /auth/logout
☐ Implement: POST /auth/refresh
☐ Implement: GET /health
☐ Auth middleware: requireAuth, requireRole
☐ Rate limiter middleware on /auth/* routes
```

#### Day 5: Tests + PR

```
☐ Unit tests: auth service (login, invalid credentials, token generation)
☐ Unit tests: bcrypt comparison, JWT sign + verify
☐ Integration tests: POST /auth/login, POST /auth/signup
☐ Confirm health endpoint returns { db: connected, redis: connected }
☐ Push → open PR → request review from Dev-B
```

**Files created by Dev-A:**
```
backend/src/modules/auth/
backend/src/shared/middleware/
backend/src/config/
backend/migrations/001–008
backend/package.json
docker-compose.yml (postgres + redis services)
```

---

### Dev-B: Frontend Foundation

**Branch:** `feature/frontend/foundation`  
**Workflows:** `/ui-ux-pro-max` (design system) → `/generate` (auth pages) → `/tribunal-frontend`

#### Day 1–2: Next.js Setup & Design System

```
☐ Install: @tanstack/react-query, zustand, axios
☐ Install: @radix-ui/react-* (dialog, dropdown, tooltip)
☐ Set up Google Fonts: DM Mono + IBM Plex Sans (via next/font)
☐ Create globals.css with full CSS variable system:
    --bg-base, --bg-surface, --bg-elevated, --bg-hover
    --accent, --accent-muted, --accent-glow
    --success, --warning, --danger, --info
    --text-primary, --text-secondary, --text-muted
    --border, --border-subtle
☐ Create layout.tsx: root layout with sidebar + main content area
☐ Build Sidebar component (collapsible, amber active state)
☐ Build navigation links (Dashboard, Products, Operations, History, Settings)
☐ Build top header bar with profile dropdown placeholder
☐ Responsive: sidebar collapses to icons at tablet width
```

#### Day 3–4: Auth Pages

```
☐ Create /app/(auth)/login/page.tsx — login form
☐ Create /app/(auth)/signup/page.tsx — signup form
☐ Create /app/(auth)/forgot-password/page.tsx — OTP request form
☐ Create /app/(auth)/reset-password/page.tsx — OTP + new password form
☐ Build AuthProvider (Zustand store): stores access_token in memory
☐ Build API client (axios instance): auto-attach Bearer token, auto-refresh on 401
☐ Build ProtectedRoute wrapper: redirects to /login if no token
☐ Connect login form to POST /auth/login (use mock until backend merges)
☐ Store access_token in Zustand; redirect to /dashboard on success
```

#### Day 5: Shared Components + PR

```
☐ Build LoadingSkeleton component
☐ Build StatusBadge component (Draft/Waiting/Ready/Done/Canceled)
☐ Build AlertBanner component (amber warning)
☐ Build EmptyState component
☐ Build ConfirmDialog component (modal with confirm/cancel)
☐ Build basic DataTable component (columns, rows, pagination)
☐ Push → open PR → request review from Dev-A
```

**Files created by Dev-B:**
```
frontend/src/app/(auth)/
frontend/src/app/layout.tsx
frontend/src/components/ui/
frontend/src/components/layout/Sidebar.tsx
frontend/src/lib/api.ts
frontend/src/store/auth.ts
frontend/package.json
```

---

### ⚓ Sync Point 1 (End of Week 1)

```
Both merge their Phase 1 PRs into dev.
Joint 30-minute call:
  ☐ Dev-A demos: health endpoint, login, JWT flow in Postman
  ☐ Dev-B demos: login page, sidebar, auth flow in browser
  ☐ Agree on any shared/types.ts changes before Phase 2
  ☐ Dev-A shares Postman collection with all current endpoints
  ☐ Both pull latest dev before starting Week 2 branches
```

---

## 6. Phase 2 — Core Modules (Week 2–3)

**Duration:** 8 days | **Parallel**

---

### Dev-A: Products API + Warehouse API + OTP Reset

**Branch:** `feature/backend/products-warehouse`  
**Workflows:** `/generate` → `/tribunal-backend` (all endpoints) → `/test` → `/api-tester`

#### Day 1–3: Products Module

```
☐ GET /products (paginated, filterable: category, status)
☐ GET /products/:id (with stock per location from stock_balances)
☐ GET /products/search?sku=XXX
☐ POST /products (validate SKU format, check uniqueness)
☐ PUT /products/:id
☐ DELETE /products/:id (soft delete: is_deleted = true)
☐ Product repository layer: all DB queries parameterized
☐ Product service layer: business rules, SKU validation
☐ Unit tests: product service (create, update, SKU validation, soft delete)
☐ Integration tests: all 6 product endpoints
```

#### Day 4–5: Warehouse & Location Module

```
☐ GET /warehouses
☐ POST /warehouses
☐ GET /warehouses/:id
☐ GET /warehouses/:id/locations
☐ POST /warehouses/:id/locations
☐ DELETE /warehouses/:id/locations/:locId (check: no stock at location)
☐ Warehouse service: prevent delete if stock exists at location
☐ Unit tests: location delete protection
☐ Integration tests: all warehouse/location endpoints
```

#### Day 6–7: OTP Password Reset

```
☐ POST /auth/forgot-password (generate OTP, hash, store in Redis TTL 15min)
☐ POST /auth/verify-otp (check hash, enforce 3-attempt limit)
☐ POST /auth/reset-password (verify OTP, update password_hash)
☐ Email service: send OTP via SendGrid (or log to console in dev)
☐ Unit tests: OTP generation, hash verify, expiry, attempt limit
☐ Integration tests: full OTP reset flow
```

#### Day 8: Dashboard KPIs endpoint

```
☐ GET /dashboard/kpis?warehouse_id=
☐ KPI aggregation queries: total stock, low stock, out of stock, pending ops by type
☐ Redis cache-aside: cache for 300 seconds
☐ GET /dashboard/low-stock (product list below minimum)
☐ GET /dashboard/recent-operations (last 20 operations)
☐ Unit tests: KPI aggregation logic
☐ PR → review
```

---

### Dev-B: Products Pages + Warehouse Pages + Dashboard

**Branch:** `feature/frontend/products-dashboard`  
**Workflows:** `/ui-ux-pro-max` (dashboard) → `/generate` (pages) → `/tribunal-frontend` (all components)

#### Day 1–3: Products Pages

```
☐ /products — product list page
    - DataTable: Name, SKU, Category, Unit, Stock (StockBadge), Min Stock
    - Filter bar: category dropdown, stock status filter (?filter=low_stock, ?filter=out_of_stock)
    - SKU/name search input with debounce (300ms)
    - "New Product" button → /products/new (manager only)
    - Stock badge click → navigates to /products/:id
☐ /products/new — create product page (not modal, full page)
☐ /products/:id — product detail page
    - Product info card
    - Stock per location table
    - "View Move History" → /history?product_id=:id
    - "New Receipt for this product" → /operations/new?type=receipt&product_id=:id
    - Edit button → /products/:id/edit (manager only)
☐ /products/:id/edit — edit product page
    - On save: redirect back to /products/:id
☐ Product API hooks: useProducts, useProduct, useCreateProduct, useUpdateProduct
```

#### Day 4–5: Dashboard Page

```
☐ /dashboard — central hub
    - 5 KPI cards: Total Stock, Low Stock, Out of Stock, Pending Receipts, Pending Deliveries
    - KPI cards are CLICKABLE and navigate:
        * Total Stock → /products
        * Low Stock → /products?filter=low_stock
        * Out of Stock → /products?filter=out_of_stock
        * Pending Receipts → /operations?type=receipt&status=waiting
        * Pending Deliveries → /operations?type=delivery&status=waiting
    - 4 quick-action buttons: [+New Receipt] [+New Delivery] [+New Transfer] [+Adjustment]
        Each navigates to /operations/new?type=X (not modal)
    - Recent Operations table (last 20): each row → /operations/:id
    - "View All Operations" link → /operations
    - Low-stock alert banner (amber): links to /products?filter=low_stock
    - Staggered fade-in animation on page load
☐ Dashboard API hooks: useDashboardKPIs, useLowStock, useRecentOperations
☐ KPI cards animate count from 0 to value on load
☐ Auto-refresh KPIs every 5 minutes (React Query stale time)
```

#### Day 6–7: Warehouse Settings Pages

```
☐ /settings/warehouses — warehouse list + create button
☐ /settings/warehouses/[id] — warehouse detail with locations list
☐ Create warehouse modal form
☐ Create location form within warehouse detail
☐ Delete location (with confirmation — "Are you sure? This cannot be undone if stock exists")
☐ Warehouse API hooks: useWarehouses, useWarehouse, useLocations
```

#### Day 8: Profile Page + Polish

```
☐ /profile — edit name, email, password
☐ Password change form with current + new + confirm fields
☐ Forgot password flow (request OTP page → enter OTP → set new password)
☐ Connect all forms to live backend endpoints
☐ Error handling: show API error messages inline on forms
☐ PR → review
```

---

### ⚓ Sync Point 2 (End of Week 3, Day 8)

```
Both merge Phase 2 PRs into dev.
Joint 30-minute call:
  ☐ Dev-B connects frontend to live backend for products + dashboard
  ☐ Confirm data displays correctly end-to-end
  ☐ Agree on shared/types.ts additions for operations module
  ☐ Dev-A shares updated Postman collection
  ☐ Both pull latest dev before Phase 3 branches
```

---

## 7. Phase 3 — Operations Engine (Week 3–4)

**Duration:** 8 days | **Parallel — most complex phase**

> This is the heart of the system. Dev-A builds the state machine and stock logic.  
> Dev-B builds the forms and operation detail pages.  
> They share no files — total parallel ownership.

---

### Dev-A: Operations API + Stock Ledger

**Branch:** `feature/backend/operations-engine`  
**Workflows:** `/generate` → `/tribunal-backend` (state machine) → `/tribunal-database` (validate transactions) → `/test`

#### Day 1–2: Operations Base + Receipts

```
☐ GET /operations (filter: type, status, warehouse_id, date range, page)
☐ GET /operations/:id (with lines + status)
☐ POST /operations (create: receipt, delivery, transfer, adjustment)
☐ PUT /operations/:id (edit: Draft/Waiting only)
☐ POST /operations/:id/submit (Draft → Waiting)
☐ POST /operations/:id/ready (Waiting → Ready)
☐ POST /operations/:id/cancel (manager only; Draft/Waiting/Ready → Canceled)
☐ Operation service: state machine enforcement (throw OPERATION_LOCKED etc.)
☐ Unit tests: state machine transitions (all valid + all invalid)
```

#### Day 3–4: Validate Endpoint (Critical — All Stock Logic)

```
☐ POST /operations/:id/validate (Receipt execution)
    - Check status = ready
    - BEGIN TRANSACTION
    - For each line:
        - UPSERT stock_balances (quantity + done_qty, version++)
        - INSERT stock_ledger (delta = +done_qty, balance_after)
    - UPDATE operations.status = done, validated_at = NOW()
    - COMMIT (or ROLLBACK on any error)
☐ Validate for Delivery:
    - Check stock_balances.quantity >= done_qty for each line at source_location
    - If insufficient: rollback, return INSUFFICIENT_STOCK with product details
    - Same transaction pattern as receipt but delta = -done_qty
☐ Validate for Transfer:
    - Source: -done_qty (transfer_out ledger entry)
    - Destination: +done_qty (transfer_in ledger entry)
    - Total unchanged — verify in tests
☐ Validate for Adjustment:
    - delta = done_qty - current_quantity (can be negative)
    - No negative stock check — adjustments can go to 0 but not below
```

#### Day 5–6: Stock Ledger API + Concurrency Tests

```
☐ GET /stock-ledger (filter: product_id, location_id, operation_type, date, page)
☐ Optimistic lock: catch 0-rows-updated on stock_balances → throw CONCURRENCY_CONFLICT
☐ Integration tests:
    - Receipt validation: stock increases correctly
    - Delivery validation: stock decreases correctly
    - Transfer: source decreases, destination increases, total unchanged
    - Insufficient stock: delivery blocked with correct error
    - Concurrent validation: second request gets CONCURRENCY_CONFLICT
    - Cancel: status changes, no stock impact
    - Ledger: entries created for all validated operations
    - Trigger test: direct UPDATE on stock_ledger → exception thrown
```

#### Day 7–8: Profile API + Final Tests

```
☐ GET /profile (return current user data)
☐ PUT /profile (update name, email, password)
☐ Low-stock alert: after any validation, check if product quantity ≤ minimum_stock
    → log WARN-level alert (email notification stubbed for v1.1)
☐ Nightly reconciliation script: scripts/reconcile.ts (runnable manually in v1.0)
☐ Full test run — all tests must pass
☐ PR → review
```

---

### Dev-B: Operations UI — Forms & Detail Pages

**Branch:** `feature/frontend/operations-ui`  
**Workflows:** `/ui-ux-pro-max` (create form) → `/generate` (pages) → `/tribunal-frontend` → `/test` (E2E)

#### Day 1–2: Operations List Page

```
☐ /operations — SINGLE unified list (not separate per type)
    - FilterBar: [Type ▾] [Status ▾] [Warehouse ▾] [Date range] [Search by ref #]
    - Type tabs or dropdown: All | Receipts | Deliveries | Transfers | Adjustments
    - URL reflects filters: /operations?type=receipt&status=waiting
    - DataTable: Ref #, Type badge, Status badge, Source/Dest, Products count, Date, Created by
    - Each row → /operations/:id
    - "+ New" button → /operations/new (type selector is first step of form)
☐ Operations API hook: useOperations({ type, status, warehouseId, from, to, ref, page })
```

#### Day 3–5: Operation Create Form + Detail Page

```
☐ /operations/new — SINGLE create form
    - Step 1: Type selector (if ?type not in URL) — 4 cards: Receipt / Delivery / Transfer / Adjustment
    - Step 2: Form (fields change by type — see feature_list.md type table)
        * Receipt: Destination location picker + Reference # + Notes + Product lines
        * Delivery: Source location picker + Reference # + Notes + Product lines
        * Transfer: Source + Destination pickers + Product lines
        * Adjustment: Source location + Product picker + Physical count input
          (System qty shown read-only, delta auto-calculated inline)
    - Product search: autocomplete (SKU or name), inline dropdown, no page navigation
    - On submit success: navigate to /operations/:id (Draft created)

☐ /operations/:id — SINGLE detail page (works for all types)
    - Header: Ref #, type label, status badge, source/dest, notes, created by
    - Product lines section:
        * Draft/Waiting: editable done_qty fields
        * Done/Canceled: read-only
    - Action buttons (contextual by status and role):
        → [Submit] (Draft→Waiting) — any user
        → [Mark Ready] (Waiting→Ready) — any user
        → [Validate] (Ready→Done) — amber primary CTA; triggers confirm dialog
        → [Cancel] (manager only) — danger CTA; requires confirm dialog
    - POST-VALIDATION (Done state only):
        → [View Move History →] navigates to /history?operation_id=:id
        → Each product row is clickable → /products/:id
    - Insufficient stock error: affected line highlighted red with available qty tooltip
    - Transfer: show both source (−) and destination (+) location clearly
    - Adjustment: show system qty, physical count, and delta (+/−) calculated live
```

#### Day 6: Operation Create Forms

```
☐ Create Receipt form/modal: reference number, destination location picker, notes
☐ Create Delivery form/modal: reference number, source location picker, notes
☐ Create Transfer form/modal: source location picker + destination location picker
☐ Create Adjustment form: product picker + location picker + physical count
☐ All forms: dynamic product line table with [+ Add Product] button
☐ ProductSearchInput: SKU or name autocomplete
☐ OperationLine row: product display, expected_qty input, remove button
☐ Pre-validation: disable Validate button if any required field is empty
```

#### Day 7–8: Move History Page + API Integration

```
☐ /history — Move History (stock ledger)
    - FilterBar: Product search, Operation type, Date range, Location
    - DataTable: Timestamp, User, Type, Product, Location, Delta (+/-), Balance After
    - Delta formatted: +50 kg (green) / -20 kg (red)
☐ Move history API hook: useStockLedger({ productId, type, from, to, page })
☐ Connect all operation forms to live backend
☐ Connect validation, submit, cancel actions to live backend
☐ Toast notifications: "Receipt validated successfully" / "Cancelled" / error toasts
☐ Loading states: button spinner during API calls, skeleton during page load
☐ PR → review
```

---

### ⚓ Sync Point 3 (End of Phase 3)

```
Both merge Phase 3 PRs into dev.
Joint 1-hour integration session:
  ☐ End-to-end test: full receipt flow in the browser
  ☐ End-to-end test: full delivery flow (including insufficient stock error)
  ☐ End-to-end test: internal transfer (verify total stock unchanged)
  ☐ End-to-end test: stock adjustment
  ☐ Confirm Move History shows all movements correctly
  ☐ Confirm Dashboard KPIs update after operations
  ☐ Fix any integration bugs together
```

---

## 8. Phase 4 — Advanced Features (Week 4–5)

**Duration:** 6 days | **Parallel**

---

### Dev-A: Security Hardening + Performance

**Branch:** `feature/backend/security-performance`  
**Workflows:** `/refactor` (Zod) → `/tribunal-backend` (security) → `/audit` → `/fix` → `/tribunal-performance`

```
☐ Add Zod schema validation on all POST/PUT endpoints (replace manual checks)
☐ Add request size limit: max 1MB body
☐ Enforce max 50 lines per operation (server-side)
☐ Add CSRF token support (if using cookies for web client)
☐ Security headers via helmet (CSP, HSTS, X-Frame-Options etc.)
☐ CORS: restrict to known origins (from env var)
☐ Account lockout: track failed login attempts (Redis counter) → lock after 5
☐ Add /auth/forgot-password + /auth/reset-password endpoints
☐ Optimistic lock retry logic: client-friendly CONCURRENCY_CONFLICT error
☐ KPI cache invalidation: after any operation.validate() → invalidate kpi:{warehouse_id}
☐ Add pg connection pool monitoring (log when > 80% used)
☐ Performance: add composite DB index for common operation queries
☐ Add reconciliation check endpoint: GET /admin/reconcile (manager only)
☐ Write security tests: SQL injection probes, auth bypass attempts
☐ npm audit — fix all high severity advisories
☐ PR → review
```

---

### Dev-B: Polish, Animations & Error States

**Branch:** `feature/frontend/polish-ux`  
**Workflows:** `/ui-ux-pro-max` (animations) → `/enhance` (error states) → `/tribunal-frontend` → `/tribunal-mobile`

```
☐ Implement staggered page load animations (opacity + translateY) on all main pages
☐ KPI card number counter animation (count from 0 to value, 800ms)
☐ Sidebar collapse/expand animation (width transition 250ms cubic-bezier)
☐ Modal open/close animation (scale 0.96→1 + opacity)
☐ Status badge color-change pulse on operation state change
☐ Low-stock card: amber glow pulse animation (2s loop)
☐ Add toast notification system (top-right, auto-dismiss 4s):
    success / error / warning / info variants
☐ Implement all empty states with contextual messages:
    "No receipts yet — create one to start receiving goods"
☐ Implement all error states:
    Network error (offline), Server error (500), Permission denied (403)
☐ Full keyboard navigation audit — tab order, focus trapping in modals
☐ Accessibility: aria-labels on all icon buttons, aria-live for KPI updates
☐ Mobile layout: bottom nav bar for < 768px (Dashboard, Products, Operations, History)
☐ Add Suspense boundaries and loading.tsx for all route segments
☐ Verify all color contrast ratios (WCAG AA minimum 4.5:1)
☐ PR → review
```

---

### ⚓ Sync Point 4 (End of Phase 4)

```
Both merge Phase 4 PRs into dev.
Joint 30-minute review:
  ☐ Full Lighthouse audit on frontend (target: > 85 performance)
  ☐ Run npm audit on backend (0 high severity)
  ☐ Manual RBAC test: login as staff, confirm manager actions are blocked
  ☐ Test low-stock alerts show correctly on dashboard
```

---

## 9. Phase 5 — Integration & Polish (Week 5–6)

**Duration:** 8 days | **Mostly parallel, converges at end**

---

### Dev-A: Final Backend Tasks

**Branch:** `feature/backend/final`  
**Workflows:** `/tribunal-performance` → `/test` → `/performance-benchmarker` → `/deploy`

```
Day 1–2:
☐ Write complete .env.example and environment documentation
☐ Finalize all database indexes (run EXPLAIN ANALYZE on critical queries)
☐ Add structured logging (Winston JSON logger) — all key events
☐ Verify stock_ledger immutability trigger in staging environment
☐ Performance test: k6 script targeting /dashboard/kpis, /products, /operations
☐ Target: p95 < 500ms under 50 concurrent users

Day 3–4:
☐ Complete integration test suite — every endpoint covered
☐ Complete unit test suite — service layer ≥ 80% coverage
☐ Fix any failing tests
☐ Add API health check improvements: report DB + Redis status

Day 5–6:
☐ Docker multi-stage build optimization (image size < 200MB)
☐ GitHub Actions CI fully working: lint + test + build all pass on PR
☐ Write backend setup guide: docs/BACKEND_SETUP.md
☐ Seed production-ready seed data script (warehouses, some products for demo)

Day 7–8:
☐ Pair with Dev-B on final integration issues
☐ PR → merge → tag v1.0.0-rc.1
```

---

### Dev-B: Final Frontend Tasks

**Branch:** `feature/frontend/final`  
**Workflows:** `/test` (Playwright) → `/performance-benchmarker` (Lighthouse + bundle) → `/review` (design check)

```
Day 1–2:
☐ Full end-to-end Playwright test suite:
    - Login flow
    - Full receipt flow (create → validate → verify stock)
    - Full delivery flow
    - Transfer (verify totals unchanged)
    - Low stock alert display
    - Password reset OTP flow
☐ Connect EVERY remaining mock to live backend endpoints
☐ Verify all API error codes are handled with proper UX messages

Day 3–4:
☐ Full responsive review: test at 1440px, 1024px, 768px, 375px
☐ Fix any layout issues at each breakpoint
☐ Test in Safari and Firefox (not just Chrome)
☐ Verify dark theme looks correct at all breakpoints

Day 5–6:
☐ Meta tags and SEO: title, description, og:* for each page
☐ Next.js production build: npm run build — 0 errors
☐ Bundle analysis: identify and split any chunks > 200KB
☐ Write frontend setup guide: docs/FRONTEND_SETUP.md

Day 7–8:
☐ Final design review — all pages match uiux.md spec
☐ Pair with Dev-A on final integration issues
☐ PR → merge → tag v1.0.0-rc.1
```

---

### ⚓ Final Sync Point (End of Phase 5)

```
Joint 2-hour session:
  ☐ Run complete E2E Playwright test suite — `/test`
  ☐ Run complete backend integration test suite — `/test`
  ☐ One full manual walkthrough of every user story (ACCEPTANCE TEST)
  ☐ All CI checks passing on dev
  ☐ Full project audit — `/audit`
  ☐ Full Tribunal on all code — `/tribunal-full`
  ☐ Both approve Release PR: dev → main
  ☐ Generate changelog — `/changelog`
  ☐ Tag release: v1.0.0
  ☐ Deploy to staging → verify → deploy to production — `/deploy`
```

---

## 10. Sync Points & Merge Gates

| # | When | Duration | Activity |
|---|---|---|---|
| **SP-0** | Day 1 (together) | 4–6 hours | Project setup pair session |
| **SP-1** | End of Week 1 | 30 min | Auth foundations demo + type alignment |
| **SP-2** | End of Week 3 | 30 min | Products + dashboard integration |
| **SP-3** | End of Phase 3 | 60 min | Operations engine full integration |
| **SP-4** | End of Phase 4 | 30 min | Security audit + Lighthouse |
| **SP-5** | End of Phase 5 | 2 hours | Final acceptance test + release |

### PR Review Rules

```
☐ Every PR reviewed by the other developer within 24 hours
☐ No PR merges to dev without review
☐ If reviewer is blocked (on their own critical path), leave review by EOD
☐ PR comments → author responds + resolves before merge
```

---

## 11. Environment & API Contracts

### API Base URL Convention

```
Development: http://localhost:3000/v1
Frontend env: NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

### Shared TypeScript Types (`shared/types.ts`)

```typescript
// Agreed at Phase 0 — do not edit without joint PR

export type UserRole = 'manager' | 'staff';

export type OperationType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';

export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_of_measure: string;
  minimum_stock: number;
  reorder_quantity: number;
  total_stock: number;
  stock_by_location: { location_id: string; location: string; quantity: number }[];
}

export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export interface Location {
  id: string;
  warehouse_id: string;
  name: string;
  description: string | null;
}

export interface Operation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  created_by: string;
  source_location_id: string | null;
  dest_location_id: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  validated_at: string | null;
  lines: OperationLine[];
}

export interface OperationLine {
  id: string;
  operation_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  expected_qty: number;
  done_qty: number | null;
}

export interface LedgerEntry {
  id: string;
  product_id: string;
  product_name: string;
  location_id: string;
  location_name: string;
  operation_id: string;
  user_id: string;
  user_name: string;
  delta: number;
  balance_after: number;
  operation_type: string;
  created_at: string;
}

export interface DashboardKPIs {
  total_products_in_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_receipts: number;
  pending_deliveries: number;
  scheduled_transfers: number;
  as_of: string;
}
```

### API Mock Strategy for Frontend

Before Dev-A completes an endpoint, Dev-B uses these patterns:

```typescript
// lib/mocks/products.ts
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Steel Rod',
    sku: 'STL-001',
    category: 'Raw Materials',
    unit_of_measure: 'kg',
    minimum_stock: 20,
    reorder_quantity: 100,
    total_stock: 150,
    stock_by_location: []
  }
];

// In hooks:
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: USE_MOCKS
      ? () => Promise.resolve({ data: MOCK_PRODUCTS })
      : () => api.get('/products')
  });
}
```

This way Dev-B never blocks on Dev-A and integration is a simple env var flip.

---

## 12. Done Conditions Per Phase

### Phase 0 ✅
- Both developers can run `docker-compose up` and see Postgres + Redis running
- Both developers can run `npm run dev` in their respective folders
- `dev` branch exists with initial structure pushed

### Phase 1 ✅
- Dev-A: `GET /health` returns 200 with DB + Redis connected
- Dev-A: Login endpoint returns JWT (verified in Postman)
- Dev-A: All 8 DB migrations run without errors
- Dev-B: Login page sends credentials and stores token
- Dev-B: Sidebar renders, routing works across all planned pages
- Dev-B: All base UI components render correctly

### Phase 2 ✅
- Dev-A: All product + warehouse + OTP endpoints return correct data
- Dev-A: Dashboard KPI endpoint returns correct cached aggregation
- Dev-B: Products page lists products with correct stock colors
- Dev-B: Dashboard renders real KPI data (or mocks matching type contract)
- Dev-B: Forgot password flow navigates correctly page by page

### Phase 3 ✅
- Dev-A: Full receipt validation transaction tested: stock balance increases, ledger entry created
- Dev-A: Full delivery validation tested: insufficient stock error returned correctly
- Dev-A: Transfer tested: source decreases, destination increases, total unchanged
- Dev-A: Concurrent validation: `CONCURRENCY_CONFLICT` returned correctly
- Dev-B: Full receipt form creates, submits, validates — visible in product stock
- Dev-B: Insufficient stock error shown as red highlighted line in delivery form
- Dev-B: Move history shows all ledger entries filtered correctly

### Phase 4 ✅
- Dev-A: `npm audit` shows 0 high severity vulnerabilities
- Dev-A: All RBAC rules enforced — Postman collection confirms staff gets 403 on manager routes
- Dev-B: Lighthouse score ≥ 85 performance, ≥ 90 accessibility
- Dev-B: App is usable in Safari, Firefox, Chrome

### Phase 5 ✅ (v1.0 Release Criteria)
- All user stories from `user_personas.md` manually verified ✅
- All Playwright E2E tests pass ✅
- All backend integration tests pass ✅
- Backend unit test coverage ≥ 80% on service layer ✅
- `npm run build` in frontend: 0 errors ✅
- Docker build succeeds and container starts healthy ✅
- GitHub Actions CI passes on main ✅
- Tag `v1.0.0` created ✅
- Deployed to staging and verified ✅
