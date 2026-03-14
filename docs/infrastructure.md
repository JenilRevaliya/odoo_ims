# CoreInventory — Infrastructure & Deployment

> **Version:** 1.0.0 | **Date:** 2026-03-14

---

## Infrastructure Overview

CoreInventory is deployed as a **containerized web application** with a PostgreSQL database and Redis cache.

For MVP (v1.0), the infrastructure is optimized for low operational overhead using managed services. It is designed to scale horizontally without architectural changes.

---

## Infrastructure Components

| Component | MVP (v1.0) | Production Ready (v2.0) |
|---|---|---|
| Frontend | Vercel (Next.js) | Vercel / Cloudflare Pages |
| API Server | Railway / Render (Docker) | AWS ECS / GCP Cloud Run |
| Database | Render PostgreSQL | AWS RDS PostgreSQL (Multi-AZ) |
| Cache | Upstash Redis | AWS ElastiCache / Redis Cloud |
| DNS + CDN | Cloudflare | Cloudflare |
| Email | SendGrid | SendGrid / AWS SES |
| Backups | Automated (daily) | S3 / GCS encrypted |
| Monitoring | UptimeRobot + Sentry | Grafana + Prometheus + Sentry |

---

## Deployment Architecture Diagram

```mermaid
graph TD
    DNS[DNS\ncloudflare.com] --> CF[Cloudflare\nCDN + WAF + DDoS]
    CF --> FE[Frontend\nVercel Edge Network]
    CF --> LB[Load Balancer\nNginx / AWS ALB]
    LB --> API1[API Instance 1\nDocker: Node.js]
    LB --> API2[API Instance 2\nDocker: Node.js]
    API1 --> PG_P[(PostgreSQL Primary\nPort 5432)]
    API2 --> PG_P
    PG_P --> PG_R[(PostgreSQL Read Replica\nRead-heavy analytics)]
    API1 --> REDIS[(Redis Cluster\nPort 6379)]
    API2 --> REDIS
    API1 --> SMTP[SendGrid API]
    PG_P --> S3[(S3 Backup Bucket\nAES-256 encrypted)]
    API1 --> SENTRY[Sentry\nError Tracking]
```

---

## Environment Configuration

### Environment Files

| File | Purpose |
|---|---|
| `.env.development` | Local development settings |
| `.env.staging` | Staging environment |
| `.env.production` | Production settings (never committed) |

### Required Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://coreinventory.io

# Database
DATABASE_URL=postgresql://user:pass@host:5432/coreinventory

# Redis
REDIS_URL=redis://user:pass@host:6379

# JWT
JWT_SECRET=<256-bit-random-secret>
JWT_ACCESS_TTL=900        # 15 minutes in seconds
JWT_REFRESH_TTL=604800    # 7 days in seconds

# Email
SENDGRID_API_KEY=<key>
EMAIL_FROM=noreply@coreinventory.io

# Security
BCRYPT_SALT_ROUNDS=12
CORS_ALLOWED_ORIGINS=https://coreinventory.io
```

> All secrets managed via CI/CD environment variable store or AWS Secrets Manager.  
> **Never commit secrets to version control.**

---

## Docker Configuration

### `Dockerfile` (API)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -q -O /dev/null http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

### `docker-compose.yml` (Development)

```yaml
version: '3.9'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file: .env.development
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: coreinventory_dev
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## Backup Strategy

| Data | Frequency | Method | Retention |
|---|---|---|---|
| PostgreSQL full backup | Daily at 02:00 UTC | `pg_dump` → gzip → S3 | 30 days |
| PostgreSQL WAL streaming | Continuous | `pg_basebackup` / managed WAL | 7 days |
| Redis snapshot (RDB) | Every 1 hour | Redis `SAVE` or managed service | 24 hours |

**Backup encryption:** AES-256 server-side encryption on S3/GCS.

**Backup test:** Monthly restoration test to a staging environment — must complete without errors.

---

## Health Check Endpoint

```http
GET /health

Response 200:
{
  "status": "healthy",
  "db": "connected",
  "redis": "connected",
  "uptime_seconds": 86400
}

Response 503 (if any dependency down):
{
  "status": "degraded",
  "db": "connected",
  "redis": "disconnected"
}
```

Used by load balancer to route traffic only to healthy instances.

---

## Scaling Plan

| Load Level | Action |
|---|---|
| < 50 concurrent users | Single API instance (current) |
| 50–200 concurrent users | 2–4 API instances behind load balancer |
| 200+ concurrent users | DB read replica + Redis cluster + auto-scaling |
| 500+ concurrent users | Consider module extraction to independent services |
