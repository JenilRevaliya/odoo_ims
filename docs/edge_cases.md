# CoreInventory — Edge Cases

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Authentication Edge Cases

| Edge Case | Behavior |
|---|---|
| User requests OTP but already has a valid, unexpired OTP | Old OTP invalidated; new OTP issued and sent |
| User attempts OTP verification after it expired | Returns `OTP_EXPIRED` error; user must request a new OTP |
| User enters wrong OTP 3 times | Token invalidated after 3rd attempt; must request new OTP |
| User signs up with an email that already exists | Returns `409 CONFLICT` — do not reveal whether email belongs to an account |
| User logs in on two devices simultaneously | Both sessions valid; logout on one device does not affect the other (independent refresh tokens) |
| Refresh token cookie missing on refresh request | Returns `401 REFRESH_TOKEN_INVALID` → redirect to login |
| Access token TTL very close to expiry during long form submission | Frontend pre-emptively refreshes if < 60 seconds remaining |

---

## Product Edge Cases

| Edge Case | Behavior |
|---|---|
| SKU submitted in lowercase | Rejected — SKU must match `^[A-Z]{2,5}-[0-9]{3,6}$` |
| Product with stock balance is soft-deleted | Product hidden from catalog; historical ledger entries preserved; stock balance remains but product unusable for new operations |
| Attempting to create operation line for deleted product | Returns `404 PRODUCT_DELETED` |
| Two products with same name (different SKU) | Allowed — name uniqueness is not enforced, only SKU |
| `minimum_stock` set to 0 | Low-stock alert never triggers for this product |
| `reorder_quantity` set to 0 | Reorder alert still fires but suggests quantity of 0 — product-level configuration gap, flagged in UI |

---

## Operation Edge Cases

| Edge Case | Behavior |
|---|---|
| Receipt validated with `done_qty = 0` for a line | Validation rejected: `done_qty must be > 0` |
| Delivery validated when stock drops to exactly 0 | Allowed — `balance_after = 0` is valid; out-of-stock alert fires |
| Two staff members validate the same operation simultaneously | Optimistic lock: second validation fails with `CONCURRENCY_CONFLICT`; client retries after refresh |
| Transfer between two locations in the same warehouse | Allowed — validated normally |
| Transfer where source and destination are identical | Rejected: `SAME_LOCATION_TRANSFER` |
| Operation with 50+ line items | Enforced max of 50 lines per operation — validation returns `MAX_LINES_EXCEEDED` |
| Canceling an operation that was already Done | Rejected: `OPERATION_LOCKED` |
| Editing an operation in Waiting status by the original creator | Allowed (edit own operations in Draft/Waiting) |
| Editing an operation in Waiting status by a different staff | Returns `403 FORBIDDEN` — only creator or manager can edit |

---

## Stock & Ledger Edge Cases

| Edge Case | Behavior |
|---|---|
| Adjustment results in negative stock | Service layer blocks: adjustment would make `balance_after < 0`; returns validation error |
| Nightly reconciliation finds discrepancy | Engineering P2 alert fired; discrepancy logged; manual review required |
| Ledger entry INSERT fails mid-transaction (DB error) | Full transaction rollback — stock_balances and operation status revert to pre-validation state |
| Stock balance row does not exist for product+location (first receipt) | Service creates new `stock_balances` row with `quantity = done_qty` |
| Product transferred to a location it has no existing balance row | New `stock_balances` row created for destination location |
| Very large stock quantity (> 2 billion) | PostgreSQL INTEGER max is 2,147,483,647 — BIGINT should be used for high-volume applications |

---

## Concurrency Edge Cases

| Edge Case | Behavior |
|---|---|
| Two deliveries for same product validated simultaneously | Optimistic lock catches version mismatch; second fails with `CONCURRENCY_CONFLICT` → client prompts user to retry |
| Multiple staff creating operations simultaneously | No conflict — operations are independent until validation |
| Dashboard KPI cache invalidated while another request reads it | Read returns stale cache until next request triggers DB recompute — acceptable (5 min max staleness) |

---

## Warehouse & Location Edge Cases

| Edge Case | Behavior |
|---|---|
| Deleting a location that has stock | Rejected — location cannot be deleted while stock_balances has quantity > 0 at that location |
| Deleting a warehouse that has active locations | Rejected — must remove all locations first |
| All warehouses filtered out on dashboard | Dashboard shows 0 for all KPIs with a "No warehouses match filter" message |
| Location created without a parent warehouse | Rejected at API validation level — `warehouse_id` is required |

---

## Data Anomaly Edge Cases

| Edge Case | Behavior |
|---|---|
| SKU search returns no results | Empty state shown — "No products found for SKU: XYZ-999" |
| Move history query with very wide date range (5+ years) | Paginated response — max 100 results per page; warn if > 10,000 results |
| Product with zero minimum_stock — low stock alert never fires | By design; if manager wants alerts they must configure minimum_stock |
| User profile email change conflicts with another user's email | `409 CONFLICT` — email already registered |
