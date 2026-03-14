# CoreInventory — Caching Strategy

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Caching Technology

**Redis** — used as primary cache for all application caching needs.

Redis is also used for:
- OTP token storage
- Refresh token blacklisting
- Rate limiting counters

---

## Cache-Aside Pattern

CoreInventory uses the **cache-aside** (lazy loading) pattern:

```
1. Application checks Redis for cached value
2. Cache HIT → return cached data
3. Cache MISS → query database → store result in Redis with TTL → return data
```

This pattern is appropriate because:
- Data is not always needed (no point pre-loading everything)
- Cache can be invalidated precisely on mutation
- Redis failure degrades gracefully (falls back to database)

---

## Cache Entries

### KPI Summary

| Key Pattern | `kpi:{warehouse_id}` or `kpi:all` |
|---|---|
| **TTL** | 300 seconds (5 minutes) |
| **Invalidated by** | Any operation validation in the target warehouse |
| **Data** | `{ totalProducts, lowStock, outOfStock, pendingReceipts, ... }` |
| **Reason** | KPI queries aggregate across multiple tables — expensive at high frequency |

### Product List

| Key Pattern | `products:list:{page}:{per_page}:{filters_hash}` |
|---|---|
| **TTL** | 120 seconds (2 minutes) |
| **Invalidated by** | Product create, update, or soft-delete |
| **Data** | Paginated array of product objects with total stock |
| **Reason** | Frequently viewed by all users; infrequently changed |

### Low Stock Alert List

| Key Pattern | `low-stock:{warehouse_id}` |
|---|---|
| **TTL** | 300 seconds (5 minutes) |
| **Invalidated by** | Any stock balance change (receipt/delivery/adjustment validation) |
| **Data** | Products where `quantity <= minimum_stock` |
| **Reason** | Displayed on dashboard; recomputing live on every page load is expensive |

### User Session / Refresh Token

| Key Pattern | `refresh:{user_id}` |
|---|---|
| **TTL** | 604800 seconds (7 days) |
| **Invalidated by** | Logout, password change |
| **Data** | bcrypt hash of refresh token |
| **Reason** | Stateless JWT + Redis verification — avoids DB lookup on every refresh |

### OTP Token

| Key Pattern | `otp:{user_id}` |
|---|---|
| **TTL** | 900 seconds (15 minutes) |
| **Invalidated by** | Successful OTP use, new OTP request, 3 failed attempts |
| **Data** | bcrypt hash of 6-digit OTP |
| **Reason** | Short-lived, high-security; Redis TTL enforces expiry automatically |

### Rate Limiting Counters

| Key Pattern | `rl:{ip}:{endpoint}` |
|---|---|
| **TTL** | 60 seconds |
| **Invalidated by** | TTL expiry |
| **Data** | Integer counter (incremented per request) |
| **Reason** | Fast increment and TTL-based expiry is a Redis strength |

---

## Cache Invalidation Strategy

| Event | Caches Invalidated |
|---|---|
| Operation validated (receipt/delivery/transfer/adjustment) | `kpi:{warehouse}`, `low-stock:{warehouse}` |
| Product created | `products:list:*` (all paginated variants) |
| Product updated | `products:list:*` |
| Product deleted | `products:list:*` |
| User logs out | `refresh:{user_id}` |
| Password changed | `refresh:{user_id}`, `otp:{user_id}` |

Use **key pattern deletion** (`SCAN` + `DEL`) for wildcard invalidation.

---

## Redis Failure Handling

If Redis is unavailable:

| Use Case | Fallback Behavior |
|---|---|
| KPI cache miss | Query PostgreSQL directly — higher latency but functional |
| Product list cache miss | Query PostgreSQL — paginated |
| OTP lookup | Query `otp_tokens` table in PostgreSQL (backup store) |
| Refresh token validation | Query `refresh_tokens` table in PostgreSQL (backup store) |
| Rate limiting | Allow requests (fail open) — log for monitoring |

> **Note:** OTP and refresh tokens are also persisted to PostgreSQL as a backup store. Redis is the fast path; PostgreSQL is the fallback. This ensures auth works even during Redis outages.

---

## Cache Size & Memory Management

- Redis `maxmemory` policy: `allkeys-lru` (evict least recently used keys when memory is full)
- Max memory limit: set appropriate to instance size (e.g., 256MB for MVP)
- Monitor with Redis `INFO memory` — alert if usage > 70%
