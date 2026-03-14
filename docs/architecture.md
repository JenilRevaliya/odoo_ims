# CoreInventory — System Architecture

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Architecture Style

CoreInventory uses a **Layered Modular Monolith** architecture.

The application is a single deployable unit internally organized by bounded domain modules. Each module owns its own routes, service logic, and data access — but all share a single database and runtime.

**Why this style?**

| Reason | Explanation |
|---|---|
| Appropriate complexity | System scope does not warrant microservices overhead |
| Team size | Small-to-medium team; single deploy keeps ops simple |
| Domain isolation | Modules are cleanly bounded — extractable to microservices later |
| Data integrity | Single shared PostgreSQL database allows ACID transactions across modules |
| Low operational cost | One container, one process, simple scaling at MVP stage |

---

## High-Level Architecture Diagram

```mermaid
graph TD
    U[User Browser] -->|HTTPS| CDN[CDN / Cloudflare]
    CDN --> FE[Frontend SPA\nReact + Next.js]
    FE -->|REST API / JSON| API[Backend API\nNode.js + Express]

    API --> AUTH[Auth Module\nJWT + OTP]
    API --> PROD[Products Module]
    API --> OPS[Operations Module\nReceipts · Deliveries · Transfers · Adjustments]
    API --> WH[Warehouse Module]
    API --> HIST[Move History Module\nStock Ledger]
    API --> DASH[Dashboard Module\nKPI Aggregation]

    AUTH --> REDIS[(Redis\nOTP + Sessions)]
    DASH --> REDIS

    PROD --> DB[(PostgreSQL\nPrimary DB)]
    OPS --> DB
    WH --> DB
    HIST --> DB
    AUTH --> DB

    API --> NOTIFY[Notification Service\nLow Stock + OTP Emails]
    NOTIFY --> SMTP[SendGrid / AWS SES]
    DB --> BACKUP[Scheduled Backups\nS3 / GCS]
```

---

## Layered Architecture (Per Module)

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│  React Pages, Forms, Components, State Mgmt     │
├─────────────────────────────────────────────────┤
│           API / Controller Layer                │
│  Express Route Handlers, Request Validation     │
│  Input sanitization, Auth middleware            │
├─────────────────────────────────────────────────┤
│         Service / Business Logic Layer          │
│  Workflow state machine, stock delta logic      │
│  Validation rules, alert triggers               │
├─────────────────────────────────────────────────┤
│           Repository / Data Layer               │
│  ORM queries, SQL abstraction, transactions     │
├─────────────────────────────────────────────────┤
│               Database Layer                    │
│  PostgreSQL tables, indexes, constraints        │
└─────────────────────────────────────────────────┘
```

---

## Component Architecture

```mermaid
graph LR
    subgraph Frontend
        Pages[React Pages]
        Components[UI Components]
        APIClient[API Client / Axios]
        State[State Management\nZustand / React Query]
    end

    subgraph Backend
        Router[Express Router]
        Middleware[Auth Middleware\nValidation Middleware]
        AuthSvc[Auth Service]
        ProdSvc[Product Service]
        OpsSvc[Operations Service]
        WHSvc[Warehouse Service]
        LedgerSvc[Ledger Service]
        DashSvc[Dashboard Service]
    end

    subgraph Data
        PG[(PostgreSQL)]
        Redis[(Redis)]
    end

    subgraph External
        Email[SendGrid]
    end

    Pages --> Components
    Components --> APIClient
    APIClient --> Router
    Router --> Middleware
    Middleware --> AuthSvc
    Middleware --> ProdSvc
    Middleware --> OpsSvc
    Middleware --> WHSvc
    Middleware --> LedgerSvc
    Middleware --> DashSvc
    AuthSvc --> PG
    AuthSvc --> Redis
    ProdSvc --> PG
    OpsSvc --> PG
    OpsSvc --> LedgerSvc
    WHSvc --> PG
    LedgerSvc --> PG
    DashSvc --> PG
    DashSvc --> Redis
    AuthSvc --> Email
```

---

## Module Responsibilities

| Module | Responsibility |
|---|---|
| **Auth Module** | Sign up, login, OTP generation, JWT issuance, session management |
| **Products Module** | Product CRUD, SKU search, reorder rule management, stock-per-location view |
| **Operations Module** | Orchestrates receipts, deliveries, transfers, adjustments; manages status FSM |
| **Warehouse Module** | Warehouse and location CRUD, location hierarchy |
| **Ledger Module** | Append-only stock movement log; single source of truth for all stock changes |
| **Dashboard Module** | Aggregates KPIs from ledger and balances; cached in Redis for performance |
| **Notification Service** | Sends OTP emails, low-stock alert emails via SendGrid |

---

## Operation Status Finite State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft : Created
    Draft --> Waiting : Submitted for processing
    Waiting --> Ready : Items confirmed / packed
    Ready --> Done : Validated — stock committed
    Draft --> Canceled
    Waiting --> Canceled
    Done --> [*]
    Canceled --> [*]
```

**State rules:**

| State | Who can edit? | Can be validated? | Can be canceled? |
|---|---|---|---|
| Draft | Creator | No | Yes |
| Waiting | Creator | No | Manager only |
| Ready | No one | Yes | Manager only |
| Done | No one | N/A | No |
| Canceled | No one | No | No |

---

## Deployment Architecture

```mermaid
graph TD
    DNS[DNS] --> CF[Cloudflare CDN + WAF]
    CF --> FE[Frontend\nVercel / Nginx]
    CF --> LB[Load Balancer\nNginx / AWS ALB]
    LB --> API1[API Instance 1\nNode.js Docker]
    LB --> API2[API Instance 2\nNode.js Docker]
    API1 --> PG_P[(PostgreSQL Primary)]
    API2 --> PG_P
    PG_P --> PG_R[(PostgreSQL\nRead Replica)]
    API1 --> REDIS[Redis Cluster]
    API2 --> REDIS
    PG_P --> S3[(S3 / GCS\nBackups)]
```

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Next.js | SSR, excellent ecosystem, strong TypeScript support |
| Backend API | Node.js + Express | Fast development, large ecosystem, async-first |
| Database | PostgreSQL | ACID compliance, relational integrity, JSON support |
| Cache | Redis | Fast OTP/session storage and KPI caching |
| Authentication | JWT + bcrypt | Stateless, industry standard, secure |
| Email | SendGrid | Reliable OTP and alert delivery |
| Container | Docker | Reproducible environments |
| CI/CD | GitHub Actions | Native GitHub integration |
| Hosting (MVP) | Railway / Render | Low ops overhead for initial launch |
| Monitoring | Sentry + UptimeRobot | Error tracking + uptime checks |
