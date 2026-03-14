# CoreInventory — Incident Response

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Severity Levels

| Severity | Definition | Response Time | Example |
|---|---|---|---|
| **P0 — Critical** | System fully down; users cannot access; data integrity risk | 15 minutes | API returns 500 on all routes; DB unreachable |
| **P1 — High** | Major feature broken; significant user impact | 1 hour | Operation validation failing; dashboard not loading |
| **P2 — Medium** | Degraded performance or secondary feature broken | 4 hours | Email OTPs delayed; KPIs stale beyond 10 min |
| **P3 — Low** | Minor issue; no operational impact | Next business day | UI styling bug; non-critical slow query |

---

## Incident Response Steps

```
1. DETECT
   ├── Automated monitoring alert fires (UptimeRobot, Sentry, Grafana)
   └── User report received via support channel

2. ACKNOWLEDGE
   ├── On-call engineer acknowledges within SLA
   └── Incident channel opened (Slack #incident or WhatsApp group)

3. ASSESS
   ├── Determine severity (P0/P1/P2/P3)
   ├── Identify affected users and operations
   └── Communicate initial status to stakeholders

4. DIAGNOSE
   ├── Check Sentry for error traces
   ├── Check API logs for 5xx patterns
   ├── Check DB connection pool and slow query log
   ├── Check Redis connectivity and memory
   └── Check recent deployments (was anything deployed in last hour?)

5. MITIGATE
   ├── Option A: Rollback last deployment
   ├── Option B: Apply emergency hotfix
   ├── Option C: Scale up resources (if load-related)
   └── Option D: Toggle feature flag to disable broken feature

6. RESOLVE
   ├── Confirm /health returns 200
   ├── Confirm key operations functional (login, validate receipt)
   ├── Confirm Sentry error rate back to baseline
   └── Communicate resolution to stakeholders

7. POST-MORTEM (within 48h for P0/P1)
   ├── Timeline of events
   ├── Root cause analysis
   ├── What was the impact?
   ├── What worked well?
   ├── What didn't work?
   └── Action items to prevent recurrence
```

---

## P0 Runbook — API Down

```
1. Check: GET /health
   - If timeout → API server unreachable → check instance health in hosting console
   - If 503 → check which dependency is down (DB or Redis)

2. If DB unreachable:
   - Check PostgreSQL status in managed service console
   - Check connection quota (max_connections exceeded?)
   - Run: SELECT count(*) FROM pg_stat_activity;
   - If connections maxed → restart connection pooler (PgBouncer)

3. If Redis unreachable:
   - System degrades gracefully — OTPs fall back to DB
   - Restart Redis or fail over to backup instance

4. If last deployment is suspect:
   - Roll back to previous Docker image (see cicd_pipeline.md)
   - Apply DB rollback if migration was shipped

5. Notify stakeholders:
   "CoreInventory API is currently experiencing issues.
    Our team is actively investigating [since HH:MM].
    Estimated resolution update in 30 minutes."
```

---

## P1 Runbook — Operation Validation Failing

```
1. Check Sentry for CONCURRENCY_CONFLICT or INSUFFICIENT_STOCK errors
2. Check stock_balances for any rows where version is suspiciously high (multiple retries)
3. Check if nightly reconciliation job reported discrepancy
4. If concurrency issue: reduce connection pool max to force serialization temporarily
5. If data integrity: investigate stock_ledger for the affected product
   SELECT * FROM stock_ledger WHERE product_id = ? ORDER BY created_at DESC LIMIT 20;
6. If ledger and balances mismatch: run manual reconciliation and alert team
```

---

## Post-Mortem Template

```markdown
## Incident Post-Mortem — [Date] — [Brief Title]

### Summary
[2-3 sentence description of what happened]

### Timeline
- HH:MM — First alert fired
- HH:MM — Engineer acknowledged
- HH:MM — Root cause identified
- HH:MM — Mitigation applied
- HH:MM — Resolved

### Root Cause
[Technical explanation of why it happened]

### Impact
- Users affected: [N]
- Operations affected: [list if applicable]
- Duration: [X minutes]
- Data integrity impact: [None / Partial / Full]

### What Went Well
- [list]

### What Went Wrong
- [list]

### Action Items
| Action | Owner | Due Date |
|---|---|---|
| [task] | [name] | [date] |
```
