# CoreInventory — API Endpoints

> **Version:** 1.0.0 | **Date:** 2026-03-14  
> Base URL: `https://api.coreinventory.io/v1`

---

## Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT |
| POST | `/auth/logout` | Yes | Revoke refresh token |
| POST | `/auth/forgot-password` | No | Send OTP to email |
| POST | `/auth/verify-otp` | No | Verify OTP (check only) |
| POST | `/auth/reset-password` | No | Set new password using OTP |
| POST | `/auth/refresh` | No (cookie) | Refresh access token |

### POST `/auth/signup`
```json
// Request
{
  "name": "Ravi Sharma",
  "email": "ravi@company.com",
  "password": "securePass123"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ravi Sharma",
    "email": "ravi@company.com",
    "role": "staff"
  }
}
```

### POST `/auth/login`
```json
// Request
{ "email": "ravi@company.com", "password": "securePass123" }

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "expires_in": 900,
    "user": { "id": "uuid", "name": "Ravi Sharma", "role": "manager" }
  }
}
```

### POST `/auth/reset-password`
```json
// Request
{
  "email": "ravi@company.com",
  "otp": "482910",
  "new_password": "newSecurePass456"
}

// Response 200
{ "success": true, "data": { "message": "Password reset successfully" } }
```

---

## Products Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/products` | Yes | Any | List all products (paginated) |
| GET | `/products/:id` | Yes | Any | Get product detail + stock per location |
| POST | `/products` | Yes | Manager | Create product |
| PUT | `/products/:id` | Yes | Manager | Update product |
| DELETE | `/products/:id` | Yes | Manager | Soft-delete product |
| GET | `/products/search?sku=STL-001` | Yes | Any | Search by SKU |

### GET `/products` Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Steel Rod",
      "sku": "STL-001",
      "category": "Raw Materials",
      "unit_of_measure": "kg",
      "minimum_stock": 20,
      "reorder_quantity": 100,
      "total_stock": 150,
      "stock_by_location": [
        { "location": "Warehouse A / Rack A", "quantity": 100 },
        { "location": "Production Floor", "quantity": 50 }
      ]
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 42 }
}
```

### POST `/products`
```json
// Request
{
  "name": "Steel Rod",
  "sku": "STL-001",
  "category": "Raw Materials",
  "unit_of_measure": "kg",
  "minimum_stock": 20,
  "reorder_quantity": 100
}
```

---

## Operations Endpoints

> **Note:** Operations use a **unified route** — no separate per-type sub-routes.
> The `type` query param filters the list. The create form uses `?type=X`.

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/operations` | Yes | Any | List all operations. Filter: `?type=receipt\|delivery\|transfer\|adjustment`, `?status=`, `?warehouse_id=`, `?from=`, `?to=`, `?ref=` |
| GET | `/operations?type=receipt` | Yes | Any | Receipts only |
| GET | `/operations?type=delivery` | Yes | Any | Deliveries only |
| GET | `/operations?type=transfer` | Yes | Any | Transfers only |
| GET | `/operations?type=adjustment` | Yes | Any | Adjustments only |
| GET | `/operations?status=waiting` | Yes | Any | All pending (any type) |
| GET | `/operations/:id` | Yes | Any | Get operation detail + lines |
| POST | `/operations` | Yes | Any | Create operation (body includes `type`) |
| PUT | `/operations/:id` | Yes | Creator | Update lines/notes (Draft/Waiting only) |
| POST | `/operations/:id/submit` | Yes | Creator | Draft → Waiting |
| POST | `/operations/:id/ready` | Yes | Creator | Waiting → Ready |
| POST | `/operations/:id/validate` | Yes | Any | Ready → Done — commits stock to ledger |
| POST | `/operations/:id/cancel` | Yes | Manager | Any → Canceled (with reason) |

### POST `/operations` — Create Receipt
```json
// Request
{
  "type": "receipt",
  "dest_location_id": "uuid-warehouse-a-rack-b",
  "reference_number": "REC-2026-001",
  "notes": "Delivery from Steel Co. Ltd",
  "lines": [
    { "product_id": "uuid-steel-rod", "expected_qty": 50 },
    { "product_id": "uuid-copper-wire", "expected_qty": 20 }
  ]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid-operation",
    "type": "receipt",
    "status": "draft",
    "reference_number": "REC-2026-001",
    "lines": [...]
  }
}
```

### POST `/operations/:id/validate`
```json
// No request body needed for receipt/transfer
// For delivery: optionally include done_qty overrides
{
  "lines": [
    { "id": "line-uuid", "done_qty": 48 }
  ]
}

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "done",
    "validated_at": "2026-03-14T09:00:00Z"
  }
}
```

### GET `/operations` Query Params
```
?type=receipt
?status=waiting
?warehouse_id=uuid
?from=2026-01-01
?to=2026-03-14
?page=1&per_page=20
```

---

## Warehouse Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/warehouses` | Yes | Any | List warehouses |
| POST | `/warehouses` | Yes | Manager | Create warehouse |
| GET | `/warehouses/:id` | Yes | Any | Get warehouse detail |
| GET | `/warehouses/:id/locations` | Yes | Any | List locations in warehouse |
| POST | `/warehouses/:id/locations` | Yes | Manager | Create location |
| DELETE | `/warehouses/:id/locations/:locId` | Yes | Manager | Remove location |

---

## Dashboard Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/kpis?warehouse_id=` | Yes | KPI summary: total_stock, low_stock, out_of_stock, pending_receipts, pending_deliveries (cached 5 min) |
| GET | `/dashboard/low-stock` | Yes | Products where `quantity ≤ minimum_stock` (for alert banner + KPI card click) |
| GET | `/dashboard/recent-operations` | Yes | Last 20 operations — used by Dashboard recent ops table |

### KPI Card Click → API mapping

| KPI Card | Clicked → Frontend routes to | Backend query equivalent |
|---|---|---|
| Total Stock | `/products` | `GET /products` (default) |
| Low Stock | `/products?filter=low_stock` | `GET /products?stock_status=low` |
| Out of Stock | `/products?filter=out_of_stock` | `GET /products?stock_status=zero` |
| Pending Receipts | `/operations?type=receipt&status=waiting` | `GET /operations?type=receipt&status=waiting` |
| Pending Deliveries | `/operations?type=delivery&status=waiting` | `GET /operations?type=delivery&status=waiting` |

### GET `/dashboard/kpis?warehouse_id=uuid` Response
```json
{
  "success": true,
  "data": {
    "total_products_in_stock": 1250,
    "low_stock_count": 8,
    "out_of_stock_count": 3,
    "pending_receipts": 4,
    "pending_deliveries": 7,
    "scheduled_transfers": 2,
    "as_of": "2026-03-14T09:00:00Z"
  }
}
```

---

## Stock Ledger Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stock-ledger` | Yes | Query move history |

### GET `/stock-ledger` Query Params
```
?product_id=uuid
?location_id=uuid
?operation_type=receipt
?from=2026-01-01
?to=2026-03-14
?page=1&per_page=50
```

---

## Profile Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update name, email, or password |
