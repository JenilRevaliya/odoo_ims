# CoreInventory — Authentication

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Authentication Strategy Overview

CoreInventory uses **JWT (JSON Web Token)** based stateless authentication combined with **OTP-based password reset**.

| Component | Technology | Purpose |
|---|---|---|
| Password hashing | bcrypt (cost factor 12) | Store passwords securely |
| Access token | JWT, HS256 or RS256 | Authenticate API requests |
| Refresh token | Opaque token stored in Redis | Issue new access tokens without re-login |
| OTP | 6-digit numeric, hashed with bcrypt | Secure password reset |
| Session storage | Redis | Token blacklisting + OTP storage |

---

## Token Lifecycle

### Access Token
- **Algorithm:** HS256 (or RS256 for asymmetric verification)
- **TTL:** 15 minutes
- **Storage:** Client memory (never `localStorage` — XSS risk)
- **Transported via:** `Authorization: Bearer <token>` header

### Refresh Token
- **Format:** Opaque random string (UUID v4), hashed before storage
- **TTL:** 7 days
- **Storage server-side:** Redis (`refresh:{userId}` → hashed token)
- **Transported via:** `httpOnly`, `Secure`, `SameSite=Strict` cookie
- **Rotation:** Refresh token rotated on every use (old one invalidated)

### Token Refresh Flow

```
1. Client makes API request with expired access token
2. Server returns 401 TOKEN_EXPIRED
3. Client's interceptor automatically calls POST /auth/refresh
4. Server reads refresh token from httpOnly cookie
5. Server verifies hash against Redis
6. Server issues new access_token + rotates refresh_token
7. Client retries original request with new access_token
```

---

## JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "name": "Ravi Sharma",
  "role": "manager",
  "iat": 1710394800,
  "exp": 1710395700
}
```

**Security rules:**
- `algorithm` is always explicitly set — do not accept `"alg": "none"`
- Signature verified on every request, not just decoded
- `exp` claim checked before accepting the token

---

## OTP Password Reset

### OTP Properties
- **Length:** 6 digits
- **Generation:** Cryptographically random (`crypto.randomInt()`)
- **Storage:** bcrypt hash in Redis with 15-minute TTL
- **Use limit:** Single use — marked as consumed on first successful verification
- **Attempt limit:** 3 failed verification attempts → token invalidated

### OTP Email Template

```
Subject: Your CoreInventory Password Reset Code

Hi [Name],

Your one-time password reset code is:

  482 910

This code expires in 15 minutes.
If you did not request this, you can ignore this email.

— CoreInventory Security Team
```

---

## Logout

On logout:
1. Client sends `POST /auth/logout` with refresh token cookie
2. Server deletes `refresh:{userId}` from Redis
3. Server returns `204 No Content`
4. Client clears access token from memory and redirects to `/login`

---

## Security Hardening

| Measure | Implementation |
|---|---|
| HTTPS enforced | HSTS header: `Strict-Transport-Security: max-age=31536000` |
| CORS restricted | Only allowed origins in production |
| Cookie flags | `httpOnly`, `Secure`, `SameSite=Strict` on refresh token cookie |
| Brute force protection | 10 req/min rate limit on `/auth/*` based on IP |
| Account lockout | 5 failed login attempts → account locked for 30 minutes |
| OTP enumeration prevention | Same 200 response regardless of whether email exists |
| Timing attack prevention | `bcrypt.compare()` used (constant-time comparison) |

---

## Auth Middleware Implementation (Pseudocode)

```typescript
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'TOKEN_MISSING' } });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { code: 'TOKEN_EXPIRED' } });
    }
    return res.status(401).json({ error: { code: 'TOKEN_INVALID' } });
  }
}

function requireRole(role: string) {
  return (req, res, next) => {
    if (req.user.role !== role && req.user.role !== 'manager') {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }
    next();
  };
}
```
