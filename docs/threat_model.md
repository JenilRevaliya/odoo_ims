# CoreInventory — Threat Model

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## STRIDE Threat Analysis

| Category | Threat | Component | Mitigation |
|---|---|---|---|
| **S**poofing | Attacker impersonates a valid user | Auth | bcrypt passwords; JWT with short TTL; httpOnly refresh cookie |
| **T**ampering | User modifies stock ledger data | Database | Ledger table protected by DB trigger; app has no UPDATE/DELETE on ledger |
| **R**epudiation | User denies performing a stock operation | Stock Ledger | Every operation logged with user_id, timestamp, and delta — immutable |
| **I**nformation Disclosure | API leaks user credentials or OTPs | API | Passwords/OTPs never returned or logged; OTPs hashed before storage |
| **D**enial of Service | Auth endpoint flooded with login requests | API | Rate limiting: 10 req/min per IP on `/auth/*`; DDoS protection via Cloudflare |
| **E**levation of Privilege | Staff user accesses manager-only routes | RBAC | Role enforced server-side on every protected route; JWT not trusted for sensitive ops |

---

## Specific Threats & Mitigations

### TH-01 — Brute Force Login
- **Threat:** Attacker repeatedly tries passwords to guess credentials
- **Likelihood:** High (automated tools)
- **Impact:** Account takeover
- **Mitigations:**
  - Rate limit `/auth/login` to 10 attempts per IP per minute
  - Account lockout after 5 consecutive failures (30-minute cooldown)
  - bcrypt cost factor 12 — each attempt takes ~200ms

### TH-02 — JWT Theft (XSS)
- **Threat:** XSS vulnerability allows attacker to steal access token from memory or localStorage
- **Likelihood:** Medium
- **Impact:** Session hijacking (15 minutes max window)
- **Mitigations:**
  - Access token stored only in JavaScript memory (not localStorage)
  - Refresh token in httpOnly cookie, inaccessible to JavaScript
  - Content-Security-Policy header prevents script injection
  - Short access token TTL (15 minutes limits exposure)

### TH-03 — OTP Replay Attack
- **Threat:** Attacker captures OTP from email and reuses it
- **Likelihood:** Low-Medium
- **Impact:** Password reset on behalf of victim
- **Mitigations:**
  - OTP single-use: `used = true` flag set immediately on verification
  - 15-minute expiry enforced
  - 3 failed attempts → OTP invalidated

### TH-04 — SQL Injection
- **Threat:** Malicious input in product name, SKU, or filter params modifies SQL queries
- **Likelihood:** Low (when using ORM)
- **Impact:** Data exfiltration or destruction
- **Mitigations:**
  - All queries use ORM parameterized statements
  - No raw SQL string interpolation anywhere in codebase
  - CI/CD security scan flags any raw SQL construction

### TH-05 — Unauthorized Stock Manipulation
- **Threat:** Staff accounts attempt to validate adjustments or cancel operations beyond their role
- **Likelihood:** Medium (internal misuse)
- **Impact:** False inventory records
- **Mitigations:**
  - RBAC enforced at API middleware layer
  - Critical operations (adjustments, cancellations) verify role from DB, not JWT
  - All stock mutations immutably logged with user ID + timestamp

### TH-06 — Stock Ledger Tampering
- **Threat:** Developer or compromised DB account deletes/updates ledger entries to cover up discrepancy
- **Likelihood:** Low
- **Impact:** Loss of audit trail; compliance violation
- **Mitigations:**
  - PostgreSQL trigger blocks UPDATE/DELETE on `stock_ledger`
  - Application DB user has no UPDATE/DELETE privileges on `stock_ledger`
  - Nightly reconciliation detects balance vs. ledger discrepancies

### TH-07 — CSRF Attack
- **Threat:** Attacker tricks a logged-in user's browser into making a forged request
- **Likelihood:** Low-Medium
- **Impact:** Unauthorized operations performed under victim's session
- **Mitigations:**
  - `SameSite=Strict` on refresh token cookie
  - CSRF token required on all state-changing requests
  - CORS restricted to known frontend origins

### TH-08 — Insecure Direct Object Reference (IDOR)
- **Threat:** Staff user changes the UUID in the URL to access another user's operations
- **Likelihood:** Medium
- **Impact:** Unauthorized data access
- **Mitigations:**
  - All queries scoped to authorized resources
  - Managers see all records; staff see records scoped to their warehouse assignments
  - Returns `404 NOT_FOUND` (not `403`) to avoid confirming existence

### TH-09 — Denial of Service via Large Requests
- **Threat:** Attacker sends extremely large JSON payloads to consume server memory
- **Likelihood:** Low
- **Impact:** API server crash or slowdown
- **Mitigations:**
  - Request body size limit: 1MB enforced at server level
  - Maximum 50 operation lines per operation enforced at validation

### TH-10 — Credential Stuffing
- **Threat:** Attacker uses leaked email/password pairs from other breaches
- **Likelihood:** High (automated tools)
- **Impact:** Account compromise
- **Mitigations:**
  - Rate limiting + lockout
  - bcrypt ensures breached passwords from other systems don't work directly

---

## Risk Matrix

| Threat | Likelihood | Impact | Risk Level | Status |
|---|---|---|---|---|
| TH-01 Brute Force | High | High | 🔴 Critical | ✅ Mitigated |
| TH-02 JWT Theft | Medium | Medium | 🟡 Medium | ✅ Mitigated |
| TH-03 OTP Replay | Low | High | 🟡 Medium | ✅ Mitigated |
| TH-04 SQL Injection | Low | High | 🟡 Medium | ✅ Mitigated |
| TH-05 Privilege Escalation | Medium | High | 🔴 Critical | ✅ Mitigated |
| TH-06 Ledger Tampering | Low | Critical | 🔴 Critical | ✅ Mitigated |
| TH-07 CSRF | Low | Medium | 🟢 Low | ✅ Mitigated |
| TH-08 IDOR | Medium | Medium | 🟡 Medium | ✅ Mitigated |
| TH-09 Large Payload DoS | Low | Low | 🟢 Low | ✅ Mitigated |
| TH-10 Credential Stuffing | High | High | 🔴 Critical | ✅ Mitigated |
