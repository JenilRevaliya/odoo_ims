# CoreInventory — Challenges & Solutions

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Challenge 1 — Stock Integrity Under Concurrent Validation

### Problem
Multiple warehouse staff can simultaneously validate operations affecting the same product at the same location. Without coordination, two validations could read the same stock balance, both succeed, and leave the database in an incorrect state (e.g., negative stock).

### Solution: Optimistic Locking + Atomic Transactions

```
1. Each stock_balances row has a version column
2. Service reads current quantity AND version
3. UPDATE is conditioned on: WHERE product_id = ? AND location_id = ? AND version = ?
4. If version has changed (another write occurred), the UPDATE affects 0 rows
5. Service detects 0 rows affected → returns CONCURRENCY_CONFLICT
6. Client retries operation
```

**Tradeoff:** Occasional retries on write conflict. Acceptable because concurrent validation of identical products is rare. Avoided pessimistic locking which would serialize all stock reads.

---

## Challenge 2 — Immutable Audit Trail

### Problem
If the stock ledger can be modified or deleted, it becomes unreliable as an audit trail. Developers may accidentally write UPDATE statements during debugging. Bad actors could cover tracks.

### Solution: Defense in Depth

1. **PostgreSQL trigger:** `BEFORE UPDATE OR DELETE ON stock_ledger → RAISE EXCEPTION`
2. **DB user permissions:** Application database user has no `UPDATE` or `DELETE` on `stock_ledger`
3. **Code policy:** Repository layer has no `update()` or `delete()` methods for `stock_ledger`
4. **Nightly reconciliation:** Verifies `SUM(ledger.delta) = stock_balances.quantity` per product-location — any tampering detected within 24 hours

**Tradeoff:** Corrections cannot be "edited in place." A correction requires a new adjustment entry (a positive ledger event). This is intentional and matches real-world accounting principles (contra entries).

---

## Challenge 3 — Dashboard KPI Performance

### Problem
The dashboard shows aggregated statistics across all warehouses: total products in stock, low stock count, out-of-stock count, pending operations. These require GROUP BY and COUNT queries across multiple tables. Running this on every page load is expensive.

### Solution: Cache-Aside with Event-Based Invalidation

```
1. GET /dashboard/kpis checks Redis first
2. Cache HIT (TTL: 5 min) → return immediately (~1ms)
3. Cache MISS → query PostgreSQL aggregate queries → cache result → return
4. Any operation validation invalidates kpi:{warehouse_id} cache key
```

**Tradeoff:** Maximum 5-minute staleness on KPI counts. Acceptable for a dashboard that managers view periodically. Real-time requires WebSockets — out of scope for v1.0.

---

## Challenge 4 — Soft Delete vs. Hard Delete for Products

### Problem
Products are referenced in historical ledger entries, operation lines, and stock balances. Hard-deleting a product would cause FK violation errors or orphaned records — corrupting the audit trail.

### Solution: Soft Delete (`is_deleted`)

- Products are never physically removed
- `is_deleted = true` hides the product from all API list responses
- Historical records remain intact and queryable
- SKU is preserved — prevents future products from accidentally reusing it

**Tradeoff:** Database grows over time with deleted products. Acceptable; indexes prevent query slowdown. A cleanup job can archive deleted products after a retention period (e.g., 7 years).

---

## Challenge 5 — Multi-Location Stock Tracking

### Problem
A product can exist in multiple warehouses and locations simultaneously. A simple "total stock" field on the product table wouldn't capture where the stock is located — essential for picking and replenishment.

### Solution: `stock_balances` Table (product × location matrix)

```
stock_balances
  product_id | location_id | quantity
  steel-rod  | warehouse-a-rack-a | 50
  steel-rod  | warehouse-a-rack-b | 30
  steel-rod  | production-floor   | 20
```

Total stock = SUM(quantity) WHERE product_id = ?

**Tradeoff:** More complex queries. Every operation targets a specific location, not just a product. Managers must select source/destination locations when creating operations — adds UX friction but is essential for warehouse-level accuracy.

---

## Challenge 6 — OTP Security vs. User Experience

### Problem
A 4-digit OTP is easy to remember but vulnerable to brute force (only 10,000 combinations). A 32-character random token is secure but hard to type on a mobile device.

### Solution: 6-Digit OTP with bcrypt + Rate Limiting

- 6 digits = 1,000,000 combinations — substantially harder to brute force than 4-digit
- bcrypt hashing — even if Redis is compromised, OTP hashes are not reversible quickly
- 15-minute TTL — limits the window for any brute force attempt
- 3-attempt limit — token invalidated on 3 failures; attacker must request new OTP, triggering rate limit
- Combined: brute force success probability within 15 min window ≈ 0.0003% per attempt burst

**Tradeoff:** 6 digits is longer to type than 4. Acceptable UX cost for meaningful security improvement.

---

## Challenge 7 — Architecture Choice: Monolith vs. Microservices

### Problem
Building microservices from day one adds enormous operational overhead: service discovery, inter-service communication, distributed tracing, independent deployments, data consistency across services.

### Solution: Modular Monolith Built for Future Extraction

Design principles enforced from day one:
- Each domain module (Products, Operations, Warehouses, Ledger) has its own folder with routes, services, and repositories
- No direct cross-module DB joins (modules communicate via service methods, not raw queries)
- No shared mutable state between modules
- Clear API contracts between modules

This means modules can be extracted into microservices later by:
1. Moving the folder to a new service
2. Replacing direct service calls with API/message calls

**Tradeoff:** Slightly more upfront discipline required. No operational overhead at v1.0 scale.

---

## Architecture Decision Records (ADR) Index

| ADR | Decision | Status |
|---|---|---|
| ADR-001 | Use Modular Monolith over Microservices for v1.0 | Accepted |
| ADR-002 | Stock ledger is append-only; corrections via adjustments | Accepted |
| ADR-003 | Optimistic locking for concurrent stock validation | Accepted |
| ADR-004 | Soft delete for products to preserve FK integrity | Accepted |
| ADR-005 | Redis cache for KPIs with 5-minute TTL | Accepted |
| ADR-006 | JWT access token (15 min) + httpOnly refresh (7 days) | Accepted |
| ADR-007 | OTP 6-digit with bcrypt + 3-attempt limit | Accepted |
| ADR-008 | PostgreSQL over NoSQL for ACID stock integrity | Accepted |
