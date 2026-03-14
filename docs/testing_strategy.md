# CoreInventory — Testing Strategy

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Testing Philosophy

> **Test behavior, not implementation.** Tests verify that the system does what it's supposed to, not how the code is internally structured.

---

## Testing Pyramid

```
            ┌──────────┐
            │   E2E    │  5–10 critical user journeys (Playwright)
           ┌┴──────────┴┐
           │ Integration │  API endpoint contracts + DB behavior (Supertest)
          ┌┴────────────┴┐
          │  Unit Tests   │  Service layer logic (Jest / Vitest)
         └───────────────┘
```

| Layer | Coverage Target | Tool | Speed |
|---|---|---|---|
| Unit | ≥ 80% of service layer | Jest / Vitest | Fast (< 30s) |
| Integration | All API endpoints | Supertest + test DB | Medium (< 2 min) |
| End-to-End | 5–10 critical flows | Playwright | Slow (< 10 min) |

---

## Unit Tests

**Target:** Service layer business logic only. Not controllers, not DB queries.

### Coverage Areas

| Area | Test Cases |
|---|---|
| Stock delta calculation | Receipt adds correct qty; delivery subtracts; adjustment computes delta |
| State machine transitions | Valid transitions succeed; invalid transitions throw |
| OTP validation | Valid OTP passes; expired OTP rejected; used OTP rejected |
| Insufficient stock check | Delivery blocked if `done_qty > available`; passes when sufficient |
| SKU format validation | Valid patterns accepted; invalid rejected |
| Duplicate SKU detection | Second product with same SKU → error |
| Ledger entry creation | Correct delta and balance_after computed |
| Transfer neutrality | Source decreases by exactly same amount destination increases |

### Example Unit Test (Pseudocode)

```typescript
describe('OperationService.validateReceipt', () => {
  it('increases stock at destination location by done_qty', async () => {
    const result = await operationService.validate(receiptId, actingUserId);
    expect(result.status).toBe('done');
    
    const balance = await stockBalanceRepo.find({ productId, locationId: destId });
    expect(balance.quantity).toBe(initialQty + doneQty);
  });

  it('creates a ledger entry with correct delta', async () => {
    await operationService.validate(receiptId, actingUserId);
    const ledgerEntry = await stockLedgerRepo.findByOperation(receiptId);
    expect(ledgerEntry.delta).toBe(doneQty);
    expect(ledgerEntry.operationType).toBe('receipt');
  });

  it('throws OPERATION_NOT_READY if status is not ready', async () => {
    await expect(operationService.validate(draftOperationId, actingUserId))
      .rejects.toThrow('OPERATION_NOT_READY');
  });
});
```

---

## Integration Tests

**Target:** Full API request-response cycle against a real test database.

**Setup:**
- Separate test PostgreSQL database (seeded before tests, cleaned after)
- Redis test instance (or `redis-mock`)
- No calls to external services (email mocked)

### Coverage Areas

| Endpoint Group | Tests |
|---|---|
| `POST /auth/login` | Valid login, wrong password, non-existent user |
| `POST /auth/reset-password` | Valid OTP, expired OTP, wrong OTP |
| `POST /products` | Create with valid data, duplicate SKU, invalid SKU format |
| `GET /products/:id` | Returns stock per location |
| `POST /operations` | Create receipt, delivery, transfer with valid and invalid data |
| `POST /operations/:id/validate` | Receipt increases stock, delivery decreases, insufficient stock blocked |
| `GET /dashboard/kpis` | Returns correct counts matching DB state |
| `GET /stock-ledger` | Returns entries for validated operations only |
| Role enforcement | Staff cannot access manager-only endpoints (403 returned) |

---

## End-to-End Tests (Playwright)

**Target:** Critical user journeys from browser to fully persisted outcome.

| Test | Steps |
|---|---|
| **Full receipt flow** | Login → Create receipt → Add lines → Submit → Validate → Verify stock increased on product page |
| **Full delivery flow** | Create delivery → Validate → Verify stock decreased |
| **Transfer flow** | Transfer between locations → Verify source decreased, destination increased, total unchanged |
| **Insufficient stock** | Create delivery with qty > stock → Validate blocked, error shown |
| **Low stock alert** | Set product minimum to 100 → Adjust stock to 50 → Verify dashboard shows low-stock alert |
| **Password reset** | Forgot password → OTP input → New password → Login with new password |
| **RBAC: Staff cannot cancel** | Login as staff → Navigate to operation → Verify Cancel button absent |

---

## Performance Tests

**Tool:** k6 or Artillery

### Target Scenarios

| Scenario | Concurrency | Duration | SLO |
|---|---|---|---|
| Dashboard KPI load | 50 virtual users | 5 minutes | p95 < 500ms |
| Product search by SKU | 50 virtual users | 5 minutes | p95 < 100ms |
| Operation validation | 20 virtual users | 5 minutes | p95 < 1000ms |
| Stock ledger query (30d) | 20 virtual users | 5 minutes | p95 < 500ms |

### Acceptance Criteria

Pass:
- All SLOs met
- Error rate < 0.1%
- No deadlocks or connection pool exhaustion

Fail:
- Any p95 exceeds SLO by more than 50%
- Error rate > 1%
- DB connections maxed out

---

## Test Data Strategy

- **Factories** generate realistic test data (product names, SKUs, warehouse names)
- **Database seeder** populates standard reference data before each integration test suite
- **Test isolation:** Each integration test runs in a transaction that rolls back after the test
- **No shared state between tests:** Tests do not depend on execution order

---

## Security Testing

| Test | Tool | Frequency |
|---|---|---|
| Dependency vulnerability scan | `npm audit` | Every CI run |
| Static Application Security Testing (SAST) | CodeQL | Every CI run |
| OWASP Top 10 manual review | Manual | Before every major release |
| Auth bypass attempts | Manual / Playwright | Before production deployment |
| SQL injection probe | `sqlmap` on staging | Quarterly |

---

## Test Environment Setup

```bash
# Install dependencies
npm install

# Set up test database
createdb coreinventory_test
npm run db:migrate -- --env test

# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests (requires running app)
npm run test:e2e

# Run with coverage report
npm run test:coverage
```

Coverage report generated in `/coverage/index.html`.
Pipeline fails if coverage drops below **80% on service layer**.
