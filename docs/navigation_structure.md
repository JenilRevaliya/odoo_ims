# CoreInventory — Navigation Structure & Page Linking

> **Version:** 3.0.0 | **Date:** 2026-03-14  
> Derived from confirmed wireframe flow diagram.

---

## Route Map

```
/                              → Redirect → /dashboard (authed) or /login

── AUTH ──────────────────────────────────────────────────────────────
/login                         → Login page
/signup                        → Register
/forgot-password               → Request OTP
/reset-password                → New password entry

── DASHBOARD ─────────────────────────────────────────────────────────
/dashboard                     → Central hub: KPIs + 4 quick-action buttons
                                 + Recent Operations table

── PRODUCTS ──────────────────────────────────────────────────────────
/products                      → Products list (sortable, filterable)
/products/new                  → Add new product form (manager only)
/products/:id                  → Product detail panel (stock, SKU, history)
/products/:id/edit             → Edit product (manager only)

── OPERATIONS (shared list) ──────────────────────────────────────────
/operations                    → All operations: unified transaction records list
                                 (filterable by type: Receipt / Delivery /
                                  Transfer / Adjustment)

/operations/new                → Create operation (type selected on form)
/operations/:id                → Operation detail
/operations/:id/validate       → Confirm & validate → triggers stock update

── MOVE HISTORY ──────────────────────────────────────────────────────
/history                       → Stock ledger (move history)
/history?product_id=:id        → Move history filtered to single product

── SETTINGS ──────────────────────────────────────────────────────────
/settings/warehouses           → Warehouse list (manager only)
/settings/warehouses/new       → Create warehouse
/settings/warehouses/:id       → Warehouse + locations
/settings/warehouses/:id/locations/new  → Add location

── PROFILE ───────────────────────────────────────────────────────────
/profile                       → User info + password change
```

---

## Page-to-Page Link Map

This section documents **every link and navigation arrow** from the wireframe.

### Dashboard → outbound links

| From | To | Trigger |
|---|---|---|
| Dashboard KPI "Low Stock" card | `/products?filter=low_stock` | Click card |
| Dashboard KPI "Out of Stock" card | `/products?filter=out_of_stock` | Click card |
| Dashboard KPI "Pending Receipts" card | `/operations?type=receipt&status=waiting` | Click card |
| Dashboard KPI "Pending Deliveries" card | `/operations?type=delivery&status=waiting` | Click card |
| Dashboard — "New Receipt" button | `/operations/new?type=receipt` | Click |
| Dashboard — "New Delivery" button | `/operations/new?type=delivery` | Click |
| Dashboard — "New Transfer" button | `/operations/new?type=transfer` | Click |
| Dashboard — "Adjustment" button | `/operations/new?type=adjustment` | Click |
| Dashboard — Recent Operations row | `/operations/:id` | Click row |
| Dashboard — "View All" (recent ops) | `/operations` | Click |

### Products → links

| From | To | Trigger |
|---|---|---|
| `/products` list — row click | `/products/:id` | Click row |
| `/products` — "+ New Product" button | `/products/new` | Click (manager only) |
| `/products/:id` — "Edit" button | `/products/:id/edit` | Click (manager only) |
| `/products/:id` — "View Move History" | `/history?product_id=:id` | Click |
| `/products/:id` — "New Receipt for this product" | `/operations/new?type=receipt&product_id=:id` | Click |
| `/products` list — Stock badge click (low/out) | `/products/:id` | Click |
| `/products/new` — submit success | `/products/:id` (newly created) | On save |
| `/products/:id/edit` — submit success | `/products/:id` | On save |

### Operations (Transaction Records) → links

| From | To | Trigger |
|---|---|---|
| `/operations` list — row click | `/operations/:id` | Click row |
| `/operations` — "+ New Operation" | `/operations/new` | Click |
| `/operations/new` — type selector | stays on `/operations/new` (form changes) | Select |
| `/operations/new` — product search field | inline autocomplete (no nav) | Type |
| `/operations/new` — product line "detail icon" | `/products/:id` (new tab or modal) | Click |
| `/operations/new` — submit success | `/operations/:id` (newly created, Draft) | On save |
| `/operations/:id` — "Submit" (Draft→Waiting) | same page, status updates | Click |
| `/operations/:id` — "Mark Ready" (Waiting→Ready) | same page, status updates | Click |
| `/operations/:id` — "Validate" button | `/operations/:id` (status → Done) + stock updated | Click + confirm |
| `/operations/:id` — "Cancel" button | confirm dialog → same page (status → Canceled) | Click (manager) |
| `/operations/:id` — product row click | `/products/:id` | Click |
| `/operations/:id` (Done) — "View Stock Impact" | `/history?operation_id=:id` | Click |
| `/operations/:id` (Done) — "View Product" | `/products/:id` | Click |

