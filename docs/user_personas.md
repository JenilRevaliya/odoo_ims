# CoreInventory — User Personas & User Stories

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Persona 1 — Inventory Manager

| Attribute | Detail |
|---|---|
| **Name** | Ravi Sharma |
| **Age** | 38 |
| **Role** | Inventory / Operations Manager |
| **Location** | Mumbai, India |
| **Technical Level** | Medium |
| **Tools Used Today** | Excel, WhatsApp groups, paper count sheets |

### Goals
- Know stock levels at any time without asking warehouse staff
- Be alerted before a critical stockout occurs
- Review who made what stock change and when
- Manage multiple warehouses from a single screen

### Frustrations
- Excel files get overwritten or corrupted
- No visibility into what warehouse staff have received or dispatched
- Staff report stock levels verbally — inaccurate
- Month-end stock reconciliation takes 2 days manually

### Primary Screens
- Dashboard with KPIs
- Move History / Stock Ledger
- Low Stock Alerts
- Settings (Warehouses & Locations)

---

## Persona 2 — Warehouse Staff

| Attribute | Detail |
|---|---|
| **Name** | Karan Patel |
| **Age** | 26 |
| **Role** | Warehouse Operator |
| **Location** | Pune, India |
| **Technical Level** | Low |
| **Tools Used Today** | Paper forms, physical tally marks |

### Goals
- Log received goods quickly without paperwork
- Confirm delivery dispatches with accuracy
- Move items between racks and record it digitally
- Not make mistakes that require reversal

### Frustrations
- Paper forms get lost or damaged
- Has to call Ravi to confirm stock levels before each operation
- Manual data entry creates errors
- No confirmation that a receipt was logged correctly

### Primary Screens
- Receipts → Create & Validate
- Delivery Orders → Create & Validate
- Internal Transfers → Create & Validate
- Product Search (SKU)

---

## User Stories

### Authentication

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-AUTH-01 | As a new user, I want to sign up with my name, email, and password so I can access the system | Account is created and I am redirected to login |
| US-AUTH-02 | As a returning user, I want to log in with email and password | Valid credentials → Dashboard; invalid → error message |
| US-AUTH-03 | As a user who forgot my password, I want to receive an OTP on my email so I can reset my password | OTP sent, verifiable, single-use, expires in 15 min |
| US-AUTH-04 | As a user, I want to log out securely | Session invalidated, redirect to login |

### Dashboard

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-DASH-01 | As a manager, I want to see total products in stock on the dashboard | Accurate count shown within 5 seconds |
| US-DASH-02 | As a manager, I want to see low-stock and out-of-stock counts | Product names and quantities listed |
| US-DASH-03 | As a manager, I want to see pending receipts, deliveries, and transfers | Counts shown per operation type |
| US-DASH-04 | As a manager, I want to filter the dashboard by warehouse and document type | Data updates immediately on filter change |

### Products

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-PROD-01 | As a manager, I want to create a new product with name, SKU, category, and unit of measure | Product appears in product list |
| US-PROD-02 | As a manager, I want to define minimum stock and reorder quantity for a product | Low-stock alert triggers when stock falls below minimum |
| US-PROD-03 | As a staff member, I want to search products by SKU | Matching product shown instantly |
| US-PROD-04 | As a manager, I want to view stock levels per location for a product | Stock table shows each warehouse/rack and quantity |

### Receipts

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-REC-01 | As staff, I want to create a receipt and add products with expected quantities | Receipt saved as Draft |
| US-REC-02 | As staff, I want to enter actual received quantities and validate the receipt | Stock increases at the destination location upon validation |
| US-REC-03 | As staff, I want to cancel a receipt | Receipt status set to Canceled, no stock change |

### Deliveries

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-DEL-01 | As staff, I want to create a delivery order with products and quantities | Delivery saved as Draft |
| US-DEL-02 | As staff, I want to validate a delivery | Stock decreases, ledger entry created |
| US-DEL-03 | As the system, alert the user if delivery quantity exceeds available stock | Warning shown, validation blocked until resolved |

### Transfers

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-TRF-01 | As staff, I want to transfer stock from one location to another | Source location decreases, destination increases, total unchanged |
| US-TRF-02 | As a manager, I want to schedule a transfer in advance | Transfer created as Draft/Waiting for later execution |

### Adjustments

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-ADJ-01 | As a manager, I want to perform a stock adjustment to fix a discrepancy | System calculates delta, stock updated, entry logged |
| US-ADJ-02 | As a manager, I want the adjustment logged permanently with my name and timestamp | Audit trail entry visible in Move History |

### Move History

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-HIST-01 | As a manager, I want to view all stock movements | Every receipt, delivery, transfer, and adjustment listed |
| US-HIST-02 | As a manager, I want to filter history by product, date, operation type | Filtered results returned instantly |

### Settings

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-SET-01 | As a manager, I want to create warehouses | Warehouse added and available for assignment |
| US-SET-02 | As a manager, I want to add racks/locations within a warehouse | Locations listed under parent warehouse |

### Profile

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-PROF-01 | As any user, I want to update my name, email, and password | Changes saved, confirmation shown |
| US-PROF-02 | As any user, I want to log out | Session ended, redirected to login |
