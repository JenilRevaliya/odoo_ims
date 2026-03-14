# CoreInventory — Feature List

> **Version:** 1.1.0 | **Date:** 2026-03-14  
> Updated to align with confirmed wireframe page structure.

---

## v1.0 — Core Feature Set

### Authentication
- [x] Email + password login
- [x] JWT access token (15 min) + refresh token (7 days, httpOnly cookie)
- [x] OTP-based password reset via email
- [x] Logout (revoke refresh token)
- [x] User profile view and edit (name, email, password)

### Dashboard (Central Hub)
- [x] KPI cards (all 5 from problem statement):
    - Total Products in Stock
    - Low Stock Items
    - Out of Stock Items
    - Pending Receipts
    - Pending Deliveries
    - **Internal Transfers Scheduled** ← `scheduled_transfers` count
- [x] KPI cards are **clickable** → navigate to filtered product or operations list:
    - Total Stock → `/products`
    - Low Stock → `/products?filter=low_stock`
    - Out of Stock → `/products?filter=out_of_stock`
    - Pending Receipts → `/operations?type=receipt&status=waiting`
    - Pending Deliveries → `/operations?type=delivery&status=waiting`
    - Scheduled Transfers → `/operations?type=transfer&status=ready`
- [x] Dashboard dynamic filters (problem statement spec):
    - By document type: Receipts / Delivery / Internal / Adjustments
    - By status: Draft, Waiting, Ready, Done, Canceled
    - By warehouse or location
    - **By product category**
- [x] 4 quick-action buttons: New Receipt, New Delivery, New Transfer, Adjustment
    - Each navigates to `/operations/new?type=X`
- [x] Recent Operations table (last 20) — each row links to `/operations/:id`
- [x] "View All Operations" link → `/operations`
- [x] Low-stock alert banner (amber) — links to `/products?filter=low_stock`
- [x] Dashboard KPIs cached (Redis, 5 min TTL)

### Products
- [x] Products list — paginated, sortable, filterable (category, stock status)
- [x] Search by SKU or product name (debounced) — SKU smart search
- [x] Stock badge per product (in-stock / low / out) — color + text
- [x] Product detail page: info card + stock per location table
- [x] "View Move History" button on product detail → `/history?product_id=:id`
- [x] "New Receipt for this product" button → pre-fills receipt form
- [x] Create product form — manager only. Fields (per problem statement):
    - Name
    - SKU / Code
    - Category
    - Unit of Measure
    - Initial stock (optional — creates an adjustment ledger entry)
- [x] Edit product form — manager only
- [x] Soft delete product — manager only (hidden from lists, history preserved)
- [x] SKU uniqueness validation + format enforcement
- [x] **Product categories** — `category` field on products; filter-by-category on all list views
- [x] **Reordering rules** — `minimum_stock` threshold + `reorder_quantity` per product:
    - System alerts when `quantity ≤ minimum_stock`
    - `reorder_quantity` shown on product detail as the suggested replenishment amount
    - Low-stock alert banner links to affected product + pre-fills receipt with `reorder_quantity`
- [x] **Low stock alerts** — shown on dashboard banner + product list stock badge
- [x] **Multi-warehouse support** — stock tracked per product × location; filter by warehouse

### Operations — Unified Transaction Records
- [x] Single operations list (`/operations`) with type + status filter tabs
- [x] Quick filter: `/operations?type=receipt`, `?type=delivery`, `?type=transfer`, `?type=adjustment`
- [x] Additional filters: Warehouse/Location, Date range, Product category, Search by reference number
- [x] Operations list rows link to `/operations/:id`
- [x] Single create form (`/operations/new?type=X`) — fields change by type:
    - **Receipt** (Incoming Goods): destination location + **supplier reference** (free-text) + notes + product lines (expected qty)
    - **Delivery Order** (Outgoing Goods): source location + product lines (expected qty) + pick & pack notes
    - **Internal Transfer**: source + destination locations + product lines — logged in stock ledger per location
    - **Inventory Adjustment**: source location + product + physical count entered → delta auto-calculated, system auto-updates
- [x] Product autocomplete in form (SKU or name, inline dropdown, no navigation)
- [x] Operation detail page: show header + product lines + current status
- [x] Status transitions (all on same `/operations/:id` page):
    - Draft → Waiting (Submit)
    - Waiting → Ready (Mark Ready)
    - Ready → Done (Validate — commits stock)
    - Any → Canceled (manager only, with confirm dialog)
- [x] Post-validation state: read-only view with "View Move History" and product links
- [x] Insufficient stock: validation blocked, line highlighted with available qty shown
- [x] **Every movement logged** in Stock Ledger (receipt, delivery, transfer_out/in, adjustment)

### Move History (Stock Ledger)
- [x] Full move history table: timestamp, user, operation type, product, location, delta, balance after
- [x] Filter: product search, operation type, date range
- [x] URL-level filtering: `/history?product_id=:id`, `/history?operation_id=:id`
- [x] Row click → `/operations/:id`
- [x] Product name click → `/products/:id`
- [x] Delta displayed: `+50 kg` (green) / `−20 kg` (red), monospace
- [x] Paginated (50 rows default)

### Warehouses & Locations (Settings)
- [x] Warehouse list — manager only
- [x] Create warehouse
- [x] Warehouse detail + locations list
- [x] Add location to warehouse
- [x] Delete location (blocked if stock > 0 at location)

### RBAC
- [x] Two roles: `manager` and `staff`
- [x] Manager: full access including adjustments, cancellations, product management, warehouse management
- [x] Staff: create + validate receipts, deliveries, transfers only
- [x] Role enforced server-side on every request
- [x] UI: manager-only actions hidden or disabled with tooltip for staff

---

## Route Changes vs Previous Version

> **Breaking change from earlier docs:** Operations no longer have separate list pages per type.

| Old Route | New Route | Reason |
|---|---|---|
| `/operations/receipts` | `/operations?type=receipt` | Unified list |
| `/operations/deliveries` | `/operations?type=delivery` | Unified list |
| `/operations/transfers` | `/operations?type=transfer` | Unified list |
| `/operations/adjustments` | `/operations?type=adjustment` | Unified list |
| `/operations/receipts/new` | `/operations/new?type=receipt` | Single create form |
| `/operations/receipts/:id` | `/operations/:id` | Single detail page |

---

## v1.1 — Planned (Month 3)

- [ ] PDF export for any operation
- [ ] CSV export for move history
- [ ] Daily stock digest email
- [ ] Dashboard bar chart: stock movement volume (30 days)
- [ ] GDPR user data export
- [ ] "View All" for low-stock alerts (dedicated low-stock report page)
- [ ] Bulk product import (CSV upload)

## v1.2 — Planned (Month 4)

- [ ] Supplier master records
- [ ] Purchase orders linked to receipts
- [ ] Supplier on-time delivery tracking
- [ ] Auto-draft purchase order on low stock

## v2.0 — Planned

- [ ] Barcode / QR scanning on operation create form
- [ ] Progressive Web App (offline product lookup)
- [ ] Lot / batch number tracking
- [ ] Serial number tracking for high-value items
- [ ] Expanded roles: Viewer, Auditor
- [ ] Real-time stock push updates (WebSocket)
- [ ] Email notification on stock hitting reorder point

## v3.0 — Planned

- [ ] Demand forecasting
- [ ] Dead stock detection
- [ ] Multi-company / multi-tenant
- [ ] ERP sync (SAP, Tally, Odoo)
- [ ] Analytics service extraction (microservice)
