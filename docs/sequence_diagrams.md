# CoreInventory — Sequence Diagrams

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## 1. User Login

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as API Server
    participant DB as PostgreSQL
    participant Redis

    User->>FE: Enter email + password
    FE->>API: POST /auth/login { email, password }
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: User record
    API->>API: bcrypt.compare(password, hash)
    alt Valid credentials
        API->>API: Generate JWT access_token (15min)
        API->>API: Generate refresh_token (7d)
        API->>Redis: Store refresh_token hash (TTL: 7d)
        API-->>FE: 200 { access_token, user }
        FE->>FE: Set httpOnly cookie (refresh_token)
        FE->>FE: Store access_token in memory
        FE-->>User: Redirect to /dashboard
    else Invalid credentials
        API-->>FE: 401 { error: "Invalid credentials" }
        FE-->>User: Show error message
    end
```

---

## 2. OTP Password Reset

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as API Server
    participant DB as PostgreSQL
    participant Redis
    participant Email as SendGrid

    User->>FE: Enter email on /forgot-password
    FE->>API: POST /auth/forgot-password { email }
    API->>DB: SELECT id FROM users WHERE email = ?
    DB-->>API: User found (or not)
    Note over API: Always respond with 200\nto avoid email enumeration
    API->>API: Generate 6-digit OTP
    API->>API: token_hash = bcrypt(OTP)
    API->>Redis: SET otp:{userId} token_hash EX 900
    API->>Email: Send OTP to user email
    API-->>FE: 200 "OTP sent if email exists"
    FE-->>User: Show OTP entry form

    User->>FE: Enter OTP + new password
    FE->>API: POST /auth/reset-password { email, otp, newPassword }
    API->>Redis: GET otp:{userId}
    Redis-->>API: Stored token_hash
    API->>API: bcrypt.compare(otp, token_hash)
    alt OTP valid and not expired
        API->>DB: UPDATE users SET password_hash = bcrypt(newPassword)
        API->>Redis: DEL otp:{userId}
        API-->>FE: 200 "Password reset successful"
        FE-->>User: Redirect to /login
    else OTP invalid or expired
        API-->>FE: 400 { error: "Invalid or expired OTP" }
    end
```

---

## 3. Receipt Validation (Stock In)

```mermaid
sequenceDiagram
    actor Staff
    participant FE as Frontend
    participant API as API Server
    participant DB as PostgreSQL

    Staff->>FE: Click "Validate Receipt" on REC-001
    FE->>API: POST /operations/REC-001/validate
    API->>API: Check auth + role
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT operation WHERE id = REC-001 AND status = 'ready'
    DB-->>API: Operation + lines
    loop For each operation_line
        API->>DB: SELECT quantity, version FROM stock_balances\nWHERE product_id = ? AND location_id = ?
        DB-->>API: Current balance + version
        API->>DB: UPDATE stock_balances\nSET quantity = quantity + done_qty,\nversion = version + 1\nWHERE product_id = ? AND location_id = ? AND version = ?
        API->>DB: INSERT INTO stock_ledger\n(product_id, location_id, operation_id, user_id, delta, balance_after, ...)
    end
    API->>DB: UPDATE operations SET status = 'done', validated_at = NOW()
    API->>DB: COMMIT
    DB-->>API: Success
    API-->>FE: 200 { operation: { status: "done" } }
    FE-->>Staff: Show "Receipt Validated" confirmation
```

---

## 4. Delivery Validation (Stock Out)

```mermaid
sequenceDiagram
    actor Staff
    participant FE as Frontend
    participant API as API Server
    participant DB as PostgreSQL

    Staff->>FE: Click "Validate Delivery" on DEL-004
    FE->>API: POST /operations/DEL-004/validate
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT operation + lines WHERE id = DEL-004
    DB-->>API: Operation lines with done_qty
    loop For each line
        API->>DB: SELECT quantity FROM stock_balances\nWHERE product_id = ? AND location_id = source_location
        DB-->>API: Available quantity
        alt Available >= done_qty
            API->>DB: UPDATE stock_balances SET quantity = quantity - done_qty
            API->>DB: INSERT INTO stock_ledger (delta = -done_qty, ...)
        else Insufficient stock
            API->>DB: ROLLBACK
            API-->>FE: 422 { error: "INSUFFICIENT_STOCK", product: "Steel Rod" }
            FE-->>Staff: Show stock error — validation blocked
        end
    end
    API->>DB: UPDATE operations SET status = 'done'
    API->>DB: COMMIT
    API-->>FE: 200 { status: "done" }
```

---

## 5. Internal Transfer Validation

```mermaid
sequenceDiagram
    actor Staff
    participant API as API Server
    participant DB as PostgreSQL

    Staff->>API: POST /operations/TRF-007/validate
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT operation + lines WHERE id = TRF-007
    loop For each line
        API->>DB: Deduct from source_location\nUPDATE stock_balances SET quantity - done_qty WHERE location = source
        API->>DB: INSERT stock_ledger (delta = -done_qty, location = source, type = transfer_out)
        API->>DB: Add to dest_location\nUPDATE stock_balances SET quantity + done_qty WHERE location = dest
        API->>DB: INSERT stock_ledger (delta = +done_qty, location = dest, type = transfer_in)
    end
    API->>DB: UPDATE operations SET status = 'done'
    API->>DB: COMMIT
    API-->>Staff: 200 { status: "done" }
```

---

## 6. Dashboard KPI Load

```mermaid
sequenceDiagram
    participant FE as Dashboard
    participant API as API Server
    participant Redis
    participant DB as PostgreSQL

    FE->>API: GET /dashboard/kpis?warehouse=WH-A
    API->>Redis: GET kpi:WH-A
    alt Cache HIT (< 5 min old)
        Redis-->>API: Cached KPI JSON
        API-->>FE: 200 { KPIs from cache }
    else Cache MISS
        API->>DB: COUNT total products with quantity > 0
        API->>DB: COUNT products WHERE quantity < minimum_stock AND quantity > 0
        API->>DB: COUNT products WHERE quantity = 0
        API->>DB: COUNT operations WHERE type='receipt' AND status IN (waiting, ready)
        API->>DB: COUNT operations WHERE type='delivery' AND status IN (waiting, ready)
        API->>DB: COUNT operations WHERE type='transfer' AND status IN (waiting, ready)
        DB-->>API: Raw counts
        API->>Redis: SET kpi:WH-A { KPIs } EX 300
        API-->>FE: 200 { totalProducts, lowStock, outOfStock, pendingReceipts, pendingDeliveries, scheduledTransfers }
    end
    FE->>FE: Render KPI cards
```

---

## 7. Token Refresh Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as API Server
    participant Redis

    FE->>API: Any authenticated request
    API->>API: Decode JWT — expired!
    API-->>FE: 401 { error: "TOKEN_EXPIRED" }
    FE->>API: POST /auth/refresh (sends httpOnly cookie)
    API->>Redis: GET refresh_token_hash for user
    Redis-->>API: Token found and valid
    API->>API: Generate new access_token
    API-->>FE: 200 { access_token }
    FE->>FE: Update access_token in memory
    FE->>API: Retry original request
```
