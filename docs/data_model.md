# CoreInventory — Data Model & Database Schema

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Data Model Overview

CoreInventory uses a **relational data model** in PostgreSQL.

The central concept is the **Stock Ledger** — an immutable, append-only log of every stock-affecting event. The `stock_balances` table is a materialized cache of ledger sums, kept consistent via transactions.

---

## Tables

---

### `users`

Stores all system users.

```
users
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
name            VARCHAR(100) NOT NULL
email           VARCHAR(255) UNIQUE, NOT NULL
password_hash   TEXT         NOT NULL  (bcrypt)
role            ENUM('manager','staff')  NOT NULL  DEFAULT 'staff'
created_at      TIMESTAMP    DEFAULT NOW()
updated_at      TIMESTAMP    DEFAULT NOW()
```

---

### `products`

Stores the product catalog.

```
products
─────────────────────────────────────────────────
id                UUID        PRIMARY KEY
name              VARCHAR(200) NOT NULL
sku               VARCHAR(100) UNIQUE, NOT NULL
category          VARCHAR(100) NOT NULL
unit_of_measure   VARCHAR(50)  NOT NULL  (e.g. kg, pcs, ltr, box)
minimum_stock     INTEGER      NOT NULL  DEFAULT 0
reorder_quantity  INTEGER      NOT NULL  DEFAULT 0
is_deleted        BOOLEAN      DEFAULT false  (soft delete)
created_at        TIMESTAMP    DEFAULT NOW()
updated_at        TIMESTAMP    DEFAULT NOW()
```

**SKU pattern:** `[A-Z]{2,5}-[0-9]{3,6}` (e.g. `STL-001`, `COP-0023`)

---

### `warehouses`

Stores warehouse records.

```
warehouses
─────────────────────────────────────────────────
id          UUID        PRIMARY KEY
name        VARCHAR(200) NOT NULL
address     TEXT         NULLABLE
created_at  TIMESTAMP    DEFAULT NOW()
```

---

### `locations`

Stores sub-locations within warehouses (racks, zones, sections).

```
locations
─────────────────────────────────────────────────
id            UUID        PRIMARY KEY
warehouse_id  UUID        FK → warehouses.id  NOT NULL
name          VARCHAR(100) NOT NULL  (e.g. "Rack A", "Zone B")
description   TEXT         NULLABLE
created_at    TIMESTAMP    DEFAULT NOW()
```

---

### `stock_balances`

Materialized cache of current stock per product per location.

```
stock_balances
─────────────────────────────────────────────────
id          UUID       PRIMARY KEY
product_id  UUID       FK → products.id   NOT NULL
location_id UUID       FK → locations.id  NOT NULL
quantity    INTEGER    NOT NULL  DEFAULT 0
version     INTEGER    NOT NULL  DEFAULT 0  (optimistic lock)
updated_at  TIMESTAMP  DEFAULT NOW()

UNIQUE (product_id, location_id)
CHECK (quantity >= 0)  -- except adjustments via service
```

---

### `operations`

The header record for every inventory operation.

```
operations
─────────────────────────────────────────────────
id                   UUID        PRIMARY KEY
type                 ENUM('receipt','delivery','transfer','adjustment')  NOT NULL
status               ENUM('draft','waiting','ready','done','canceled')   NOT NULL  DEFAULT 'draft'
created_by           UUID        FK → users.id  NOT NULL
source_location_id   UUID        FK → locations.id  NULLABLE  (used for delivery, transfer, adjustment)
dest_location_id     UUID        FK → locations.id  NULLABLE  (used for receipt, transfer)
reference_number     VARCHAR(100) UNIQUE  (auto-generated: REC-YYYY-NNN etc.)
supplier_ref         VARCHAR(200) NULLABLE  (free-text supplier name/PO ref — receipts only)
notes                TEXT         NULLABLE
created_at           TIMESTAMP    DEFAULT NOW()
updated_at           TIMESTAMP    DEFAULT NOW()
validated_at         TIMESTAMP    NULLABLE  (set when status → done)
validated_by         UUID         FK → users.id  NULLABLE
```

