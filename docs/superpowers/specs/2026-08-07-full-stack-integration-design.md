# Full-Stack Integration Design — Aether SMM

**Date:** 2026-08-07
**Status:** Approved
**Approach:** Backend-First, Top-Down

## Overview

Integrate the Next.js frontend with the NestJS backend, building all12 missing backend modules and connecting all14 frontend pages to real APIs. Test end-to-end with Docker Compose stack (PostgreSQL, Redis, Ollama).

## Current State

### Backend
- `AppModule` imports13 modules that don't exist on disk
- `AuthModule` references4 missing files (guards/strategies)
- Application **will not compile**
- Only8 endpoints exist: auth (5) + AI (5)
- Prisma schema has20+ models but they're unused

### Frontend
- 14 pages with hardcoded static data
- Zero API calls, no auth, no state management
- No shared layout — each page recreates its own nav bar
- No route protection

---

## Section1: Backend Fix + Module Structure

### Step1: Fix AuthModule

Create missing files:
- `src/auth/guards/jwt-auth.guard.ts` — Extends `AuthGuard('jwt')`
- `src/auth/guards/local-auth.guard.ts` — Extends `AuthGuard('local')`
- `src/auth/strategies/local.strategy.ts` — Validates email/password against DB
- `src/auth/strategies/jwt.strategy.ts` — Extracts Bearer token, loads user
- `src/auth/strategies/refresh.strategy.ts` — Validates refresh tokens

### Step2: Build13 Missing Modules

Each module follows pattern:
```
src/<module>/
  <module>.module.ts
  <module>.controller.ts
  <module>.service.ts
  dto/
    create-<entity>.dto.ts
    update-<entity>.dto.ts
```

**Module list (dependency order):**
1. UsersModule — `/users` (CRUD, profile)
2. BusinessModule — `/business` (business profile, brand settings)
3. ProductsModule — `/products` (product catalog, bulk upload)
4. MediaModule — `/media` (file upload, Sharp processing)
5. PostsModule — `/posts` (content CRUD, scheduling, status workflow)
6. SchedulerModule — `/scheduler` (Bull queue for timed publishing)
7. TelegramModule — `/telegram` (Telegram bot, approval flow)
8. AnalyticsModule — `/analytics` (metrics collection, aggregation)
9. NotificationsModule — `/notifications` (in-app notifications)
10. ExportsModule — `/exports` (CSV/Excel/PDF generation)
11. AdminModule — `/admin` (user management, system health)
12. WebsocketsModule — `/ws` (real-time events via Socket.IO)

### Step3: Update AppModule

Import all new modules properly. Remove non-existent imports or replace with actual module paths.

---

## Section2: Frontend Architecture

### Step1: API Client Layer — `lib/api.ts`

- Axios instance with `NEXT_PUBLIC_API_URL` base
- Request interceptor: attach JWT Bearer token from localStorage
- Response interceptor: auto-refresh on401, redirect to login on expiry
- Typed helper functions: `get()`, `post()`, `put()`, `delete()`

### Step2: Zustand Stores

- `stores/authStore.ts` — user, tokens, login/logout/register actions
- `stores/postsStore.ts` — posts list, CRUD, status changes
- `stores/productsStore.ts` — products list, CRUD
- `stores/analyticsStore.ts` — metrics, charts data
- `stores/notificationsStore.ts` — notifications, mark read
- `stores/uiStore.ts` — sidebar state, theme, modals

### Step3: React Query Hooks

- `hooks/useAuth.ts` — useLogin, useRegister, useLogout, useMe
- `hooks/usePosts.ts` — usePosts, useCreatePost, useUpdatePost, useDeletePost
- `hooks/useProducts.ts` — useProducts, useCreateProduct, useBulkUpload
- `hooks/useAnalytics.ts` — useDashboardMetrics, usePlatformStats
- `hooks/useBusiness.ts` — useBusinessProfile, useUpdateProfile
- `hooks/useNotifications.ts` — useNotifications, useMarkRead
- `hooks/useExports.ts` — useExports, useCreateExport

### Step4: Shared Authenticated Layout — `app/(authenticated)/layout.tsx`

- Sidebar navigation (collapsible)
- Top nav bar with user avatar, notifications bell
- Mobile responsive via MobileNav component
- All authenticated pages route through this layout

### Step5: Route Protection — Client-Side Auth Guard

Next.js middleware runs on the server edge and cannot access localStorage. Instead:

- Create `components/AuthGuard.tsx` — wraps authenticated layouts, checks localStorage for token on mount, redirects to `/auth/login` if missing
- Create `components/AdminGuard.tsx` — checks user role from auth store, redirects non-admin to `/dashboard`
- Wrap `app/(authenticated)/layout.tsx` with `AuthGuard`
- Wrap `app/admin/layout.tsx` with `AuthGuard` + `AdminGuard`

### Step6: Connect Each Page

- Dashboard → useDashboardMetrics hook
- Posts → usePosts hook + useCreatePost for AI generation
- Products → useProducts hook + useBulkUpload
- Calendar → usePosts hook filtered by date
- Analytics → useAnalytics hook + Recharts
- Settings → useBusinessProfile + useUpdateProfile
- Admin → useAdmin hooks (users, models, health)

