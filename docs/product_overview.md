# CoreInventory — Product Overview

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Product Vision

> **CoreInventory** is a centralized, modular, and real-time inventory management platform that eliminates manual stock tracking, reduces human error, and gives businesses complete visibility and control over their inventory across multiple warehouses and locations.

---

## Problem Statement

### Current State

Most small-to-medium businesses manage inventory with:

- Manual paper registers
- Shared Excel spreadsheets
- Separate tracking files per department or warehouse
- Verbal communication between departments

### Problems This Creates

| Problem | Impact |
|---|---|
| Data inconsistency | Stock numbers differ between departments |
| No real-time visibility | Managers don't know actual stock levels |
| Counting errors | Incorrect orders, production delays |
| No audit trail | Theft, loss, and entry errors go undetected |
| Poor departmental coordination | Delays in receipts, deliveries, and transfers |
| No alerting | Stockouts discovered only when it's too late |

---

## Value Proposition

CoreInventory solves these problems with:

| Feature | Benefit |
|---|---|
| **One platform for all operations** | Receipts, deliveries, transfers, adjustments in one place |
| **Real-time stock levels** | Managers can see current inventory at any moment |
| **Immutable audit trail** | Every movement is logged permanently — who, when, what, how much |
| **Smart alerting** | Low-stock and out-of-stock alerts before they cause damage |
| **Multi-warehouse support** | Track stock separately at each warehouse and rack |
| **Guided workflows** | Simple step-by-step flows usable by warehouse staff with minimal training |
| **Dashboard KPIs** | Instant operational snapshot without navigating multiple screens |

---

## Target Users

### Primary Users

| User Type | Role | Primary Goal |
|---|---|---|
| **Inventory Manager** | Oversees all inventory operations | Monitor KPIs, prevent stockouts, review audit trail |
| **Warehouse Staff** | Handles goods physically | Quickly log receipts, deliveries, and transfers |

### Secondary Users (Future)

| User Type | Role |
|---|---|
| **Procurement Manager** | Creates purchase orders matched to receipts |
| **Operations Auditor** | Reviews stock history for compliance |
| **Senior Management** | Views high-level reports and trends |

---

## Success Metrics (v1.0)

| Metric | Target |
|---|---|
| Time to log a receipt | < 3 minutes |
| Stock error rate reduction | ≥ 80% vs. Excel baseline |
| Missed low-stock alerts | 0 critical stockouts unreported |
| User onboarding time (staff) | ≤ 30 minutes |
| System uptime | ≥ 99.5% |
| Dashboard KPI load time | < 2 seconds |

---

## System Scope (v1.0)

### In Scope

- User authentication (signup, login, OTP password reset)
- Product catalog management (CRUD, SKU search, categories)
- Goods receipt workflow (supplier → warehouse)
- Delivery order workflow (warehouse → customer)
- Internal transfer workflow (location to location)
- Stock adjustment (correct discrepancies)
- Move history / stock ledger (full audit trail)
- Dashboard KPIs and filters
- Multi-warehouse and location management
- Low stock alerts
- User profile management

### Out of Scope (v1.0)

- Supplier master records and purchase orders
- Document PDF generation
- Barcode / QR code scanning
- Mobile native application
- Demand forecasting or analytics
- Multi-tenant / multi-company support
- Financial integration (ERP, accounting)
