# CoreInventory — Workflow Command Map

> Maps every implementation task to its `.agent/workflows/` command.

---

## Phase 0 — Project Setup

| Task | Dev | Command |
|---|---|---|
| Plan monorepo structure & conventions | Both | `/plan` |
| Initialize backend + frontend projects | Both | `/create` |
| Set up shared types contract | Both | `/brainstorm` |
| Preview local dev servers running | Both | `/preview` |

---

## Phase 1 — Foundation

### Dev-A (Backend)

| Task | Command | Why |
|---|---|---|
| Database migrations (001–008) | `/generate` | Tribunal pipeline: Maker → DB reviewer → Human Gate |
| Stock ledger immutability trigger | `/tribunal-database` | SQL + security review on trigger |
| Express server + global error handler | `/generate` | Backend code through Tribunal |
| Auth module (signup, login, logout, refresh) | `/tribunal-backend` | Logic + Security + Types review |
| Auth middleware (requireAuth, requireRole) | `/tribunal-backend` | Security-critical code |
| Rate limiter middleware | `/tribunal-backend` | Security review required |
| Unit tests: auth service | `/test` | Generate + run tests |
| Integration tests: auth endpoints | `/test` | Generate + run tests |
| PR review | `/review` | Audit code for hallucinations |

### Dev-B (Frontend)

| Task | Command | Why |
|---|---|---|
| Design system (globals.css, OKLCH tokens) | `/ui-ux-pro-max` | Pro-max design protocol |
| Sidebar component | `/generate` → `/tribunal-frontend` | React component + hooks audit |
| Layout (root layout.tsx) | `/generate` → `/tribunal-frontend` | Layout architecture |
| Auth pages (login, signup, forgot, reset) | `/generate` → `/tribunal-frontend` | React + Security review |
| AuthProvider (Zustand store) | `/tribunal-frontend` | State management audit |
| API client (axios + auto-refresh) | `/tribunal-frontend` | Security: token handling |
| Shared UI components (Skeleton, Badge, etc.) | `/generate` | Tribunal pipeline |
| PR review | `/review` | Audit for hallucinations |

### Sync Point 1

| Task | Command |
|---|---|
| Integration demo | `/preview` |
| Status check | `/status` |
| Session save | `/session` |

---

## Phase 2 — Core Modules

### Dev-A (Backend)

| Task | Command | Why |
|---|---|---|
| Products CRUD endpoints (6 routes) | `/generate` → `/tribunal-backend` | Logic + Security + Types |
| Product service (SKU validation, soft delete) | `/tribunal-backend` | Business logic review |
| Warehouse & Location endpoints | `/generate` → `/tribunal-backend` | Same pattern |
| Location delete protection (stock check) | `/tribunal-backend` | Critical business rule |
| OTP password reset (3 endpoints) | `/tribunal-backend` | Security-critical: OTP + bcrypt |
| Email service (SendGrid integration) | `/tribunal-backend` | External service security |
| Dashboard KPI aggregation + Redis cache | `/generate` → `/tribunal-backend` | Performance + caching logic |
| Unit tests: products, warehouse, OTP | `/test` | Generate + run |
| Integration tests: all new endpoints | `/test` | Generate + run |
| API endpoint testing (Postman-style) | `/api-tester` | Automated multi-stage API tests |

### Dev-B (Frontend)

| Task | Command | Why |
|---|---|---|
| Products list page | `/generate` → `/tribunal-frontend` | React component audit |
| Product detail page | `/generate` → `/tribunal-frontend` | Complex component |
| Product create/edit forms | `/generate` → `/tribunal-frontend` | Form handling + validation |
| Dashboard page (KPI cards, recent ops) | `/ui-ux-pro-max` → `/tribunal-frontend` | Premium UI + React audit |
| Clickable KPI card navigation | `/tribunal-frontend` | Routing logic review |
| Warehouse settings pages | `/generate` → `/tribunal-frontend` | Standard CRUD pages |
| Profile page + password change | `/generate` → `/tribunal-frontend` | Security: password handling |
| API hooks (useProducts, useDashboard, etc.) | `/tribunal-frontend` | Hooks rules audit |

### Sync Point 2

| Task | Command |
|---|---|
| End-to-end integration check | `/preview` |
| Session save | `/session` |

---

## Phase 3 — Operations Engine

### Dev-A (Backend)

| Task | Command | Why |
|---|---|---|
| Operations CRUD + state machine | `/generate` → `/tribunal-backend` | Complex business logic |
| State machine transitions | `/tribunal-backend` | Critical: invalid transitions must throw |
| Validate endpoint (stock transactions) | `/tribunal-backend` + `/tribunal-database` | **Most critical code** — ACID transactions |
| Receipt validation (stock +) | `/tribunal-database` | SQL transaction review |
| Delivery validation (stock −, insufficient check) | `/tribunal-database` | SQL + business rule |
| Transfer validation (source −, dest +) | `/tribunal-database` | Dual-location transaction |
| Adjustment validation (delta calc) | `/tribunal-database` | Stock correction logic |
| Optimistic locking (concurrency) | `/tribunal-backend` | Race condition prevention |
| Stock Ledger API (GET with filters) | `/generate` → `/tribunal-backend` | Standard read endpoint |
| Concurrent validation tests | `/test` | Critical: concurrency tests |
| Full integration test suite | `/test` | All operation flows |

