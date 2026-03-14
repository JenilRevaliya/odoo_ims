# CoreInventory — Role-Based Access Control (RBAC)

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Roles

| Role | Description |
|---|---|
| `manager` | Full access to all features; can manage system configuration, perform adjustments, cancel operations |
| `staff` | Operational access; can create and validate receipts, deliveries, and transfers; cannot manage configuration or perform adjustments |

---

## Permission Matrix

### Authentication & Profile

| Permission | Manager | Staff |
|---|---|---|
| Sign up | ✅ | ✅ |
| Login | ✅ | ✅ |
| Logout | ✅ | ✅ |
| Reset own password | ✅ | ✅ |
| Edit own profile | ✅ | ✅ |
| View other users | ✅ | ❌ |
| Change other user's role | ✅ | ❌ |

### Dashboard

| Permission | Manager | Staff |
|---|---|---|
| View Dashboard KPIs | ✅ | ✅ |
| Apply Dashboard Filters | ✅ | ✅ |
| View Low Stock Alerts | ✅ | ✅ |

### Products

| Permission | Manager | Staff |
|---|---|---|
| View product list | ✅ | ✅ |
| View product detail | ✅ | ✅ |
| Search products by SKU | ✅ | ✅ |
| Create product | ✅ | ❌ |
| Edit product | ✅ | ❌ |
| Delete product (soft) | ✅ | ❌ |
| Set minimum stock | ✅ | ❌ |
| Set reorder quantity | ✅ | ❌ |

### Receipts

| Permission | Manager | Staff |
|---|---|---|
| View receipts list | ✅ | ✅ |
| View receipt detail | ✅ | ✅ |
| Create receipt | ✅ | ✅ |
| Edit receipt (Draft/Waiting) | ✅ | ✅ (own only) |
| Validate receipt | ✅ | ✅ |
| Cancel receipt | ✅ | ❌ |

### Delivery Orders

| Permission | Manager | Staff |
|---|---|---|
| View deliveries list | ✅ | ✅ |
| View delivery detail | ✅ | ✅ |
| Create delivery | ✅ | ✅ |
| Edit delivery (Draft/Waiting) | ✅ | ✅ (own only) |
| Validate delivery | ✅ | ✅ |
| Cancel delivery | ✅ | ❌ |

### Internal Transfers

| Permission | Manager | Staff |
|---|---|---|
| View transfers list | ✅ | ✅ |
| View transfer detail | ✅ | ✅ |
| Create transfer | ✅ | ✅ |
| Edit transfer (Draft/Waiting) | ✅ | ✅ (own only) |
| Validate transfer | ✅ | ✅ |
| Cancel transfer | ✅ | ❌ |

### Stock Adjustments

| Permission | Manager | Staff |
|---|---|---|
| View adjustments | ✅ | ✅ |
| Create and perform adjustments | ✅ | ❌ |

### Move History / Stock Ledger

| Permission | Manager | Staff |
|---|---|---|
| View move history | ✅ | ✅ |
| Filter move history | ✅ | ✅ |
| Export move history | ✅ | ❌ |

### Warehouses & Locations

| Permission | Manager | Staff |
|---|---|---|
| View warehouses | ✅ | ✅ |
| Create warehouse | ✅ | ❌ |
| Edit warehouse | ✅ | ❌ |
| Delete warehouse | ✅ | ❌ |
| View locations | ✅ | ✅ |
| Create location | ✅ | ❌ |
| Delete location | ✅ | ❌ |

---

## RBAC Implementation

Roles are stored on the `users.role` column.

Every protected route checks:
1. **Authentication** — valid JWT present
2. **Authorization** — `req.user.role` has the required permission

Example middleware chain:
```
Route: DELETE /products/:id
Middleware: requireAuth → requireRole('manager') → controller
```

Role is included in the JWT payload:
```json
{ "sub": "uuid", "role": "manager", "exp": 1710395700 }
```

> **IMPORTANT:** Role is also re-verified from the database for sensitive operations (like adjustments and cancellations) to prevent stale JWT role claims from bypassing RBAC.

---

## Future Role Expansion (v2.0)

| Role | Description |
|---|---|
| `viewer` | Read-only access to all data; no create/edit/validate |
| `auditor` | Full read access + move history export; no mutations |
| `admin` | Super-user; can manage all users and system configuration |
