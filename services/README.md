# Microservices — Barangay 178 Safety Campaign System

This directory contains all the independent microservices that replace the original Laravel monolith.

## Architecture Overview

```
Internet
    │
    ▼
┌─────────────────────────────────┐
│     Nginx API Gateway :8080     │  routes by path prefix
└──┬──────┬──────┬──────┬────────┘
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
auth   campaign content workflow notification
svc     svc      svc     svc      svc
:8001  :8002    :8003   :8004    :3001
(PHP)  (PHP)    (PHP)   (PHP)   (Node)
   │      │      │      │
   └──────┴──────┴──┬───┘
                    │
              ┌─────▼──────┐
              │  PostgreSQL │  (shared Supabase DB)
              │   :5432     │
              └─────────────┘
```

## Services

| Directory | Port | Tech | Domain |
|---|---|---|---|
| [`api-gateway/`](api-gateway/) | 8080 | Nginx | Reverse proxy / routing |
| [`auth-service/`](auth-service/) | 8001 | Laravel 13 + Sanctum | Auth: login, register, me, logout |
| [`campaign-service/`](campaign-service/) | 8002 | Laravel 13 | Campaign CRUD + approval workflow |
| [`content-service/`](content-service/) | 8003 | Laravel 13 | Content CRUD per campaign |
| [`workflow-service/`](workflow-service/) | 8004 | Laravel 13 | SLA metrics + escalation checks |
| [`notification-service/`](notification-service/) | 3001 | Node.js + Express | Async bulk SMS (iProg + Semaphore) |
| [`shared/`](shared/) | — | — | Shared nginx config |

## Running All Services

### With Docker Compose (recommended)

```bash
# From the repo root
cp .env.example .env
# Edit .env with your secrets

docker compose up --build
```

Services will be available at:
- **API Gateway**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Individual service development

Each service can run standalone:

```bash
# Auth Service
cd services/auth-service
cp .env.example .env
composer install
php artisan key:generate
php artisan serve --port=8001

# Notification Service
cd services/notification-service
cp .env.example .env
npm install
npm run dev
```

## API Routes (via Gateway)

All requests go to `http://localhost:8080`:

```
# Auth
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me                 (Bearer token required)
POST   /api/auth/logout             (Bearer token required)

# Campaigns
GET    /api/campaigns               (Bearer token required)
POST   /api/campaigns               (Bearer token required)
GET    /api/campaigns/{id}          (Bearer token required)
PUT    /api/campaigns/{id}          (Bearer token required)
DELETE /api/campaigns/{id}          (Bearer token required)
GET    /api/campaigns/approved      (Bearer token required)
GET    /api/campaigns/resident-phone-numbers  (Bearer token required)

# Content
GET    /api/contents                (Bearer token required)
POST   /api/contents                (Bearer token required)
GET    /api/contents/{id}           (Bearer token required)
PUT    /api/contents/{id}           (Bearer token required)
DELETE /api/contents/{id}           (Bearer token required)
GET    /api/campaigns/{id}/contents (Bearer token required)

# Workflow / Process Monitoring
GET    /api/workflow/metrics
POST   /api/workflow/escalation-check

# Notifications / SMS
POST   /api/notifications/sms/send
POST   /api/notifications/sms/bulk
GET    /api/notifications/sms/balance
```

## Frontend Integration

Use the `apiGateway.js` client in `frontend/src/lib/apiGateway.js`:

```js
import { campaignApi, notificationApi, workflowApi } from '@/lib/apiGateway';

// List campaigns
const campaigns = await campaignApi.list({ status: 'published' });

// Bulk SMS
const result = await notificationApi.bulkSMS({
  phone_numbers: ['09171234567', '09281234567'],
  campaign_title: 'Typhoon Safety Reminder',
  campaign_description: 'Please prepare emergency supplies.',
});

// Workflow metrics
const metrics = await workflowApi.getMetrics();
```

## Adding a New Microservice

1. Create `services/<service-name>/` directory
2. Add `routes/api.php`, `app/Http/Controllers/`, `Dockerfile`, `.env.example`
3. Add upstream + location block to `services/api-gateway/nginx.conf`
4. Add service to `docker-compose.yml`
5. Add API module to `frontend/src/lib/apiGateway.js`