### Dev-B (Frontend)

| Task | Command | Why |
|---|---|---|
| Operations unified list page | `/generate` → `/tribunal-frontend` | Complex filtering UI |
| Operation create form (type-driven) | `/ui-ux-pro-max` → `/tribunal-frontend` | Complex dynamic form |
| Operation detail page (status-driven UI) | `/generate` → `/tribunal-frontend` | Conditional rendering |
| Post-validation read-only state | `/tribunal-frontend` | State management review |
| Move History page | `/generate` → `/tribunal-frontend` | Data table + filters |
| Toast notifications system | `/generate` → `/tribunal-frontend` | UI component |
| Loading/error states | `/enhance` | Polish existing pages |
| E2E: full operation flows | `/test` | Playwright tests |

### Sync Point 3

| Task | Command |
|---|---|
| Full integration session | `/preview` + `/api-tester` |
| Debug any integration issues | `/debug` |
| Session save | `/session` |

---

## Phase 4 — Security & Polish

### Dev-A (Backend)

| Task | Command | Why |
|---|---|---|
| Zod validation on all endpoints | `/refactor` | Systematic replacement |
| Security headers (helmet, CORS, CSRF) | `/tribunal-backend` | Security audit |
| Account lockout (Redis counter) | `/tribunal-backend` | Security feature |
| SQL injection tests | `/test` | Security tests |
| npm audit fix | `/fix` | Auto-fix dependencies |
| Full security scan | `/audit` | Comprehensive security audit |
| Performance: DB indexes + pool monitoring | `/tribunal-performance` | Performance review |

### Dev-B (Frontend)

| Task | Command | Why |
|---|---|---|
| Animations (spring physics, stagger) | `/ui-ux-pro-max` | Pro-max motion design |
| Mobile bottom nav (no hamburger) | `/ui-ux-pro-max` → `/tribunal-frontend` | Mobile-specific UI |
| Accessibility audit (ARIA, focus, contrast) | `/review` | Accessibility review |
| Empty states + error states | `/enhance` | Polish existing pages |
| Responsive review (4 breakpoints) | `/tribunal-mobile` | Mobile-specific audit |
| Keyboard navigation audit | `/review` | Accessibility |

### Sync Point 4

| Task | Command |
|---|---|
| Lighthouse audit | `/performance-benchmarker` |
| Security audit (full) | `/audit` |
| Status board | `/status` |

---

## Phase 5 — Integration & Release

### Dev-A (Backend)

| Task | Command | Why |
|---|---|---|
| Finalize DB indexes (EXPLAIN ANALYZE) | `/tribunal-performance` | Query performance |
| Structured logging (Winston) | `/enhance` | Add to existing code |
| Performance test (k6) | `/performance-benchmarker` | Load testing |
| Complete test suite (≥80% coverage) | `/test` | Full coverage run |
| Docker build optimization | `/enhance` | Build optimization |
| Backend setup docs | `/plan` | Documentation |
| Pre-deploy validation | `/deploy` | Deployment checklist |

### Dev-B (Frontend)

| Task | Command | Why |
|---|---|---|
| Playwright E2E test suite | `/test` | Full E2E tests |
| Cross-browser testing (Safari, Firefox) | `/review` | Compatibility review |
| Bundle analysis | `/performance-benchmarker` | Bundle size check |
| Frontend setup docs | `/plan` | Documentation |
| Next.js production build | `/preview` | Build verification |
| Final design review vs uiux.md | `/review` | Design compliance |

### Final Sync + Release

| Task | Command |
|---|---|
| Full test suite run | `/test` |
| Full project audit | `/audit` |
| Changelog generation | `/changelog` |
| Deploy to staging + production | `/deploy` |
| Session close | `/session` |

---

## Pre-Merge Checkpoints (Every PR)

| Checkpoint | Command |
|---|---|
| Before any backend PR | `/tribunal-backend` on changed files |
| Before any frontend PR | `/tribunal-frontend` on changed files |
| Before any DB migration PR | `/tribunal-database` on migration SQL |
| Before release PR (dev → main) | `/tribunal-full` (all 11 reviewers) |
| Before deployment | `/audit` + `/deploy` |

---

## Debug & Recovery

| Situation | Command |
|---|---|
| Bug found during integration | `/debug` |
| Lint/format issues | `/fix` |
| Refactoring needed | `/refactor` |
| Performance regression | `/tribunal-performance` |
| AI-generated code review | `/review-ai` |
| Multi-domain issue | `/orchestrate` |
| Complex cross-cutting task | `/swarm` |