### Move History → links

| From | To | Trigger |
|---|---|---|
| `/history` — row click | `/operations/:id` | Click row |
| `/history` — product name click | `/products/:id` | Click |
| `/history?product_id=:id` — breadcrumb | `/products/:id` | Click |

### Settings → links

| From | To | Trigger |
|---|---|---|
| `/settings/warehouses` list — row | `/settings/warehouses/:id` | Click |
| `/settings/warehouses` — "New" | `/settings/warehouses/new` | Click |
| `/settings/warehouses/:id` — "Add Location" | `/settings/warehouses/:id/locations/new` | Click |
| `/settings/warehouses/:id/locations/new` — save | `/settings/warehouses/:id` | On save |

### Auth & Profile → links

| From | To | Trigger |
|---|---|---|
| `/login` — success | `/dashboard` (or redirect target) | Submit |
| `/login` — "Forgot Password" | `/forgot-password` | Click |
| `/forgot-password` — OTP sent | `/reset-password` | Auto-advance |
| `/reset-password` — success | `/login` | On save |
| Profile avatar / nav | `/profile` | Click |
| `/profile` — save success | `/profile` (confirmation inline) | Submit |

---

## Central Hub: Dashboard Structure

The Dashboard is the **main hub** of the application. Every primary section is one click away from here.

```
                          ┌─────────────────────────────────────────┐
                          │              D A S H B O A R D           │
                          │                                          │
         ┌────────────────┤  [KPI: Total]  [KPI: Low] [KPI: Pend.R] [KPI: Pend.D]  ├────────────────┐
         │                │                                          │                │
         ↓                │  [+ New Receipt] [+ New Delivery]        │                ↓
   /products              │  [+ New Transfer] [+ Adjustment]         │          /operations
  (Products list)         │                                          │         (All operations)
                          │  RECENT OPERATIONS                        │
                          │  ─────────────────────                  │
                          │  REC-001  Receipt   ●Done    3 lines →  ├──→ /operations/:id
                          │  DEL-004  Delivery  ◷Waiting 2 lines →  │
                          │  [View All Operations →]                 │
                          └─────────────────────────────────────────┘
                                             │
                                             ↓
                                 via sidebar nav links
                              /history    /settings    /profile
```

---

## Page Hierarchy Tree

```
/ (root)
├── /login
│   ├── → /dashboard (on success)
│   └── → /forgot-password
│       └── → /reset-password
│           └── → /login
│
├── /dashboard ← central hub
│   ├── → /products
│   ├── → /operations
│   ├── → /operations/new?type=receipt
│   ├── → /operations/new?type=delivery
│   ├── → /operations/new?type=transfer
│   ├── → /operations/new?type=adjustment
│   └── → /operations/:id  (via Recent Operations rows)
│
├── /products
│   ├── → /products/new
│   │   └── → /products/:id  (on save)
│   └── → /products/:id
│       ├── → /products/:id/edit
│       │   └── → /products/:id  (on save)
│       ├── → /history?product_id=:id
│       └── → /operations/new?type=receipt&product_id=:id
│
├── /operations
│   ├── → /operations/new
│   │   └── → /operations/:id  (on save, status=Draft)
│   └── → /operations/:id
│       ├── → /products/:id  (product row click)
│       └── → /history?operation_id=:id  (after validation)
│
├── /history
│   ├── → /operations/:id  (row click)
│   └── → /products/:id   (product name click)
│
├── /settings/warehouses
│   └── → /settings/warehouses/:id
│       └── → /settings/warehouses/:id/locations/new
│           └── → /settings/warehouses/:id  (on save)
│
└── /profile
```

---

## Operation Create Form: Type-Driven Fields

