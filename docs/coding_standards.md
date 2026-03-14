# CoreInventory — Coding Standards & Governance

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Code Quality Standards

### TypeScript

```
✅ strict mode enabled in tsconfig.json
✅ No `any` without an explanatory comment: // REASON: ...
✅ All function parameters and return types explicitly typed
✅ Enums for fixed value sets (status, operation type, roles)
✅ DTOs (Data Transfer Objects) for all API request/response shapes
✅ Interfaces for external integrations (email, DB adapters)
```

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Variables & functions | `camelCase` | `calculateDelta()` |
| Classes & types | `PascalCase` | `OperationService` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_OTP_ATTEMPTS` |
| Files (server) | `kebab-case` | `operation-service.ts` |
| Database columns | `snake_case` | `created_at`, `done_qty` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `JWT_SECRET` |

### File Structure (Feature-based, not layer-based)

```
src/
  modules/
    auth/
      auth.router.ts
      auth.controller.ts
      auth.service.ts
      auth.repository.ts
      auth.types.ts
    products/
      ...
    operations/
      ...
    warehouses/
      ...
    stock-ledger/
      ...
  shared/
    middleware/
    utils/
    errors/
    types/
  config/
  app.ts
  server.ts
```

### Error Handling

```typescript
// ✅ All async functions have try/catch
async function validateOperation(id: string) {
  try {
    // ...logic
  } catch (error) {
    // Rethrow as typed AppError
    throw new AppError('OPERATION_NOT_READY', 423, 'Operation must be in ready status');
  }
}

// ✅ No silent failures
// ❌ Never: catch (error) { }
// ❌ Never: .catch(() => {})
```

### SQL Safety

```
✅ All DB queries via ORM parameterized methods
✅ No raw SQL string concatenation
✅ VERIFY comment on any raw query:
   // VERIFY: parameterized via Knex .where({ id }) — not string interpolation
```

---

## Git & Version Control Standards

### Branching Strategy

| Branch | Purpose | Rules |
|---|---|---|
| `main` | Production-ready code | Protected; requires PR + review; no direct push |
| `staging` | Staging environment | Auto-deployed; mirrors main |
| `develop` | Integration branch | Feature PRs merged here first |
| `feature/[ticket]-[short-desc]` | Feature development | From `develop`; PR back to `develop` |
| `hotfix/[ticket]-[desc]` | Emergency fix | From `main`; PR to `main` + `develop` |
| `release/v[x.y.z]` | Release preparation | From `develop`; merged to `main` when ready |

### Commit Message Format (Conventional Commits)

```
feat: add operation cancellation endpoint
fix: correct stock delta calculation for transfers
docs: update API endpoint documentation
test: add integration tests for receipt validation
chore: update dependencies
refactor: extract stock balance update into shared helper
```

### Pull Request Rules

```
☐ PR title follows Conventional Commit format
☐ Description explains WHAT changed and WHY
☐ Linked to issue/ticket
☐ At least 1 reviewer approval required
☐ All CI checks passing (lint, tests, security)
☐ No new `any` types without justification
☐ No console.log statements (use structured logger)
```

---

## Documentation Standards

- All public API methods have JSDoc comments
- Every new endpoint documented in `api_endpoints.md` before merge
- Architecture decisions recorded as ADR entries in `challenges_and_solutions.md`
- CHANGELOG updated with every non-patch release
- README.md updated when setup steps change

---

## Data Governance

### Ownership

| Table | Module Owner |
|---|---|
| `users`, `otp_tokens` | Auth Module |
| `products` | Products Module |
| `warehouses`, `locations` | Warehouse Module |
| `operations`, `operation_lines` | Operations Module |
| `stock_balances`, `stock_ledger` | Stock Ledger Module |

No module may directly query another module's tables. Cross-module data access goes through service method calls.

### Data Retention

| Data | Retention | Reason |
|---|---|---|
| `stock_ledger` entries | 7 years | Financial audit requirements |
| `operations` records | 7 years | Operational audit |
| `otp_tokens` | 24 hours (expired tokens cleaned) | Security hygiene |
| Application logs | 30 days | Debug and monitoring |
| AUDIT logs | 2 years | Compliance |
| User data | Until account deleted | GDPR compliance (delete on request in v1.1) |

### Privacy Rules

```
❌ Never log: passwords, OTPs, full JWT tokens, personal user data
✅ Log: user_id (UUID), action, timestamp, operation_id
✅ Respond: never include password_hash in any API response
✅ Emails: used for auth only; not shared with third parties
```

---

## Compliance Checklist

| Requirement | Status |
|---|---|
| Passwords stored as bcrypt hash | ✅ |
| Passwords never returned by API | ✅ |
| OTPs hashed before storage | ✅ |
| Audit trail for all stock changes | ✅ |
| Audit trail is immutable | ✅ |
| RBAC enforced server-side | ✅ |
| HTTPS enforced in production | ✅ |
| Input validation at all API boundaries | ✅ |
| Secrets in environment variables | ✅ |
| GDPR user data export | 🔲 Planned v1.1 |
| GDPR right to erasure | 🔲 Planned v1.1 |
| Penetration test | 🔲 Before v2.0 |
