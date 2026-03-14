# CoreInventory — Workflows & Process Flows

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## 1. Receipt Workflow (Incoming Goods)

### Description
A receipt records goods arriving from a supplier, increasing stock at a destination location.

### Steps

| Step | Actor | Action | System Response |
|---|---|---|---|
| 1 | Staff | Create receipt, enter supplier reference | Receipt saved as `Draft` |
| 2 | Staff | Add product lines with expected quantities | Lines saved, receipt stays `Draft` |
| 3 | Staff | Submit for processing | Status → `Waiting` |
| 4 | Staff | Confirm actual received quantities (`done_qty`) | Status → `Ready` |
| 5 | Staff / Manager | Click Validate | Status → `Done`; stock increased; ledger entries created |
| — | Manager | Click Cancel (any stage before Done) | Status → `Canceled`; no stock change |

### Flow Diagram

```mermaid
flowchart TD
    A[Create Receipt\nStatus: Draft] --> B[Add Product Lines\nwith expected_qty]
    B --> C[Submit for Processing\nStatus: Waiting]
    C --> D[Enter done_qty\nper product line]
    D --> E[Mark Ready\nStatus: Ready]
    E --> F{Validate?}
    F -->|Yes| G[Status: Done\nstock_balances +qty\nledger entries created]
    F -->|Cancel| H[Status: Canceled\nNo stock change]
```

---

## 2. Delivery Order Workflow (Outgoing Goods)

### Description
A delivery order records goods leaving a warehouse for a customer or destination, decreasing stock.

### Steps

| Step | Actor | Action | System Response |
|---|---|---|---|
| 1 | Staff | Create delivery order, add destination reference | Delivery saved as `Draft` |
| 2 | Staff | Add product lines with quantities to send | System checks stock availability |
| 3 | Staff | Submit | Status → `Waiting` |
| 4 | Staff | Pick and pack items | Status → `Ready` |
| 5 | Staff / Manager | Validate | Status → `Done`; stock decreased; ledger entries created |
| — | Manager | Cancel | Status → `Canceled`; no stock change |

### Flow Diagram

```mermaid
flowchart TD
    A[Create Delivery\nStatus: Draft] --> B[Add Product Lines]
    B --> C{Stock Available?}
    C -->|No| D[Show Alert:\nInsufficient Stock]
    D --> B
    C -->|Yes| E[Submit\nStatus: Waiting]
    E --> F[Pick & Pack Items]
    F --> G[Status: Ready]
    G --> H{Validate?}
    H -->|Yes| I[Status: Done\nstock_balances -qty\nledger entries created]
    H -->|Cancel| J[Status: Canceled\nNo stock change]
```

---

## 3. Internal Transfer Workflow

### Description
An internal transfer moves stock from one location to another within the organization. Total stock quantity does not change — only the location distribution changes.

### Steps

| Step | Actor | Action | System Response |
|---|---|---|---|
| 1 | Staff | Create transfer, select source and destination locations | Transfer saved as `Draft` |
| 2 | Staff | Add product lines with transfer quantities | Validation: source ≠ destination |
| 3 | Staff | Submit | Status → `Waiting` |
| 4 | Staff | Pick items from source location | Status → `Ready` |
| 5 | Staff / Manager | Validate | Status → `Done`; source −qty, destination +qty; two ledger entries per line |
| — | Manager | Cancel | Status → `Canceled`; no stock change |

### Flow Diagram

```mermaid
flowchart TD
    A[Create Transfer\nStatus: Draft] --> B[Select Source Location]
    B --> C[Select Destination Location]
    C --> D{Source = Destination?}
    D -->|Yes| E[Error: Cannot transfer\nto same location]
    D -->|No| F[Add Product Lines]
    F --> G[Submit\nStatus: Waiting]
    G --> H[Staff Picks from Source]
    H --> I[Status: Ready]
    I --> J{Validate?}
    J -->|Yes| K[Status: Done\nSource -qty\nDestination +qty\nTwo ledger entries per line]
    J -->|Cancel| L[Status: Canceled]
    K --> M[Total Stock\nUNCHANGED]
```

---

## 4. Stock Adjustment Workflow

### Description
An adjustment corrects mismatches between system stock and physical stock counts.

### Steps

| Step | Actor | Action | System Response |
|---|---|---|---|
| 1 | Manager | Select product and location | Current system stock displayed |
| 2 | Manager | Enter physical count | System calculates delta = physical − system |
| 3 | Manager | Confirm adjustment | `stock_balances` updated; ledger entry created with delta |

### Flow Diagram

```mermaid
flowchart TD
    A[Select Product + Location] --> B[System shows current qty]
    B --> C[Manager enters physical count]
    C --> D[System calculates delta\ndelta = physical - system]
    D --> E{delta = 0?}
    E -->|Yes| F[No change needed]
    E -->|No| G[Show Summary:\nSystem: 100\nPhysical: 97\nDelta: -3]
    G --> H{Confirm?}
    H -->|Yes| I[Update stock_balances\nInsert ledger row\nDelta logged permanently]
    H -->|No| J[Discard — no change]
```

---

## 5. User Authentication Workflow

```mermaid
flowchart TD
    A[User visits /login] --> B[Enter email + password]
    B --> C{Credentials valid?}
    C -->|No| D[Show error: Invalid credentials]
    C -->|Yes| E[Generate JWT access token\n15 min TTL]
    E --> F[Generate refresh token\n7 day TTL]
    F --> G[Store refresh token in\nhttpOnly cookie]
    G --> H[Redirect to /dashboard]
```

---

## 6. Password Reset Workflow

```mermaid
flowchart TD
    A[User clicks Forgot Password] --> B[Enter email address]
    B --> C{Email exists?}
    C -->|No| D[Show generic message\nDo not reveal if email exists]
    C -->|Yes| E[Generate 6-digit OTP]
    E --> F[Hash OTP and store in Redis\nTTL: 15 minutes]
    F --> G[Send OTP via email]
    G --> H[User enters OTP + new password]
    H --> I{OTP valid and not expired?}
    I -->|No| J[Show error: Invalid or expired OTP]
    I -->|Yes| K[Hash new password\nUpdate users table]
    K --> L[Invalidate OTP in Redis]
    L --> M[Redirect to /login]
```

---

## 7. Real-World Inventory Flow Example

This example follows steel rods from arrival to final use:

```
Step 1 — RECEIPT
  Vendor delivers 100 kg steel rods
  Receipt validated → stock_balances +100 at Main Store
  Ledger: +100 | balance_after: 100

Step 2 — INTERNAL TRANSFER
  Move 20 kg from Main Store → Production Rack
  Transfer validated
  Ledger: Main Store -20 | balance: 80
  Ledger: Production Rack +20 | balance: 20
  Total stock: still 100 kg

Step 3 — DELIVERY
  Customer orders 20 kg steel from Main Store
  Delivery validated → stock_balances -20 at Main Store
  Ledger: -20 | balance_after: 60

Step 4 — ADJUSTMENT
  Physical count reveals 3 kg damaged
  Manager adjusts: system = 60, physical = 57
  Adjustment validated → delta = -3
  Ledger: -3 | balance_after: 57

Final: 57 kg at Main Store + 20 kg at Production Rack = 77 kg total
```
