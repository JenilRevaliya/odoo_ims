# CoreInventory — Scalability & Performance Strategy

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Scalability Goals

| Metric | v1.0 Target | v2.0 Target |
|---|---|---|
| Concurrent users | 50 | 500 |
| Operations per day | 1,000 | 50,000 |
| Products in catalog | 10,000 | 500,000 |
| API response time (p95) | < 500ms | < 200ms |
| Dashboard KPI load | < 2s | < 500ms |
| Database size | < 10GB | < 500GB |

---

## Scalability Architecture

### v1.0 — Single-server (MVP)
```
[Load Balancer] → [1 API Instance] → [PostgreSQL Primary] + [Redis]
```

### v2.0 — Horizontal Scale
```
[Load Balancer] → [N API Instances] → [PostgreSQL Primary (writes) + Replica (reads)] + [Redis Cluster]
```

### v3.0 — Service Extraction
```
[API Gateway] → Products Service | Operations Service | Analytics Service
              → Each with isolated DB schema
              → Event bus (Kafka/SQS) for stock events
```

---

## Stateless API Design

The API server is **fully stateless**:
- No in-memory session data
- All session state in Redis
- Any instance can serve any request
- Horizontal scaling: add instances behind load balancer, zero coordination needed

---

## Database Scaling Strategy

| Technique | Implementation |
|---|---|
| **Read Replica** | Reads for reports/history/KPIs from replica; writes to primary |
| **Connection Pooling** | PgBouncer (transaction mode) to handle burst connections |
| **Indexes** | Critical query paths indexed (see `data_model.md`) |
| **Partitioning** | `stock_ledger` partitioned by month once rows exceed 5M |
| **Archiving** | Ledger entries older than 2 years moved to cold storage (future) |

### Connection Pool Configuration

```
max_pool_size = 10 per API instance
max_instances = 4
total max connections to DB = 40
PostgreSQL max_connections = 100
Headroom for migrations / admin = 60 remaining
```

---

## Caching Strategy

See `caching_strategy.md` for full detail.

| Cache Target | TTL | Invalidation |
|---|---|---|
| Dashboard KPIs | 5 min | On any operation validation |
| Product list | 2 min | On product create/update/delete |
| Low-stock product list | 5 min | On any stock balance change |
| User session / refresh token | 7 days | On logout or password change |
| OTP tokens | 15 min | On use or expiry |

---

## Performance Optimization

### API Level
- **Pagination** enforced: max 100 items per page
- **Field selection** (v2.0): clients can request only needed fields
- **Compression**: gzip enabled for API responses > 1KB
- **HTTP/2** enabled for multiplexed connections

### Database Level
- All foreign key columns indexed
- Composite indexes for common filter combinations (`status + type`, `product_id + location_id`)
- `EXPLAIN ANALYZE` reviewed for all queries that run > 100ms
- Avoid `SELECT *` — always select specific columns

### Frontend Level
- **React Query**: automatic server state caching with stale-while-revalidate
- **Code splitting**: each route is a lazy-loaded chunk
- **CDN**: all static assets served from Cloudflare edge
- **Image optimization**: Next.js `<Image>` component for WebP conversion

---

## Load Balancing

- **Algorithm**: Round-robin (default for stateless APIs)
- **Health checking**: `/health` endpoint polled every 30 seconds
- **Sticky sessions**: Not required (stateless API)
- **Connection draining**: 30-second drain before removing instance from pool

---

## Fault Tolerance

| Failure Scenario | Behavior |
|---|---|
| API instance down | Load balancer reroutes to healthy instances |
| Redis unavailable | Falls back to DB for OTP lookups; KPIs computed live (slower) |
| PostgreSQL primary down | Failover to read replica (read-only mode temporarily) |
| Email service down | OTP delivery queued and retried 3x with exponential backoff |
| Validation transaction failure | Full rollback — stock and ledger left unchanged |

---

## Non-Functional Performance Requirements

| Requirement | Target |
|---|---|
| API p95 response time | < 500ms |
| Dashboard KPI load (cached) | < 200ms |
| Dashboard KPI load (uncached) | < 2s |
| Receipt validation (with ledger write) | < 1s |
| Product search by SKU | < 100ms |
| Stock ledger query (30 days) | < 500ms |
| System uptime | ≥ 99.5% (allows ~3.6 hours downtime/month) |