**Constraints:**
- `source != dest` for transfers (enforced at service layer)
- Cannot edit when `status IN ('done', 'canceled')`

---

### `operation_lines`

Individual product lines within an operation.

```
operation_lines
─────────────────────────────────────────────────
id            UUID     PRIMARY KEY
operation_id  UUID     FK → operations.id   NOT NULL
product_id    UUID     FK → products.id     NOT NULL
expected_qty  INTEGER  NOT NULL  CHECK (expected_qty > 0)
done_qty      INTEGER  NULLABLE  (set on validation)
```

---

### `stock_ledger`

**Immutable** append-only record of every stock change.

```
stock_ledger
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
product_id      UUID        FK → products.id    NOT NULL
location_id     UUID        FK → locations.id   NOT NULL
operation_id    UUID        FK → operations.id  NOT NULL
user_id         UUID        FK → users.id       NOT NULL
delta           INTEGER     NOT NULL  (positive = increase, negative = decrease)
balance_after   INTEGER     NOT NULL  (snapshot of stock_balances.quantity after change)
operation_type  VARCHAR(50) NOT NULL  (receipt|delivery|transfer_out|transfer_in|adjustment)
created_at      TIMESTAMP   DEFAULT NOW()
```

> **RULE:** No UPDATE or DELETE on this table — ever.  
> Enforced by: PostgreSQL trigger + application policy.

---

### `otp_tokens`

Stores OTP tokens for password reset.

```
otp_tokens
─────────────────────────────────────────────────
id          UUID      PRIMARY KEY
user_id     UUID      FK → users.id  NOT NULL
token_hash  TEXT      NOT NULL  (bcrypt hash of 6-digit OTP)
expires_at  TIMESTAMP NOT NULL  (NOW() + 15 minutes)
used        BOOLEAN   DEFAULT false
created_at  TIMESTAMP DEFAULT NOW()
```

**Rules:**
- Token is single-use: set `used = true` after verification
- Token expires automatically via `expires_at` check at service layer
- Old tokens cleaned up by a scheduled job

---

## Indexes

| Table | Index | Type | Purpose |
|---|---|---|---|
| `products` | `idx_products_sku` | UNIQUE | Fast SKU lookups |
| `products` | `idx_products_category` | BTREE | Filter by category |
| `stock_balances` | `idx_sb_product_location` | UNIQUE | Enforce uniqueness, fast stock lookups |
| `stock_balances` | `idx_sb_quantity` | BTREE | Find low-stock products |
| `operations` | `idx_ops_status` | BTREE | Filter by status |
| `operations` | `idx_ops_type` | BTREE | Filter by type |
| `operations` | `idx_ops_created_by` | BTREE | Operations by user |
| `stock_ledger` | `idx_ledger_product` | BTREE | History by product |
| `stock_ledger` | `idx_ledger_operation` | BTREE | History by operation |
| `stock_ledger` | `idx_ledger_created_at` | BTREE | Time-range queries |
| `otp_tokens` | `idx_otp_user_id` | BTREE | User OTP lookup |

---

## Data Consistency Strategy

1. **Atomic Validation Transaction**  
   When an operation is validated, the following steps happen inside a **single database transaction**:
   - `operations.status` → `done`
   - `operation_lines.done_qty` set
   - `stock_balances.quantity` updated (with optimistic lock check on `version`)
   - `stock_ledger` rows inserted (one per product line)
   - If any step fails → full rollback

2. **Optimistic Locking**  
   `stock_balances.version` is incremented on each update. Concurrent validation attempts with stale `version` values fail, preventing race conditions.

3. **Ledger Immutability**  
   A PostgreSQL trigger fires on `UPDATE` or `DELETE` on `stock_ledger` and raises an exception.

4. **Nightly Reconciliation Job**  
   A scheduled cron runs:
   ```sql
   SELECT product_id, location_id,
     SUM(delta) AS ledger_total,
     (SELECT quantity FROM stock_balances sb WHERE sb.product_id = sl.product_id AND sb.location_id = sl.location_id) AS balance
   FROM stock_ledger sl
   GROUP BY product_id, location_id
   HAVING SUM(delta) != balance
   ```
   Any discrepancy triggers a P2 alert for the engineering team.
