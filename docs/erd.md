# CoreInventory — Entity Relationship Diagram (ERD)

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Full ERD

```mermaid
erDiagram
    USERS {
        uuid id PK
        string name
        string email
        string password_hash
        enum role
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        uuid id PK
        string name
        string sku UK
        string category
        string unit_of_measure
        int minimum_stock
        int reorder_quantity
        bool is_deleted
        timestamp created_at
    }

    WAREHOUSES {
        uuid id PK
        string name
        string address
        timestamp created_at
    }

    LOCATIONS {
        uuid id PK
        uuid warehouse_id FK
        string name
        string description
        timestamp created_at
    }

    STOCK_BALANCES {
        uuid id PK
        uuid product_id FK
        uuid location_id FK
        int quantity
        int version
        timestamp updated_at
    }

    OPERATIONS {
        uuid id PK
        enum type
        enum status
        uuid created_by FK
        uuid source_location_id FK
        uuid dest_location_id FK
        string reference_number
        text notes
        timestamp created_at
        timestamp validated_at
        uuid validated_by FK
    }

    OPERATION_LINES {
        uuid id PK
        uuid operation_id FK
        uuid product_id FK
        int expected_qty
        int done_qty
    }

    STOCK_LEDGER {
        uuid id PK
        uuid product_id FK
        uuid location_id FK
        uuid operation_id FK
        uuid user_id FK
        int delta
        int balance_after
        string operation_type
        timestamp created_at
    }

    OTP_TOKENS {
        uuid id PK
        uuid user_id FK
        string token_hash
        timestamp expires_at
        bool used
        timestamp created_at
    }

    USERS ||--o{ OPERATIONS : "creates"
    USERS ||--o{ OPERATIONS : "validates"
    USERS ||--o{ STOCK_LEDGER : "responsible for"
    USERS ||--o{ OTP_TOKENS : "owns"

    OPERATIONS ||--|{ OPERATION_LINES : "contains"
    OPERATIONS }|--o| LOCATIONS : "source location"
    OPERATIONS }|--o| LOCATIONS : "destination location"

    OPERATION_LINES }|--|| PRODUCTS : "references"

    STOCK_LEDGER }|--|| PRODUCTS : "tracks product"
    STOCK_LEDGER }|--|| LOCATIONS : "at location"
    STOCK_LEDGER }|--|| OPERATIONS : "from operation"

    STOCK_BALANCES }|--|| PRODUCTS : "product balance"
    STOCK_BALANCES }|--|| LOCATIONS : "at location"

    LOCATIONS }|--|| WAREHOUSES : "belongs to"
```

---

## Relationship Summary

| Relationship | Cardinality | Notes |
|---|---|---|
| User → Operations | One-to-Many | A user creates many operations |
| Operation → Operation Lines | One-to-Many | Each operation has one or more product lines |
| Operation Line → Product | Many-to-One | Many lines can reference the same product |
| Operation → Location (source) | Many-to-One | Optional; used for delivery and transfer |
| Operation → Location (dest) | Many-to-One | Optional; used for receipt and transfer |
| Stock Balance → Product | Many-to-One | One balance record per product per location |
| Stock Balance → Location | Many-to-One | One balance record per product per location |
| Stock Ledger → Product | Many-to-One | Many movements per product |
| Stock Ledger → Location | Many-to-One | Each ledger entry is location-specific |
| Stock Ledger → Operation | Many-to-One | Each ledger entry tied to one operation |
| Stock Ledger → User | Many-to-One | Each ledger entry records the acting user |
| Location → Warehouse | Many-to-One | Many locations per warehouse |
| OTP Token → User | Many-to-One | One user can request multiple OTPs (one valid at a time) |

---

## Key Design Decisions

### Why is `stock_balances` separate from `stock_ledger`?

- `stock_ledger` is the **source of truth** but requires aggregation (SUM) to compute current stock — slow for real-time KPIs
- `stock_balances` is a **performance cache**: always updated transactionally alongside the ledger
- Both are always kept in sync via the atomic validation transaction
- Nightly reconciliation verifies consistency

### Why UUIDs instead of integer IDs?

- UUIDs allow safe distributed ID generation without coordination
- Prevents enumeration attacks (you cannot guess sequential IDs)
- Enables future multi-tenant or multi-database architectures

### Why `is_deleted` on products instead of hard delete?

- Stock history (ledger) references products by FK
- Hard deleting a product would orphan historical ledger records
- Soft delete keeps data integrity while hiding inactive products from UI
