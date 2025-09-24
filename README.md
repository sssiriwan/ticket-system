# Ticket System – Local Dev Guide (Docker: DB + Redis)

## 1) Prerequisites

 -Node.js (v18+ recommended)
 -pnpm
 -Docker & Docker Compose

## 2) Start Database & Redis with Docker
Your docker-compose.yml already defines db and redis. No changes needed if you only run these two services.

Start services:
```bash
docker compose up -d db redis
```

Check status:
```bash
docker compose ps
```

Ports:
-Postgres → localhost:55432
-Redis → localhost:6379

## 3) Environment Variables
### 3.1 API – apps/api/.env
```env
# Database (host port 55432 from docker-compose)
DATABASE_URL=postgresql://app:app@localhost:55432/tickets

# Redis (local)
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=supersecret_change_me
JWT_EXPIRES_IN=1d

# Nest
PORT=3001
NODE_ENV=development
```
### 3.2 Web – apps/web/.env
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NODE_ENV=development
```
If .env files don’t exist, copy from .env.example and adjust as above.

## 4) Install Dependencies

Run from the repo root:
```bash
pnpm install
```
## 5) Database Setup (Prisma)

From repo root (or cd apps/api first):
```bash
# Create tables from Prisma schema
pnpm --filter api prisma migrate dev

# (Optional) Regenerate Prisma Client
pnpm --filter api prisma generate

# Seed sample data (includes 50 tickets)
pnpm --filter api seed
```
If you see a Node types error during seeding, ensure your Prisma seed tsconfig includes:
```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```
## 6) Run Apps
### 6.1 API (NestJS)
```bash
pnpm --filter api start:dev
```
API runs at: http://localhost:3001

### 6.2 Web (Next.js)
Open a second terminal:
```bash
pnpm --filter web dev
```
Web runs at: http://localhost:3000

## 7) Quick Testing
### 7.1 Tickets CRUD (Postman/HTTP)

Create
```http
POST http://localhost:3001/tickets
Content-Type: application/json

{
  "title": "Broken login button",
  "description": "Button on homepage is unclickable",
  "priority": "HIGH"
}
```

List (with filters, pagination, sorting)
```http
GET http://localhost:3001/tickets?status=OPEN&priority=HIGH&page=1&pageSize=10&sortBy=createdAt&sortOrder=desc
```

Get by ID
```http
GET http://localhost:3001/tickets/:id
```

Update (e.g., status)
```http
PATCH http://localhost:3001/tickets/:id
Content-Type: application/json

{ "status": "RESOLVED" }
```

Delete
```http
DELETE http://localhost:3001/tickets/:id
```
### 7.2 Queue Metrics
```http
GET http://localhost:3001/admin/queues/notify/stats
GET http://localhost:3001/admin/queues/sla/stats
```
#### Behavior:
- On POST /tickets:
    - Enqueues notify job with retry + backoff (jobId=notify:{ticketId})
    - Enqueues sla job with 15-min delay (jobId=sla:{ticketId})
- On PATCH /tickets/:id with status=RESOLVED:
    - Removes the pending sla job for that ticket

### 7.3 Web Pages
- /tickets — list with filter/search/sort/pagination
- /tickets/create — create a new ticket
- /tickets/[id] — detail page with edit/delete/status controls

## Troubleshooting
- Prisma client not generated → pnpm --filter api prisma generate
- DB connection issues → verify docker compose ps, host port 55432, and DATABASE_URL
- No queue logs → ensure Redis is running and check API logs (processors should log when jobs run)
- CORS errors (if any) → enable CORS in Nest main.ts (e.g., app.enableCors())