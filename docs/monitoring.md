# CoreInventory — Monitoring & Alerting

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Monitoring Stack

| Tool | Purpose |
|---|---|
| **UptimeRobot / Better Uptime** | HTTP uptime checks every 1 min — external |
| **Sentry** | Error tracking with full stack traces and request context |
| **Grafana + Prometheus** | Dashboards for API latency, DB query time, Redis hit rate |
| **PgHero** | PostgreSQL slow query detection |
| **Redis Insight / INFO** | Cache hit rate and memory usage |
| **GitHub Actions** | CI/CD pipeline monitoring |

---

## Health Check Endpoint

```http
GET /health

Response 200 (healthy):
{
  "status": "healthy",
  "timestamp": "2026-03-14T09:00:00Z",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "email_service": "reachable"
  },
  "uptime_seconds": 86400
}

Response 503 (degraded):
{
  "status": "degraded",
  "checks": {
    "database": "connected",
    "redis": "disconnected",
    "email_service": "reachable"
  }
}
```

Used by:
- Load balancer to route traffic only to healthy instances
- UptimeRobot for external monitoring
- CI/CD post-deploy verification

---

## Metrics to Monitor

### Application Metrics

| Metric | Alert Threshold |
|---|---|
| HTTP 5xx error rate | > 1% over 5 minutes |
| HTTP 4xx error rate | > 10% over 5 minutes |
| API p95 response time | > 1000ms over 5 minutes |
| Operation validation failures | > 5 `INSUFFICIENT_STOCK` errors in 10 minutes |
| Failed OTP deliveries | Any failure |

### Database Metrics

| Metric | Alert Threshold |
|---|---|
| Active DB connections | > 80% of `max_connections` |
| Query execution time (slow query log) | Any query > 500ms |
| Replication lag (read replica) | > 30 seconds |
| Disk usage | > 80% |
| Ledger reconciliation discrepancy | Any discrepancy detected |

### Cache Metrics

| Metric | Alert Threshold |
|---|---|
| Redis memory usage | > 70% of max |
| Redis cache hit rate | < 80% (KPI cache poorly tuned) |
| Redis connectivity | Any disconnection |

### Infrastructure Metrics

| Metric | Alert Threshold |
|---|---|
| CPU usage (API server) | > 80% sustained for 5 minutes |
| Memory usage (API server) | > 85% |
| Disk usage | > 80% |

---

## Logging Strategy

### Log Levels

| Level | Usage |
|---|---|
| `DEBUG` | Only in development — variable dumps, detailed flow |
| `INFO` | Normal operations: login, operation created, validation completed |
| `WARN` | Low stock alert triggered, slow query > 300ms, cache miss spike |
| `ERROR` | Failed DB operation, email send failure, unhandled exception |
| `AUDIT` | Every stock mutation — who, what, when, delta, operation ID |

### Log Format

All logs are **JSON structured**:

```json
{
  "level": "INFO",
  "timestamp": "2026-03-14T09:00:00Z",
  "requestId": "uuid",
  "userId": "uuid",
  "action": "operation.validated",
  "operationId": "uuid",
  "operationType": "receipt",
  "productCount": 3,
  "totalDelta": 150
}
```

### What Is Never Logged

```
❌ Passwords (plain or hash)
❌ OTP values (plain)
❌ JWT tokens (full value)
❌ Credit card or financial data
```

### Log Retention

| Log Type | Retention |
|---|---|
| Application logs | 30 days (searchable) |
| AUDIT stock logs | 2 years (compliance) |
| Error logs | 90 days |
| Security event logs | 1 year |

---

## Alert Channels

| Severity | Channel |
|---|---|
| P0 — Critical (system down) | PagerDuty + WhatsApp/SMS + Email |
| P1 — High (degraded) | PagerDuty + Email |
| P2 — Medium | Email |
| P3 — Low | Slack / notification only |

---

## Monitoring Runbook Checklist (Daily)

```
☐ /health returns 200 on all instances
☐ Sentry error rate < 1% over 24h
☐ Database connections < 80%
☐ Redis memory < 70%
☐ Ledger reconciliation job passed with 0 discrepancies
☐ Daily backup completed and size > 0
```
