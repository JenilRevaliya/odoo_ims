# CoreInventory — Failure Modes

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Failure Mode Classification

| Category | Examples |
|---|---|
| **Application failures** | Unhandled exceptions, validation bugs, service logic errors |
| **Database failures** | Connection lost, disk full, deadlock, corruption |
| **Cache failures** | Redis down, memory exhausted, connection timeout |
| **External service failures** | Email delivery failure, CDN outage |
| **Infrastructure failures** | API server crash, network partition, load balancer failure |
| **Data integrity failures** | Stock balance ledger mismatch, concurrent write conflict |
| **Security failures** | Auth bypass, brute force success, data exposure |

---

## Application Failure Modes

### FM-APP-01 — Unhandled Exception in API Route

| Attribute | Detail |
|---|---|
| **Trigger** | Unexpected runtime error not caught by try/catch |
| **Impact** | 500 returned to client; operation may be incomplete |
| **Detection** | Sentry alert within 30 seconds |
| **Mitigation** | Global error handler ensures all 500s are logged with full stack; transaction rolled back |
| **Recovery** | Fix deployed via CI/CD; affected user retries operation |

### FM-APP-02 — Validation Logic Bug

| Attribute | Detail |
|---|---|
| **Trigger** | Edge case not anticipated in validation rules allows incorrect data through |
| **Impact** | Bad data persisted (e.g., negative stock balance) |
| **Detection** | Nightly reconciliation or manual audit |
| **Mitigation** | DB-level constraints catch worst cases; service layer validation defense-in-depth |
| **Recovery** | Manual stock adjustment + data correction script; root cause fixed in code |

---

## Database Failure Modes

### FM-DB-01 — PostgreSQL Primary Unreachable

| Attribute | Detail |
|---|---|
| **Trigger** | Network failure, DB crash, hosting provider outage |
| **Impact** | All write operations fail; read operations may fall through to replica |
| **Detection** | /health endpoint returns 503 within 30 seconds |
| **Mitigation** | Managed PostgreSQL with automatic failover (AWS RDS Multi-AZ); alert fires immediately |
| **Recovery** | Automatic failover promotes replica to primary; app reconnects; downtime < 30–60 seconds |

### FM-DB-02 — Connection Pool Exhausted

| Attribute | Detail |
|---|---|
| **Trigger** | Too many concurrent requests holding connections; slow queries blocking pool |
| **Impact** | New requests timeout; `ECONNRESET` errors |
| **Detection** | Grafana alert: active connections > 80% |
| **Mitigation** | PgBouncer transaction pooling; connection limit per API instance; slow query alerts |
| **Recovery** | Restart connection pooler; identify and kill long-running queries |

### FM-DB-03 — Ledger Discrepancy Detected

| Attribute | Detail |
|---|---|
| **Trigger** | Bug caused ledger and balance to diverge (rare) |
| **Impact** | Reported stock levels incorrect |
| **Detection** | Nightly reconciliation job |
| **Mitigation** | Immutable ledger is ground truth; balance can be rebuilt from ledger |
| **Recovery** | Run reconciliation repair script: `UPDATE stock_balances SET quantity = (SELECT SUM(delta) FROM stock_ledger WHERE ...)` — requires manual review and approval |

### FM-DB-04 — Disk Full

| Attribute | Detail |
|---|---|
| **Trigger** | Large stock ledger growth; no disk space expansion |
| **Impact** | Write operations fail; potential corruption |
| **Detection** | Disk usage alert at 80% |
| **Mitigation** | Managed DB with auto-scaling storage; disk alerts at 70% and 85% |
| **Recovery** | Expand disk capacity; archive old ledger entries to cold storage if needed |

---

## Cache Failure Modes

### FM-CACHE-01 — Redis Unavailable

| Attribute | Detail |
|---|---|
| **Trigger** | Redis server crash, memory exhaustion, network partition |
| **Impact** | Performance degradation; OTP/session lookups fall back to DB |
| **Detection** | /health returns `redis: disconnected`; latency spike in Grafana |
| **Mitigation** | Fallback to DB for OTPs and sessions (slower but functional); KPIs computed live |
| **Recovery** | Redis restart or failover; cache warms up automatically as requests come in |

### FM-CACHE-02 — Redis Memory Full (maxmemory exceeded)

| Attribute | Detail |
|---|---|
| **Trigger** | Cache grows faster than TTL eviction |
| **Impact** | `OOM command not allowed` errors; unpredictable eviction |
| **Mitigation** | `maxmemory-policy allkeys-lru` configured; alert at 70% usage |
| **Recovery** | Flush non-critical caches; increase Redis memory limit |

---

## External Service Failure Modes

### FM-EXT-01 — Email Service (SendGrid) Down

| Attribute | Detail |
|---|---|
| **Trigger** | SendGrid outage or API key revoked |
| **Impact** | OTP emails not delivered; password reset unavailable |
| **Detection** | Email send failure logged; alert on 3 consecutive failures |
| **Mitigation** | OTP email delivery retried 3x with exponential backoff; OTP stored in Redis for user to try again once email resolves |
| **Recovery** | Configure fallback SMTP or secondary provider (AWS SES); OTP remains valid for 15 minutes |

---

## Infrastructure Failure Modes

### FM-INFRA-01 — API Instance Crash

| Attribute | Detail |
|---|---|
| **Trigger** | Memory leak, OOM kill, container crash |
| **Impact** | Some requests fail mid-flight |
| **Detection** | Load balancer health check removes instance within 30 seconds |
| **Mitigation** | Multi-instance deployment; load balancer reroutes traffic to healthy instances; stateless API allows immediate replacement |
| **Recovery** | Container orchestrator automatically restarts instance |

### FM-INFRA-02 — Deployment Failure

| Attribute | Detail |
|---|---|
| **Trigger** | Bug in new release; failing migration |
| **Impact** | New version returns errors; potentially broken DB schema |
| **Detection** | Post-deploy health check + smoke tests in CI/CD |
| **Mitigation** | Staged deployment (staging → production); migration tested on staging first |
| **Recovery** | Rollback to previous Docker image + DB rollback migration |

---

## Security Failure Modes

### FM-SEC-01 — Brute Force Success

| Attribute | Detail |
|---|---|
| **Trigger** | Rate limiter misconfigured; brute force bypasses protection |
| **Impact** | Account compromised |
| **Detection** | Failed login spike in logs; Sentry alert |
| **Mitigation** | bcrypt makes each attempt slow; rate limiting + lockout |
| **Recovery** | Immediately reset compromised account password; review and tighten rate limiting |

### FM-SEC-02 — JWT Secret Compromised

| Attribute | Detail |
|---|---|
| **Trigger** | Secret exposed in logs or source code |
| **Impact** | Attacker can forge valid tokens for any user |
| **Detection** | Security audit; suspicious token usage patterns |
| **Mitigation** | Rotate JWT secret immediately; invalidate all active sessions (flush Redis refresh tokens) |
| **Recovery** | Deploy with new JWT_SECRET environment variable; all users logged out — must re-authenticate |
