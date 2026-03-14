# CoreInventory — Dev-B Frontend Implementation Plan (Remaining Work)

> **Version:** 1.0.0 | **Date:** 2026-03-14  
> **Developer:** Dev-B (Frontend)  
> **Branch:** `feature/frontend/foundation` → future branches per phase  
> **Protocols:** `/ui-ux-pro-max` · `/tribunal-frontend` · `/generate`  
> **Backend API:** Live at `http://localhost:3000` (Dev-A's work on `feature/backend/foundation`)

---

## Gap Analysis — What Exists vs What's Required

### ✅ Already Built (Phase 1 Foundation)

| Component | File | Status |
|---|---|---|
| Root Layout + Google Fonts | `app/layout.tsx` | ✅ DM Mono, IBM Plex Sans/Mono |
| OKLCH Design System | `app/globals.css` | ✅ Full token system |
| Login Page | `app/(auth)/login/page.tsx` | ✅ Centered card, amber CTA |
| Signup Page | `app/(auth)/signup/page.tsx` | ✅ |
| Forgot Password | `app/(auth)/forgot-password/page.tsx` | ✅ |
| Reset Password | `app/(auth)/reset-password/page.tsx` | ✅ |
| Sidebar (collapsible) | `components/layout/Sidebar.tsx` | ✅ 240px↔60px |
| Bottom Nav (mobile) | `components/layout/BottomNav.tsx` | ✅ 4 tabs, no hamburger |
| Auth Guard | `components/layout/AuthGuard.tsx` | ✅ Token check redirect |
| Zustand Auth Store | `store/auth.ts` | ✅ In-memory token |
| Axios API Client | `lib/api.ts` | ✅ Interceptors + 401 refresh |
| React Query Provider | `providers/index.tsx` | ✅ 5 min stale time |
| Dashboard (placeholder) | `app/(dashboard)/dashboard/page.tsx` | ⚠️ Mock KPI cards only |
| Products (placeholder) | `app/(dashboard)/products/page.tsx` | ⚠️ Mock data, no API hooks |
| Operations (placeholder) | `app/(dashboard)/operations/page.tsx` | ⚠️ Mock data |
| History (placeholder) | `app/(dashboard)/history/page.tsx` | ⚠️ Mock data |
| Settings (placeholder) | `app/(dashboard)/settings/page.tsx` | ⚠️ Mock data |
| StatusBadge | `components/ui/StatusBadge.tsx` | ✅ |
| DataTable | `components/ui/DataTable.tsx` | ✅ Generic typed table |
| AlertBanner | `components/ui/AlertBanner.tsx` | ✅ |
| EmptyState | `components/ui/EmptyState.tsx` | ✅ |

### ❌ Not Yet Built (Critical Gaps)

| Category | Missing Item | Priority |
|---|---|---|
| **Types** | `shared/types.ts` (contract interfaces) | 🔴 P0 |
| **API Hooks** | `useProducts`, `useProduct`, `useCreateProduct`, `useUpdateProduct` | 🔴 P0 |
| **API Hooks** | `useDashboardKPIs`, `useLowStock`, `useRecentOperations` | 🔴 P0 |
| **API Hooks** | `useOperations`, `useOperation`, `useCreateOperation` | 🔴 P0 |
| **API Hooks** | `useStockLedger` | 🔴 P0 |
| **API Hooks** | `useWarehouses`, `useWarehouse`, `useLocations` | 🟡 P1 |
| **API Hooks** | `useProfile`, `useUpdateProfile` | 🟡 P1 |
| **Mock Data** | `lib/mocks/` (products, operations, dashboard) | 🔴 P0 |
| **Auth** | Live login API integration (currently just `router.push`) | 🔴 P0 |
| **Auth** | Live signup API integration | 🔴 P0 |
| **Auth** | Live forgot/reset password API integration | 🟡 P1 |
| **Pages** | `/products/new` (create product form) | 🔴 P0 |
| **Pages** | `/products/:id` (product detail + stock per location) | 🔴 P0 |
| **Pages** | `/products/:id/edit` (edit product form) | 🔴 P0 |
| **Pages** | `/operations/new` (type-driven create form) | 🔴 P0 |
| **Pages** | `/operations/:id` (detail + status transitions) | 🔴 P0 |
| **Pages** | `/settings/warehouses/:id` (warehouse detail) | 🟡 P1 |
| **Pages** | `/profile` (edit name, email, password) | 🟡 P1 |
| **Components** | `KPICard` (clickable, animated counter, status variants) | 🔴 P0 |
| **Components** | `FilterBar` (responsive desktop/tablet/mobile) | 🔴 P0 |
| **Components** | `Toast` notification system | 🔴 P0 |
| **Components** | `ConfirmDialog` (destructive action modal) | 🔴 P0 |
| **Components** | `LoadingSkeleton` (KPI, table row, card variants) | 🟡 P1 |
| **Components** | `StockBadge` (inline, colored, icon+text) | 🟡 P1 |
| **Components** | `ProductSearchInput` (autocomplete dropdown) | 🔴 P0 |
| **Components** | `Breadcrumb` (desktop/tablet, context-aware) | 🟡 P1 |
| **Components** | `Modal` (radix-based, focus trap, keyboard) | 🔴 P0 |
| **Components** | `BottomSheet` (mobile filter panel) | 🟡 P1 |
| **Features** | KPI counter animation (0 → value, 600ms) | 🟡 P1 |
| **Features** | Page enter staggered animation | 🟡 P1 |
| **Features** | Responsive DataTable → Card list on mobile | 🟡 P1 |
| **Features** | Dashboard header dynamic title per page | 🟡 P1 |
| **Testing** | Playwright E2E test suite | 🟡 P1 |
| **SEO** | Per-page title/meta tags | 🟢 P2 |
| **A11y** | Full ARIA audit, focus trapping, keyboard nav | 🟡 P1 |

---

## Phase A — Shared Infrastructure & Live Auth (1 day)

**Branch:** `feature/frontend/foundation` (continue)  
**Workflow:** `/generate` → `/tribunal-frontend`

### A.1 — Shared Types Contract

Create `frontend/src/types/index.ts` mirroring `shared/types.ts`:

```
☐ Copy all interfaces from IMPLEMENTATION_PLAN Section 11 verbatim:
    User, Product, Warehouse, Location, Operation, OperationLine,
    LedgerEntry, DashboardKPIs, ApiResponse<T>
☐ Export type aliases: UserRole, OperationType, OperationStatus
☐ Export all types from a barrel file
```

### A.2 — Mock Data Layer

Create `frontend/src/lib/mocks/`:

```
☐ products.ts    — 5 realistic products with stock_by_location
☐ operations.ts  — 6 operations (1 each status × 2 types)
☐ dashboard.ts   — DashboardKPIs mock + low-stock list + recent ops list
☐ warehouses.ts  — 2 warehouses with 3+ locations each
☐ ledger.ts      — 10 stock ledger entries across products/dates

☐ Environment flag: NEXT_PUBLIC_USE_MOCKS=true in .env.local
```

### A.3 — API Hooks Layer

Create `frontend/src/hooks/`:

```
☐ useAuth.ts      — login, signup, logout, forgotPassword, resetPassword mutations
☐ useProducts.ts  — useProducts(filters), useProduct(id), useCreateProduct, useUpdateProduct
☐ useOperations.ts — useOperations(filters), useOperation(id), useCreateOperation,
                     useSubmit, useMarkReady, useValidate, useCancel
☐ useDashboard.ts — useDashboardKPIs(warehouseId), useLowStock, useRecentOperations
☐ useWarehouses.ts — useWarehouses, useWarehouse(id), useLocations(id),
                     useCreateWarehouse, useCreateLocation, useDeleteLocation
☐ useStockLedger.ts — useStockLedger(filters)
☐ useProfile.ts   — useProfile, useUpdateProfile

All hooks MUST:
  - Use React Query (useQuery / useMutation)
  - Support mock fallback via NEXT_PUBLIC_USE_MOCKS env variable
  - Return typed data using shared interfaces
  - Handle error states with proper types
  - Invalidate related queries on mutation success
```

### A.4 — Live Auth Integration

```
☐ Refactor login/page.tsx:
    - Call useAuth().login mutation instead of router.push
    - Store token via useAuthStore.setAuth on success
    - Display API error messages inline on form
    - Loading state: disable button + show spinner
    - On success: redirect to /dashboard

☐ Refactor signup/page.tsx:
    - Call useAuth().signup mutation
    - On success: redirect to /login with success toast

☐ Refactor forgot-password/page.tsx:
    - Call useAuth().forgotPassword mutation
    - On success: auto-advance to /reset-password state

☐ Refactor reset-password/page.tsx:
    - Call useAuth().resetPassword mutation
    - On success: redirect to /login
```

> **Tribunal Gate:** `/tribunal-frontend` on all hooks before merge.  
> **Verdict required:** ✅ on all 4 reviewers (logic, security, frontend, type-safety).

---

## Phase B — Core UI Components (2 days)

**Branch:** `feature/frontend/components`  
**Workflow:** `/ui-ux-pro-max` → `/generate` → `/tribunal-frontend`

### B.1 — KPICard Component

```
☐ Props: { label, value, trend?, status, onClick, isLoading }
☐ Amber left-border (3px) — per uiux.md §6
☐ Value rendered in DM Mono --text-kpi
☐ Trend indicator: ↑ +N (green) or ↓ -N (red)
☐ Status variants: healthy (default), warning (amber bg-subtle), critical (red border)
☐ Loading: shimmer skeleton matching exact card dimensions
☐ Click handler → navigates to filtered list
☐ Counter animation: value counts from 0 → target over 600ms
☐ Responsive: 2-col on mobile, 4-col on desktop
☐ aria-label: "Total Stock: 1,250" for screen readers
```

### B.2 — FilterBar Component

```
☐ Desktop: [Type ▾] [Status ▾] [Warehouse ▾] [Date range] [🔍 Search]
☐ Tablet: [Type ▾] [Status ▾] [More ▾]
☐ Mobile: [🔍 full-width] [⊞ Filter] → opens BottomSheet
☐ Active filter → amber pill with ✕ to clear
☐ Sticky on scroll: position sticky, top: 0, z-index: 9
☐ onChange callback syncs with URL query params via useSearchParams
☐ Debounced search input (300ms)
```

### B.3 — Toast Notification System

```
☐ Zustand store: toastStore with add/remove/clear
☐ Toast container: top-right desktop, top-center mobile
☐ Variants: success (green), error (red), warning (amber), info (blue)
☐ Auto-dismiss: 4 seconds
☐ Max 3 visible, stack vertically
☐ Animate in: translateX(100%) → 0 (desktop), translateY(-100%) → 0 (mobile)
☐ Swipe to dismiss on mobile (touch event handler)
☐ Usage: toast.success("Receipt validated", { description: "REC-2026-001" })
```

### B.4 — ConfirmDialog Component

```
☐ Built on @radix-ui/react-dialog
☐ Props: { title, description, danger?, confirmLabel, cancelLabel, onConfirm }
☐ Destructive variant: danger CTA in --status-danger color
☐ Informational variant: amber primary CTA
☐ Keyboard: Escape closes, Enter confirms
☐ Focus trapped inside while open
☐ Backdrop: oklch(0% 0 0 / 0.65) with backdrop-filter: blur(4px)
☐ Animation: scale(0.96)→1 + opacity, 140ms --ease-spring
```

### B.5 — Modal Component

```
☐ Built on @radix-ui/react-dialog
☐ Sizes: small (400px), medium (560px), large (720px)
☐ Mobile: full-screen sheet (100vh, border-radius: 16px 16px 0 0)
☐ Header: title + subtitle + close button
☐ Body: scrollable overflow
☐ Footer: secondary left, primary CTA right
☐ Focus trapping + Escape to close
```

### B.6 — ProductSearchInput

```
☐ Autocomplete input: SKU or name search
☐ Debounced API call (300ms) to GET /products/search
☐ Dropdown: product name + SKU + current stock
☐ Selection: returns product_id, does NOT navigate away
☐ Keyboard: arrow keys nav, Enter selects, Escape closes
☐ Used in operation create form product line additions
```

### B.7 — LoadingSkeleton

```
☐ Variants: kpi-card, table-row (6 rows), product-card
☐ Shimmer animation: linear-gradient sweep, 1.4s ease infinite
☐ Conditional render: only show if data takes > 300ms (useDelayedLoading hook)
☐ Match exact dimensions of target component
```

### B.8 — Breadcrumb Component

```
☐ Context-aware: reads pathname + maps to breadcrumb label
☐ Per navigation_structure.md §Breadcrumb Map
☐ Desktop/tablet: visible
☐ Mobile: hidden (replace with ← Back arrow)
☐ Active segment: --text-primary; parents: --text-secondary with hover
☐ Separator: / character in --text-muted
```

### B.9 — StockBadge (inline)

```
☐ ● 150 kg → green (quantity > minimum_stock)
☐ ⚠ 3 kg  → amber (0 < quantity ≤ minimum_stock)
☐ ✕ 0     → red (quantity = 0)
☐ Always: icon + quantity + unit — never color alone
☐ aria-label: "Stock: 150 kilograms, healthy"
```

> **Pro-Max Audit:** Each component verified against `/ui-ux-pro-max` Step 6:
> - ✅ APCA contrast
> - ✅ Touch targets ≥ 48px
> - ✅ `prefers-reduced-motion` respected
> - ✅ Semantic HTML + ARIA

---

## Phase C — Dashboard & Products (Full Build) (2 days)

**Branch:** `feature/frontend/dashboard-products`  
**Workflow:** `/ui-ux-pro-max` (dashboard) → `/generate` → `/tribunal-frontend`

### C.1 — Dashboard Page (Complete Rebuild)

```
☐ Replace placeholder with production dashboard:

  SECTION 1 — KPI Cards Row (4-col desktop, 2-col mobile)
  ☐ Total Stock → onClick → /products
  ☐ Low Stock → onClick → /products?filter=low_stock
  ☐ Out of Stock → onClick → /products?filter=out_of_stock
  ☐ Pending Receipts → onClick → /operations?type=receipt&status=waiting
  ☐ Pending Deliveries → onClick → /operations?type=delivery&status=waiting
  ☐ Scheduled Transfers → onClick → /operations?type=transfer&status=ready
  ☐ Use useDashboardKPIs hook with 5-min staleTime
  ☐ Counter animation on initial load

  SECTION 2 — Low Stock Alert Banner
  ☐ Use useLowStock hook
  ☐ Show AlertBanner for each low-stock product
  ☐ "Review →" link → /products/:id
  ☐ Amber glow pulse animation (2s loop) per uiux.md

  SECTION 3 — Quick Action Buttons (4 buttons)
  ☐ [+ New Receipt] → /operations/new?type=receipt
  ☐ [+ New Delivery] → /operations/new?type=delivery
  ☐ [+ New Transfer] → /operations/new?type=transfer
  ☐ [+ Adjustment] → /operations/new?type=adjustment
  ☐ Each button has a unique icon and proper aria-label

  SECTION 4 — Recent Operations Table
  ☐ Use useRecentOperations hook (last 20)
  ☐ Columns: Ref#, Type, Status (badge), Lines count, Date
  ☐ Row click → /operations/:id
  ☐ "View All Operations →" link at bottom
  ☐ Desktop: DataTable; Mobile: OperationCard list

  SECTION 5 — Staggered Page Animation
  ☐ Each section fades in: opacity 0→1 + translateY 6px→0
  ☐ Stagger: 40ms per section, 160ms duration, --ease-out
  ☐ Respect prefers-reduced-motion

  SECTION 6 — Dynamic Header Title
  ☐ Layout header shows "Dashboard" + user greeting
  ☐ Auto-refresh KPIs every 5 minutes (React Query refetchInterval)
```

### C.2 — Products List Page (Full Rebuild)

```
☐ Replace mock with live data:
  ☐ useProducts hook with pagination + filters
  ☐ FilterBar: category dropdown, stock status (all/low/out), search
  ☐ URL synced: /products?category=raw&filter=low_stock&page=2
  ☐ DataTable columns: Name, SKU (mono), Category, Unit, Stock (StockBadge)
  ☐ Row click → /products/:id
  ☐ "+ New Product" button (hidden for staff role)
  ☐ EmptyState when no products match filter
  ☐ Pagination controls at bottom
  ☐ Mobile: card list instead of table
```

### C.3 — Product Detail Page (`/products/:id`)

```
☐ useProduct(id) hook
☐ Product info card: name, SKU, category, unit, min stock, reorder qty
☐ Stock per location table: location name, quantity (StockBadge)
☐ Action buttons:
    - "Edit" → /products/:id/edit (manager only)
    - "View Move History" → /history?product_id=:id
    - "New Receipt" → /operations/new?type=receipt&product_id=:id
☐ Breadcrumb: Products / [Product Name]
☐ Back arrow → /products
☐ Loading skeleton while data fetches
```

### C.4 — Product Create/Edit Forms

```
☐ /products/new — Create product form
    Fields: Name, SKU, Category (dropdown), Unit of Measure, Min Stock, Reorder Qty
    ☐ SKU format validation (client-side regex)
    ☐ useCreateProduct mutation
    ☐ On success: redirect to /products/:newId + success toast
    ☐ On error: show API error inline
    ☐ Manager-only route guard

☐ /products/:id/edit — Edit product form
    ☐ Pre-populate from useProduct(id)
    ☐ useUpdateProduct mutation
    ☐ On success: redirect to /products/:id + success toast
    ☐ Manager-only route guard
```

> **Tribunal Gate:** `/tribunal-frontend` on all pages.  
> **Security check:** Ensure no token leaks in SSR, no XSS via user input fields.

---

## Phase D — Operations Engine UI (3 days)

**Branch:** `feature/frontend/operations-ui`  
**Workflow:** `/ui-ux-pro-max` (create form) → `/generate` → `/tribunal-frontend`

> **This is the most complex frontend phase.** The operation create form changes
> fields based on type. The detail page changes actions based on status.

### D.1 — Operations List Page (Full Rebuild)

```
☐ useOperations hook with full filter support
☐ FilterBar: [Type ▾] [Status ▾] [Warehouse ▾] [Date range] [🔍 Search ref#]
☐ Type tabs: All | Receipts | Deliveries | Transfers | Adjustments
☐ URL synced: /operations?type=receipt&status=waiting&page=1
☐ DataTable: Ref#, Type badge, Status badge, Source/Dest, Lines, Date, User
☐ Row click → /operations/:id
☐ "+ New Operation" button → /operations/new
☐ Desktop: full table; Mobile: OperationCard list
☐ Loading: 6-row skeleton
☐ Empty state: "No operations found. Create one to get started."
```

### D.2 — Operation Create Form (`/operations/new`)

```
☐ Read ?type= from URL. If missing: show type selector first.

  TYPE SELECTOR (Step 1 — if no ?type):
  ☐ 4 large cards: Receipt / Delivery / Transfer / Adjustment
  ☐ Each card: icon + title + description
  ☐ Click → sets type, advances to form

  FORM (Step 2 — type-driven fields):
  Per navigation_structure.md §Operation Create Form:

  Receipt:
    ☐ Destination location picker (dropdown from useLocations)
    ☐ Reference # (optional text input)
    ☐ Notes (textarea)
    ☐ Product lines table: [ProductSearchInput] + [Expected Qty] + [Remove]
    ☐ [+ Add Product Line] button

  Delivery:
    ☐ Source location picker
    ☐ Reference # (optional)
    ☐ Notes
    ☐ Product lines with expected qty

  Transfer:
    ☐ Source location picker
    ☐ Destination location picker
    ☐ Product lines with expected qty

  Adjustment:
    ☐ Source location picker
    ☐ Product picker (single product)
    ☐ Physical count input (numeric)
    ☐ System quantity: read-only display (fetched from API)
    ☐ Delta: auto-calculated inline (physical - system), styled +green / -red

  COMMON FOR ALL:
  ☐ Pre-validation: disable Create if required fields empty
  ☐ useCreateOperation mutation
  ☐ On success: redirect to /operations/:newId + success toast
  ☐ On error: show inline error messages
  ☐ Loading: button spinner during API call
  ☐ If ?product_id= in URL: pre-fill first product line
```

### D.3 — Operation Detail Page (`/operations/:id`)

```
☐ useOperation(id) hook
☐ Header: Ref #, type label, StatusBadge, source/dest, notes, created by, date
☐ Breadcrumb: Operations / [Ref #]

  READ-WRITE STATE (Draft / Waiting):
  ☐ Product lines: editable done_qty fields
  ☐ [+ Add Line] button (Draft only)
  ☐ Remove line button (Draft only)

  ACTION BUTTONS (contextual per status + role):
  ☐ Draft:
      [Submit] (Draft → Waiting) — any user
  ☐ Waiting:
      [Mark Ready] (Waiting → Ready) — any user
      [Cancel] (Waiting → Canceled) — manager only, ConfirmDialog
  ☐ Ready:
      [▶ Validate] (Ready → Done) — amber primary CTA, ConfirmDialog
      [Cancel] — manager only, ConfirmDialog
  ☐ Done:
      Read-only view. All inputs disabled.
      [View Move History →] → /history?operation_id=:id
      Product rows clickable → /products/:id
  ☐ Canceled:
      Read-only. "This operation was canceled" banner.

  STATE TRANSITION MUTATIONS:
  ☐ useSubmitOperation(id)
  ☐ useMarkReady(id)
  ☐ useValidateOperation(id)
  ☐ useCancelOperation(id)
  ☐ Each shows toast on success/error
  ☐ Optimistic UI: update status badge immediately, rollback on error

  ERROR HANDLING:
  ☐ INSUFFICIENT_STOCK: affected line highlighted red, tooltip shows available qty
  ☐ CONCURRENCY_CONFLICT: toast "Data changed, please refresh"
  ☐ OPERATION_LOCKED: toast "Operation status has changed"

  TRANSFER LAYOUT:
  ☐ Show both source (−qty) and destination (+qty) clearly
  ☐ Two-column layout on desktop

  ADJUSTMENT LAYOUT:
  ☐ Show system qty, physical count, and delta per line
  ☐ Delta styled: positive green, negative red
```

### D.4 — Move History Page (Full Rebuild)

```
☐ useStockLedger hook with full filter support
☐ URL params: /history?product_id=:id, /history?operation_id=:id
☐ FilterBar: Product search, Operation type dropdown, Date range
☐ DataTable columns: Timestamp, User, Type, Product, Location, Delta, Balance After
☐ Delta: +50 kg (green mono) / −20 kg (red mono)
☐ Row click → /operations/:id
☐ Product name click → /products/:id
☐ Grouped by date (date header rows)
☐ Pagination: 50 rows per page
☐ Mobile: card list with delta prominently displayed
☐ Breadcrumb logic:
    - /history → "Move History"
    - /history?product_id=:id → "Products / [Name] / History"
    - /history?operation_id=:id → "History / [Ref #]"
```

> **Tribunal Gate:** `/tribunal-frontend` on every component.  
> Critical audit points:
> - ❌ Hooks rules violations in conditional rendering by status
> - ❌ Stale closures in debounced search
> - ❌ Missing dep arrays on useEffect
> - ❌ XSS via any user-controlled string rendered in JSX

---

## Phase E — Settings, Profile & Warehouse Management (1 day)

**Branch:** `feature/frontend/settings-profile`  
**Workflow:** `/generate` → `/tribunal-frontend`

### E.1 — Warehouse Settings (Full Rebuild)

```
☐ /settings/warehouses — Warehouse list
    ☐ useWarehouses hook
    ☐ DataTable: Name, Code, Locations count, Status
    ☐ "+ New Warehouse" button (manager only) → Modal form
    ☐ Row click → /settings/warehouses/:id

☐ /settings/warehouses/:id — Warehouse detail
    ☐ useWarehouse(id) + useLocations(id)
    ☐ Warehouse info card
    ☐ Locations table: Name, Description, Stock items count
    ☐ "+ Add Location" button → Modal form
    ☐ Delete location button → ConfirmDialog
        If stock > 0: show error "Cannot delete location with existing stock"
    ☐ Breadcrumb: Settings / Warehouses / [Name]
```

### E.2 — Profile Page (`/profile`)

```
☐ useProfile hook
☐ Display: name, email, role (read-only)
☐ Edit name form
☐ Edit email form 
☐ Change password form: current password + new password + confirm
    ☐ Client-side validation: new === confirm
    ☐ useUpdateProfile mutation
    ☐ Success toast: "Profile updated"
    ☐ Error: show inline
```

---

## Phase F — Polish, Animations & Accessibility (2 days)

**Branch:** `feature/frontend/polish-ux`  
**Workflow:** `/ui-ux-pro-max` (animations) → `/enhance` → `/tribunal-frontend` → `/tribunal-mobile`

### F.1 — Motion Design (per uiux.md §5)

```
☐ Page enter: opacity 0→1 + translateY 6px→0, 160ms, stagger 40ms
☐ KPI card counter: 0 → value, 600ms, easeOut
☐ Sidebar expand/collapse: width transition 220ms --ease-standard
☐ Modal open: scale(0.96)→1 + opacity, 140ms --ease-spring
☐ Modal close: scale(1)→0.96 + opacity, 100ms --ease-in
☐ Button press: scale(0.97) 80ms, spring back on release
☐ Status badge change: color cross-fade 200ms + brief scale(1.05)
☐ Low-stock glow: box-shadow pulse 0→12px amber, 2s loop
☐ Bottom nav tab: active icon scale 1→1.2, 200ms --ease-spring
☐ Table row hover: background 80ms linear (no transform!)
☐ Toast enter: slide in from right (desktop) / top (mobile)

ALL animations:
☐ Wrapped in @media (prefers-reduced-motion: reduce) → duration: 1ms
```

### F.2 — Responsive Audit (4 breakpoints)

```
☐ Mobile S (< 375px): bottom nav, single column, full-width cards
☐ Mobile L (375-767px): bottom nav, 16px gutter, card lists
☐ Tablet (768-1023px): icon rail sidebar, 2-col KPIs, compact FilterBar
☐ Desktop (1024-1279px): full sidebar, content max 800px
☐ Desktop L (≥ 1280px): full sidebar, content max 1024px

Per page verification:
☐ Dashboard: KPI grid adapts, operations become cards on mobile
☐ Products: table → cards on mobile, filter → bottom sheet
☐ Operations: table → cards, action buttons → sticky bottom
☐ History: table → cards, delta prominently visible
☐ Settings: sidebar nav stacks on mobile
```

### F.3 — Accessibility Audit (per uiux.md §11)

```
☐ Touch targets: all interactive elements ≥ 48×48px
☐ Focus rings: 2px solid var(--border-accent), outline-offset: 2px
☐ Keyboard navigation: full tab order on every page
☐ Escape closes all modals/sheets/dropdowns
☐ Arrow keys navigate DataTable rows
☐ aria-labels on all icon-only buttons
☐ aria-live="polite" on KPI value updates
☐ All inputs have associated <label> (not placeholder-only)
☐ Error messages linked via aria-describedby
☐ Semantic HTML: <nav>, <main>, <header>, <section>, <table>
☐ Skip link: "Skip to content" at page top
☐ Status badges: aria-label="Status: Done"
☐ Bottom nav: role="tablist" + role="tab" + aria-selected
☐ APCA contrast verified on all text pairs (per uiux.md §2)
```

### F.4 — Error & Empty States (per design_system.md)

```
☐ Network error (offline): full-page message with retry button
☐ Server error (500): "Something went wrong" with retry
☐ Permission denied (403): "You don't have access" with context
☐ Not found (404): custom 404 page with navigation back
☐ Empty states (per section):
    Products: "No products yet — create your first product"
    Operations: "No operations — create a receipt to get started"
    History: "No stock movements recorded yet"
    Warehouses: "No warehouses — set up your first warehouse"
☐ Form validation errors: inline below each field, --status-danger colored
```

### F.5 — Layout Header Dynamic Title

```
☐ Dashboard layout header shows context-aware title per page:
    /dashboard     → "Dashboard"
    /products      → "Products"
    /products/:id  → "Product: [Name]"
    /operations    → "Operations"
    /operations/:id → "[Ref #]"
    /history       → "Move History"
    /settings      → "Settings"
    /profile       → "Profile"
☐ Breadcrumb rendered in header on desktop/tablet
☐ Back arrow rendered on mobile instead
```

---

## Phase G — Testing & Pre-Release (2 days)

**Branch:** `feature/frontend/final`  
**Workflow:** `/test` (Playwright) → `/performance-benchmarker` → `/review`

### G.1 — Playwright E2E Tests

```
☐ Login flow: valid credentials → dashboard redirect
☐ Login flow: invalid credentials → error message shown
☐ Full receipt flow: create → submit → mark ready → validate → stock updated
☐ Full delivery flow: create → validate → insufficient stock error
☐ Transfer flow: verify totals unchanged
☐ Product CRUD: create → view → edit → verify changes
☐ Move history: filtered by product, correct deltas shown
☐ Password reset: request OTP → enter code → set new password
☐ RBAC: staff user cannot see "New Product" button

Install: npm install -D @playwright/test
Config: playwright.config.ts (baseURL: http://localhost:3001)
```

### G.2 — Cross-Browser Verification

```
☐ Chrome: full test suite pass
☐ Safari: visual check on all pages (OKLCH support verified)
☐ Firefox: visual check + functional test
☐ Mobile Safari (iOS): bottom nav + touch interactions
```

### G.3 — Performance

```
☐ Lighthouse audit targets:
    Performance: ≥ 85
    Accessibility: ≥ 90
    Best Practices: ≥ 90
    SEO: ≥ 80
☐ Bundle analysis: no chunk > 200KB
☐ npm run build: 0 errors, 0 warnings
☐ First Contentful Paint < 1.5s
☐ Largest Contentful Paint < 2.5s
☐ CLS: 0
```

### G.4 — Final Design Review

```
☐ Every page compared against uiux.md wireframes
☐ Color verification: no hardcoded hex values in components
☐ Typography: DM Mono for numbers, IBM Plex Sans for body
☐ No purple/violet anywhere
☐ No hamburger menu at any breakpoint
☐ No decorative glassmorphism
☐ No Inter font
☐ Status always shown as color + icon + text (never color alone)
```

### G.5 — SEO & Meta

```
☐ Per-page title tags:
    Login → "Sign In — CoreInventory"
    Dashboard → "Dashboard — CoreInventory"
    Products → "Products — CoreInventory"
    etc.
☐ Meta descriptions for each public page
☐ Single <h1> per page
☐ Semantic HTML verified
☐ favicon.ico updated (amber hexagon)
```

---

## Timeline Summary

| Phase | Duration | Branch | Key Deliverable |
|---|---|---|---|
| **A** | 1 day | `feature/frontend/foundation` | Types, mocks, hooks, live auth |
| **B** | 2 days | `feature/frontend/components` | 9 production UI components |
| **C** | 2 days | `feature/frontend/dashboard-products` | Dashboard + Products (full) |
| **D** | 3 days | `feature/frontend/operations-ui` | Operations engine (most complex) |
| **E** | 1 day | `feature/frontend/settings-profile` | Warehouses + Profile |
| **F** | 2 days | `feature/frontend/polish-ux` | Animations, a11y, responsive |
| **G** | 2 days | `feature/frontend/final` | E2E tests, perf, release |
| **TOTAL** | **~13 days** | | **v1.0 Frontend Complete** |

---

## Backend Integration Points (API Contract)

Every hook connects to a live backend endpoint on `NEXT_PUBLIC_API_URL`:

| Hook | Backend Endpoint | Dev-A Status |
|---|---|---|
| `useAuth.login` | `POST /auth/login` | ✅ Built |
| `useAuth.signup` | `POST /auth/signup` | ✅ Built |
| `useAuth.forgotPassword` | `POST /auth/forgot-password` | ✅ Built |
| `useAuth.resetPassword` | `POST /auth/reset-password` | ✅ Built |
| `useDashboardKPIs` | `GET /dashboard/kpis` | ✅ Built |
| `useLowStock` | `GET /dashboard/low-stock` | ✅ Built |
| `useRecentOperations` | `GET /dashboard/recent-operations` | ✅ Built |
| `useProducts` | `GET /products` | ✅ Built |
| `useProduct` | `GET /products/:id` | ✅ Built |
| `useCreateProduct` | `POST /products` | ✅ Built |
| `useUpdateProduct` | `PUT /products/:id` | ✅ Built |
| `useOperations` | `GET /operations` | ✅ Built |
| `useOperation` | `GET /operations/:id` | ✅ Built |
| `useCreateOperation` | `POST /operations` | ✅ Built |
| `useSubmit` | `POST /operations/:id/submit` | ✅ Built |
| `useMarkReady` | `POST /operations/:id/ready` | ✅ Built |
| `useValidate` | `POST /operations/:id/validate` | ✅ Built |
| `useCancel` | `POST /operations/:id/cancel` | ✅ Built |
| `useStockLedger` | `GET /stock-ledger` | ✅ Built |
| `useWarehouses` | `GET /warehouses` | ✅ Built |
| `useProfile` | `GET /profile` | ✅ Built |

> **Mock Fallback:** Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local` to work without backend.  
> **Live Integration:** Set `NEXT_PUBLIC_USE_MOCKS=false` + `NEXT_PUBLIC_API_URL=http://localhost:3000`.

---

## Pre-Merge Checklist (Every PR)

```
☐ npm run build — 0 errors
☐ /tribunal-frontend on all changed files
☐ No `any` types without explanation comment
☐ No console.log in production code
☐ All new components have loading + error states
☐ All forms validate before submit
☐ All mutations show toast on success/error
☐ Responsive verified at 375px, 768px, 1024px, 1440px
☐ No hardcoded hex colors (use CSS variables only)
☐ ARIA labels on all icon buttons
☐ Keyboard accessible (tab order verified)
```

---

## File Structure (Target End State)

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx          ← Full KPI + recent ops
│   │   ├── products/
│   │   │   ├── page.tsx                ← Product list
│   │   │   ├── new/page.tsx            ← Create product form
│   │   │   └── [id]/
│   │   │       ├── page.tsx            ← Product detail
│   │   │       └── edit/page.tsx       ← Edit product form
│   │   ├── operations/
│   │   │   ├── page.tsx                ← Operations list
│   │   │   ├── new/page.tsx            ← Create operation form
│   │   │   └── [id]/page.tsx           ← Operation detail
│   │   ├── history/page.tsx            ← Move history / stock ledger
│   │   ├── settings/
│   │   │   ├── page.tsx                ← Settings hub
│   │   │   └── warehouses/
│   │   │       ├── page.tsx            ← Warehouse list
│   │   │       └── [id]/page.tsx       ← Warehouse detail + locations
│   │   └── profile/page.tsx            ← User profile
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                        ← Redirect to /login or /dashboard
│   └── not-found.tsx                   ← Custom 404
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── AuthGuard.tsx
│   │   └── Breadcrumb.tsx
│   └── ui/
│       ├── AlertBanner.tsx
│       ├── ConfirmDialog.tsx
│       ├── DataTable.tsx
│       ├── EmptyState.tsx
│       ├── FilterBar.tsx
│       ├── KPICard.tsx
│       ├── LoadingSkeleton.tsx
│       ├── Modal.tsx
│       ├── ProductSearchInput.tsx
│       ├── StatusBadge.tsx
│       ├── StockBadge.tsx
│       └── Toast.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useDashboard.ts
│   ├── useDelayedLoading.ts
│   ├── useOperations.ts
│   ├── useProducts.ts
│   ├── useProfile.ts
│   ├── useStockLedger.ts
│   └── useWarehouses.ts
├── lib/
│   ├── api.ts
│   └── mocks/
│       ├── dashboard.ts
│       ├── ledger.ts
│       ├── operations.ts
│       ├── products.ts
│       └── warehouses.ts
├── providers/
│   └── index.tsx
├── store/
│   ├── auth.ts
│   └── toast.ts
└── types/
    └── index.ts
```