The `/operations/new` page is a **single form** driven by the `type` query param. Fields shown change based on type:

| Field | Receipt | Delivery | Transfer | Adjustment |
|---|---|---|---|---|
| Destination location | ✅ required | ❌ | ✅ required | ❌ |
| Source location | ❌ | ✅ required | ✅ required | ✅ required |
| Reference number | ✅ optional | ✅ optional | ✅ optional | ❌ |
| Notes | ✅ | ✅ | ✅ | ✅ |
| Product lines (expected qty) | ✅ | ✅ | ✅ | ❌ |
| Physical count (done qty) | ❌ | ❌ | ❌ | ✅ |
| System quantity display | ❌ | ❌ | ❌ | ✅ (read-only) |
| Calculated delta | ❌ | ❌ | ❌ | ✅ (read-only) |

---

## Post-Validation State: Operation Detail Page

After clicking "Validate" and confirming, the `/operations/:id` page re-renders in **read-only Done state**:

```
┌─────────────────────────────────────────────────────────────┐
│ ← Operations   REC-2026-001                      [✓ Done]  │
│ ─────────────────────────────────────────────────────────  │
│  Destination   Warehouse A / Rack B                        │
│  Validated     2026-03-14 09:12  by Ravi Sharma            │
│  Reference     REC-2026-001                                │
│ ─────────────────────────────────────────────────────────  │
│  PRODUCT LINES (read-only)                                 │
│  Steel Rod   STL-001   Expected: 50   Done: 50   +50 kg    │
│  Copper Wire COP-002   Expected: 20   Done: 20   +20 kg    │
│ ─────────────────────────────────────────────────────────  │
│  [View Move History →]      [View Product: Steel Rod →]    │
└─────────────────────────────────────────────────────────────┘
```

Links visible **only after** validation:
- "View Move History →" → `/history?operation_id=:id`
- Each product row → `/products/:id`

---

## Unified Operations List: `/operations`

A single list replaces separate `/operations/receipts`, `/operations/deliveries` etc. routes.  
Filtered via the `type` query parameter.

```
/operations                        → All types
/operations?type=receipt           → Receipts only
/operations?type=delivery          → Deliveries only
/operations?type=transfer          → Transfers only
/operations?type=adjustment        → Adjustments only
/operations?status=waiting         → All pending
/operations?type=receipt&status=waiting   → Pending receipts
```

The FilterBar on `/operations` exposes: **Type** | **Status** | **Warehouse** | **Date range** | **Search by ref #**

---

## Breadcrumb & Back Navigation Map

| Current Page | Breadcrumb | Back Arrow Target |
|---|---|---|
| `/dashboard` | Dashboard | — |
| `/products` | Products | Dashboard |
| `/products/new` | Products / New Product | `/products` |
| `/products/:id` | Products / [Product Name] | `/products` |
| `/products/:id/edit` | Products / [Name] / Edit | `/products/:id` |
| `/operations` | Operations | Dashboard |
| `/operations/new` | Operations / New | `/operations` |
| `/operations/:id` | Operations / [Ref #] | `/operations` |
| `/history` | Move History | Dashboard |
| `/history?product_id=:id` | Products / [Name] / History | `/products/:id` |
| `/history?operation_id=:id` | History / [Ref #] | `/operations/:id` |
| `/settings/warehouses` | Settings / Warehouses | Dashboard |
| `/settings/warehouses/:id` | Settings / Warehouses / [Name] | `/settings/warehouses` |
| `/profile` | Profile | Dashboard |

---

## Navigation State Rules

| State | Rule |
|---|---|
| Unauthenticated → protected route | Redirect: `/login?redirect=/intended-path` |
| After login | Redirect to `redirect` param, else `/dashboard` |
| Staff → manager-only action | Button hidden or disabled with tooltip "Manager only" |
| Operation status `Done` | All edit inputs disabled; validate/cancel buttons hidden |
| Operation status `Canceled` | All edit inputs disabled; read-only label shown |
| KPI card click | Navigates to filtered list (not a modal) |
| Quick action button click | Navigates to `/operations/new?type=X` (not a modal) |
| Product autocomplete (in operation form) | Inline dropdown; selecting does not navigate away |
| Operation form save (Draft created) | Navigates to `/operations/:id` of the new operation |
