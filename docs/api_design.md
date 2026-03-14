# CoreInventory — API Design

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## API Overview

| Attribute | Value |
|---|---|
| **Style** | REST |
| **Base URL** | `https://api.coreinventory.io/v1` |
| **Protocol** | HTTPS only |
| **Format** | JSON (`Content-Type: application/json`) |
| **Authentication** | Bearer JWT (`Authorization: Bearer <token>`) |
| **Versioning** | URL path versioning (`/v1/`) |
| **Pagination** | Cursor-based or offset-based via `?page=1&per_page=20` |

---

## Design Principles

1. **Resource-oriented URLs** — nouns, not verbs: `/operations`, not `/createOperation`
2. **HTTP methods carry intent** — GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE (remove)
3. **Consistent response envelope** — every response uses the same JSON wrapper
4. **Predictable error codes** — machine-readable `code` + human-readable `message`
5. **Idempotent operations** — PUT and DELETE are idempotent; retrying does not cause duplication
6. **No sensitive data in URLs** — OTPs, passwords, and tokens are always in the request body
7. **Filtering via query params** — `GET /operations?type=receipt&status=done`

---

## Standard Response Envelope

### Success

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 148,
    "total_pages": 8
  }
}
```

### Error

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "SKU already exists in the system",
    "details": {
      "field": "sku",
      "value": "STL-001"
    }
  }
}
```

---

## Authentication Strategy

All protected endpoints require:

```http
Authorization: Bearer <access_token>
```

- **Access token**: JWT, 15-minute TTL
- **Refresh token**: Stored in `httpOnly` cookie, 7-day TTL
- **Token refresh**: `POST /auth/refresh` (no body needed — cookie sent automatically)

See `authentication.md` for full auth flow.

---

## Rate Limiting

| Route Group | Limit | Window |
|---|---|---|
| `/auth/*` | 10 requests | Per IP per minute |
| All other routes | 200 requests | Per authenticated user per minute |

Rate limit headers returned on every response:

```http
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 194
X-RateLimit-Reset: 1710394800
```

When exceeded: `429 Too Many Requests`

---

## Versioning Strategy

- Current version: `v1`
- All routes prefixed with `/v1/`
- When breaking changes are required, `/v2/` routes are introduced
- Old version supported for 6 months after new version release
- Deprecation communicated via `Deprecation` and `Sunset` response headers

---

## Pagination

Default: offset-based pagination.

Query params:

| Param | Default | Description |
|---|---|---|
| `page` | 1 | Page number |
| `per_page` | 20 | Items per page (max: 100) |
| `sort` | `created_at` | Sort field |
| `order` | `desc` | `asc` or `desc` |

---

## Filtering Convention

Filters passed as query string parameters:

```
GET /operations?type=receipt&status=waiting&warehouse_id=uuid&from=2026-01-01&to=2026-03-14
```

---

## API Versioning Headers

```http
API-Version: 1.0
Content-Type: application/json
```
