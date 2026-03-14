# CoreInventory — State Diagrams

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## 1. Operation Status State Machine

All operations (Receipts, Deliveries, Transfers, Adjustments) share this lifecycle:

```mermaid
stateDiagram-v2
    [*] --> Draft : Created by user

    Draft --> Waiting : Submitted for processing
    Draft --> Canceled : User discards draft

    Waiting --> Ready : Items confirmed / quantities entered
    Waiting --> Canceled : Manager rejects (manager only)

    Ready --> Done : Validated — stock committed to DB
    Ready --> Canceled : Manager cancels before validation (manager only)

    Done --> [*] : Terminal state — immutable
    Canceled --> [*] : Terminal state — no stock impact
```

### Status Definitions

| Status | Meaning | Who Can Act |
|---|---|---|
| `Draft` | Created but not submitted | Creator |
| `Waiting` | Submitted, pending confirmation | Creator, Manager |
| `Ready` | Items confirmed, ready to execute | Creator, Manager |
| `Done` | Validated — stock committed | No further action |
| `Canceled` | Terminated without stock impact | No further action |

### Transition Rules

| From | To | Rule |
|---|---|---|
| `Draft` | `Waiting` | At least one operation line required |
| `Waiting` | `Ready` | All `done_qty` values must be filled |
| `Ready` | `Done` | Stock must be available (for deliveries and transfers) |
| `Draft` / `Waiting` | `Canceled` | Any user; manager required for `Waiting` cancellation |
| `Done` | — | No further transitions allowed |
| `Canceled` | — | No further transitions allowed |

---

## 2. Stock Balance State

```mermaid
stateDiagram-v2
    [*] --> Zero : Product created (no initial stock)
    Zero --> InStock : Receipt validated (+qty)
    InStock --> LowStock : Quantity drops below minimum_stock
    LowStock --> InStock : Receipt validated (stock replenished)
    InStock --> Zero : Delivery empties location stock
    LowStock --> Zero : Delivery empties last remaining stock
    Zero --> InStock : Receipt adds new stock
    InStock --> Adjusted : Adjustment changes quantity
    LowStock --> Adjusted : Adjustment changes quantity
    Adjusted --> InStock : Adjusted qty > minimum_stock
    Adjusted --> LowStock : Adjusted qty < minimum_stock and > 0
    Adjusted --> Zero : Adjusted qty = 0
```

### Stock State Definitions

| State | Condition | Dashboard Indicator |
|---|---|---|
| `InStock` | `quantity > minimum_stock` | Green |
| `LowStock` | `0 < quantity <= minimum_stock` | Amber — Low Stock Alert |
| `Zero` | `quantity = 0` | Red — Out of Stock |
| `Adjusted` | Intermediate state during adjustment processing | N/A |

---

## 3. OTP Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Issued : User requests password reset
    Issued --> Verified : User enters correct OTP within 15 min
    Issued --> Expired : 15 minutes elapsed
    Issued --> Invalidated : User requests a new OTP (old one invalidated)
    Issued --> MaxAttempts : 3 failed verification attempts
    Verified --> [*] : Password updated; token deleted
    Expired --> [*] : Cleaned up by scheduled job
    InvalidAted --> [*] : Replaced by new token
    MaxAttempts --> [*] : Token invalidated; user must request new OTP
```

---

## 4. User Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Guest : User not authenticated
    Guest --> Active : Login successful — JWT issued
    Active --> Refreshing : Access token expired (still has valid refresh token)
    Refreshing --> Active : Refresh successful — new access token issued
    Refreshing --> Guest : Refresh token expired or revoked
    Active --> Guest : User logs out — refresh token revoked
    Active --> Guest : Admin revokes session
```

---

## 5. Product Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Active : Product created
    Active --> Active : Stock changes (receipts, deliveries, transfers, adjustments)
    Active --> SoftDeleted : Manager deletes product (is_deleted = true)
    SoftDeleted --> Active : Manager restores product (future feature)
    SoftDeleted --> [*] : Historical ledger records retained forever
```

> **Note:** Products are never hard-deleted. Historical stock ledger entries reference products by FK. Soft deletion hides the product from UI lists while preserving full audit history.
