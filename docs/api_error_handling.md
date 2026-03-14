# CoreInventory — API Error Handling

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Error Response Format

Every error follows the standard response envelope:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { }
  }
}
```

---

## HTTP Status Code Usage

| Status | Usage |
|---|---|
| `200 OK` | Successful GET, PUT, PATCH |
| `201 Created` | Successful POST (resource created) |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Malformed JSON or missing required fields |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Valid token but insufficient role |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Duplicate SKU, duplicate reference number |
| `422 Unprocessable Entity` | Validation failed (field errors, business rules) |
| `423 Locked` | Resource in a state that prevents the action |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected server error |

---

## Error Code Catalogue

### Authentication Errors

| Code | HTTP | Trigger |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password on login |
| `TOKEN_MISSING` | 401 | Authorization header not present |
| `TOKEN_EXPIRED` | 401 | JWT access token has expired |
| `TOKEN_INVALID` | 401 | JWT signature verification failed |
| `REFRESH_TOKEN_INVALID` | 401 | Refresh token expired, revoked, or not found |
| `OTP_INVALID` | 400 | OTP does not match stored hash |
| `OTP_EXPIRED` | 400 | OTP requested more than 15 minutes ago |
| `OTP_USED` | 400 | OTP was already consumed |
| `OTP_MAX_ATTEMPTS` | 400 | 3 failed verification attempts — token invalidated |

### Authorization Errors

| Code | HTTP | Trigger |
|---|---|---|
| `FORBIDDEN` | 403 | User role does not permit the requested action |
| `SELF_ACTION_FORBIDDEN` | 403 | User tried to perform an action restricted to managers on their own data |

### Resource Errors

| Code | HTTP | Trigger |
|---|---|---|
| `NOT_FOUND` | 404 | Resource (product, operation, warehouse, etc.) with given ID does not exist |
| `PRODUCT_DELETED` | 404 | Product exists but has been soft-deleted |

### Validation Errors

| Code | HTTP | Trigger |
|---|---|---|
| `VALIDATION_ERROR` | 422 | One or more fields failed validation rules |
| `SKU_DUPLICATE` | 409 | Product with this SKU already exists |
| `REFERENCE_DUPLICATE` | 409 | Operation reference number already in use |
| `INVALID_SKU_FORMAT` | 422 | SKU does not match required pattern |
| `WAREHOUSE_NAME_DUPLICATE` | 409 | Warehouse with this name already exists |
| `LOCATION_NAME_DUPLICATE` | 409 | Location name already exists in this warehouse |

### Business Rule Errors

| Code | HTTP | Trigger |
|---|---|---|
| `INSUFFICIENT_STOCK` | 422 | Delivery or transfer qty exceeds available stock at source location |
| `OPERATION_LOCKED` | 423 | Cannot edit an operation in `done` or `canceled` status |
| `OPERATION_NOT_READY` | 423 | Cannot validate an operation not in `ready` status |
| `SAME_LOCATION_TRANSFER` | 422 | Source and destination location are the same |
| `EMPTY_OPERATION` | 422 | Attempting to validate an operation with no lines |
| `DUPLICATE_PRODUCT_LINE` | 422 | Same product listed twice in one operation |
| `CONCURRENCY_CONFLICT` | 409 | Optimistic lock version mismatch — concurrent edit detected |

### Infrastructure Errors

| Code | HTTP | Trigger |
|---|---|---|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests in time window |
| `SERVICE_UNAVAILABLE` | 503 | Downstream dependency (DB, Redis, email) temporarily unavailable |
| `INTERNAL_ERROR` | 500 | Unhandled exception — logged for engineering |

---

## Validation Error Detail Format

When `VALIDATION_ERROR` is returned, `details` contains field-level errors:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": [
        { "field": "sku", "message": "SKU must match format: XX-000" },
        { "field": "minimum_stock", "message": "Must be 0 or greater" }
      ]
    }
  }
}
```

---

## Client Error Handling Guidelines

Frontend should handle these cases:

| Scenario | Recommended UX Action |
|---|---|
| `401 TOKEN_EXPIRED` | Auto-refresh token; retry request transparently |
| `401 REFRESH_TOKEN_INVALID` | Clear session; redirect to /login |
| `403 FORBIDDEN` | Show "You don't have permission" message |
| `404 NOT_FOUND` | Show "This record no longer exists" message |
| `409 CONCURRENCY_CONFLICT` | Show "Someone else just updated this — please refresh" |
| `422 INSUFFICIENT_STOCK` | Highlight product line in red with current availability |
| `422 VALIDATION_ERROR` | Highlight failing fields with inline error messages |
| `423 OPERATION_LOCKED` | Gray out edit controls; show "This operation is complete" |
| `429 RATE_LIMIT_EXCEEDED` | Show "Too many requests — please wait a moment" |
| `500 INTERNAL_ERROR` | Show generic "Something went wrong" with retry option |

---

## Logging & Monitoring Integration

- All `500` errors: logged to Sentry with full stack trace and request context
- All `401` and `403` errors on sensitive endpoints: logged for security audit
- All `422 INSUFFICIENT_STOCK` events: logged with product_id and operation_id for operational review
