# CoreInventory — Data Validation Rules

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Validation Layers

Validation is enforced at **three layers**:

1. **Frontend** — immediate inline feedback for UX
2. **API / Controller** — all inputs re-validated server-side (never trust client)
3. **Database** — constraints as the final safety net

---

## User Validation

| Field | Rule | Error Message |
|---|---|---|
| `name` | Required, 2–100 characters | "Name must be between 2 and 100 characters" |
| `email` | Required, valid email format, unique | "A valid unique email address is required" |
| `password` | Required, min 8 characters, at least 1 number and 1 letter | "Password must be at least 8 characters with a number and letter" |
| `role` | Must be one of: `manager`, `staff` | "Invalid role specified" |

---

## Product Validation

| Field | Rule | Error Message |
|---|---|---|
| `name` | Required, 2–200 characters | "Product name is required (2–200 chars)" |
| `sku` | Required, unique, matches `^[A-Z]{2,5}-[0-9]{3,6}$` | "SKU must match format: XX-000 (e.g. STL-001)" |
| `category` | Required, non-empty string | "Category is required" |
| `unit_of_measure` | Required, one of: `pcs`, `kg`, `ltr`, `box`, `m`, `g` | "Invalid unit of measure" |
| `minimum_stock` | Integer ≥ 0 | "Minimum stock must be 0 or greater" |
| `reorder_quantity` | Integer ≥ 0 | "Reorder quantity must be 0 or greater" |

---

## Warehouse & Location Validation

| Field | Rule | Error Message |
|---|---|---|
| `warehouse.name` | Required, 2–200 characters, unique | "Warehouse name is required and must be unique" |
| `location.name` | Required, unique within the warehouse | "Location name must be unique within its warehouse" |
| `location.warehouse_id` | Must reference an existing warehouse | "Invalid warehouse reference" |

---

## Operation Validation

| Field | Rule | Error Message |
|---|---|---|
| `type` | Must be: `receipt`, `delivery`, `transfer`, `adjustment` | "Invalid operation type" |
| `dest_location_id` | Required for receipts and transfers | "Destination location is required" |
| `source_location_id` | Required for deliveries and transfers | "Source location is required" |
| Transfer source ≠ destination | `source_location_id != dest_location_id` | "Source and destination must be different locations" |
| `reference_number` | Optional but unique if provided | "Reference number must be unique" |

---

## Operation Line Validation

| Field | Rule | Error Message |
|---|---|---|
| `product_id` | Must reference an existing, non-deleted product | "Product not found or has been deleted" |
| `expected_qty` | Integer > 0 | "Expected quantity must be greater than zero" |
| `done_qty` | Integer ≥ 0, set only on validation | "Done quantity cannot be negative" |
| No duplicate products | Same product cannot appear twice in one operation | "Duplicate product in operation lines" |

---

## Validation at Operation Validate Action

| Check | Rule | Error |
|---|---|---|
| Status gate | Operation must be in `ready` status | `OPERATION_NOT_READY` |
| Stock availability (delivery) | `stock_balances.quantity >= done_qty` for each product at source | `INSUFFICIENT_STOCK` |
| Stock availability (transfer) | Same as delivery for source location | `INSUFFICIENT_STOCK` |
| Adjustment delta | `done_qty` is the physical count; system computes delta; delta can be negative | N/A |
| Concurrent lock | `stock_balances.version` must match expected (optimistic lock) | `CONCURRENCY_CONFLICT` — retry |

---

## OTP Validation

| Rule | Detail |
|---|---|
| OTP format | 6-digit numeric string |
| Expiry | Must be used within 15 minutes of issuance |
| Single use | `used` flag set to `true` on first successful use |
| Attempt limit | Maximum 3 OTP verification attempts; 4th attempt invalidates the token |

---

## Stock Ledger Rules

| Rule | Enforcement |
|---|---|
| `delta != 0` | Checked at service layer before insert |
| `balance_after >= 0` for non-adjustments | Service layer validation before committing |
| No UPDATE or DELETE | PostgreSQL trigger raises EXCEPTION |
| Every validation creates at least one ledger row | Enforced in service; no validation completes without ledger insert |