---

## Section3: Authentication & Authorization Flow

### Registration
1. User fills form (name, email, password) → `POST /auth/register`
2. Backend hashes password (argon2id), creates user, generates JWT pair
3. Frontend stores tokens in localStorage, redirects to `/dashboard`
4. Subsequent requests include `Authorization: Bearer <access_token>`

### Login
1. User fills form (email, password) → `POST /auth/login`
2. Backend validates via `LocalStrategy`, generates JWT pair
3. Frontend stores tokens, loads user via `GET /auth/me`, redirects to `/dashboard`

### Token Refresh
1. Access token expires (15min) → frontend gets401
2. Frontend interceptor automatically calls `POST /auth/refresh` with refresh token
3. Backend validates refresh token, issues new pair
4. Frontend retries original request with new access token

### Logout
1. User clicks logout → `POST /auth/logout`
2. Backend deletes session from DB
3. Frontend clears tokens, redirects to `/auth/login`

### Role-Based Access
- Admin routes (`/admin/*`) check user role via `GET /auth/me`
- Non-admin users redirected to `/dashboard`
- Backend guards validate JWT + role on protected endpoints

---

## Section4: Data Flow & API Contracts

### API Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "optional success message",
  "meta": { "page": 1, "limit": 10, "total": 100 }
}
```

### Key API Endpoints

**Users:** `GET/PUT /users/me`, `GET /users` (admin)
**Business:** `GET/PUT /business/profile`
**Products:** `GET/POST /products`, `GET/PUT/DELETE /products/:id`, `POST /products/bulk`
**Media:** `POST /media/upload`, `GET /media`, `DELETE /media/:id`
**Posts:** `GET/POST /posts`, `GET/PUT/DELETE /posts/:id`, `POST /posts/:id/approve`, `POST /posts/:id/publish`
**Scheduler:** `GET /scheduler/queue`, `POST /scheduler/schedule/:postId`
**Telegram:** `GET/PUT /telegram/settings`, `POST /telegram/test`
**Analytics:** `GET /analytics/dashboard`, `GET /analytics/platform/:platform`, `GET /analytics/export`
**Notifications:** `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`
**Exports:** `GET/POST /exports`, `GET /exports/:id/download`
**Admin:** `GET /admin/stats`, `GET /admin/users`, `PUT /admin/users/:id`, `GET /admin/health`

### Frontend Data Flow
```
User Action → React Query Hook → API Client → Backend Endpoint → Prisma → PostgreSQL
                ↓
         Zustand Store (cache)
                ↓
         UI Re-render
```

### Real-time Updates
- WebSocket connection on auth: `ws://localhost:3001`
- Events: `post:created`, `post:updated`, `notification:new`, `analytics:updated`
- Frontend subscribes via `useWebSocket` hook, updates stores

---

## Section5: Testing Strategy

### Backend Testing
1. **Unit tests** — Each service method with mocked Prisma
2. **Integration tests** — Each controller endpoint with real DB
3. **E2E tests** — Full request lifecycle with `supertest`
4. **Guard tests** — JWT validation, role-based access

### Frontend Testing
1. **Component tests** — React Testing Library for each page component
2. **Hook tests** — Custom hooks with `renderHook`
3. **Integration tests** — Full page render with mocked API responses
4. **E2E tests** — Playwright/Cypress for critical flows

### Docker Compose Test Stack
```yaml
services:
  postgres:    # Test database
  redis:       # Job queue
  backend:     # NestJS app
  frontend:    # Next.js app
  ollama:      # AI (optional, can mock)
```

### Test Commands
```bash
# Backend
cd backend && npm run test
cd backend && npm run test:e2e

# Frontend
cd frontend && npm run test

# Full stack
docker compose up -d
```

### Verification Checklist
- [ ] Backend compiles and starts without errors
- [ ] All API endpoints return proper responses
- [ ] Auth flow works end-to-end
- [ ] Frontend loads with real data
- [ ] All CRUD operations work for each module
- [ ] WebSocket connection established
- [ ] Docker Compose stack runs successfully

---

## Scope

This design covers:
- Fixing the broken backend (AuthModule guards/strategies)
- Building all13 missing NestJS modules
- Creating the frontend API integration layer
- Connecting all14 frontend pages to real APIs
- End-to-end testing with Docker Compose

This design does NOT cover:
- Social platform API integration (Instagram, Facebook, etc.) — requires OAuth credentials
- Telegram bot integration — requires bot token
- AI image generation via ComfyUI/Automatic1111 — optional
- Mobile PWA
- Multi-tenant support

---

## Success Criteria

1. `docker compose up -d` starts the full stack without errors
2. User can register, login, and see real dashboard data
3. All CRUD operations work for products, posts, business profile
4. AI content generation works via Ollama
5. All API endpoints return proper responses with validation
6. Frontend shows real data instead of hardcoded arrays
7. Backend test suite passes
8. Frontend test suite passes
