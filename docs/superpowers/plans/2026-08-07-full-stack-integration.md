# Full-Stack Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Next.js frontend with NestJS backend by fixing broken backend, building12 missing modules, creating frontend API layer, and connecting all pages to real APIs.

**Architecture:** Backend-first: fix AuthModule, build all NestJS modules with controller/service/DTO pattern, then create frontend API client, Zustand stores, React Query hooks, shared layout, and connect each page.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Redis, BullMQ, Next.js, React, Zustand, TanStack React Query, Axios, Tailwind CSS, Docker Compose

## Global Constraints

- Backend: NestJS v11, Prisma v7, PostgreSQL, Redis, Node.js 20
- Frontend: Next.js16, React19, TypeScript5, Tailwind CSS4
- Auth: JWT (15min access, 7day refresh), argon2id password hashing
- API format: `{ success, data, message, meta }` response envelope
- All modules follow: `<module>.module.ts`, `<module>.controller.ts`, `<module>.service.ts`, `dto/` directory
- Docker Compose for full stack: PostgreSQL, Redis, Backend, Frontend, Ollama (optional)

---

## Phase1: Backend Fix — AuthModule

### Task1: Create Auth Guards + Strategies

**Files:**
- Create: `backend/src/auth/guards/jwt-auth.guard.ts`
- Create: `backend/src/auth/guards/local-auth.guard.ts`
- Create: `backend/src/auth/strategies/jwt.strategy.ts`
- Create: `backend/src/auth/strategies/local.strategy.ts`
- Create: `backend/src/auth/strategies/refresh.strategy.ts`
- Modify: `backend/src/auth/auth.module.ts`

**Steps:**
1. Create `backend/src/auth/guards/` directory
2. Create `JwtAuthGuard` extending `AuthGuard('jwt')`
3. Create `LocalAuthGuard` extending `AuthGuard('local')`
4. Create `backend/src/auth/strategies/` directory
5. Create `JwtStrategy` — extracts Bearer token, loads user from DB via Prisma
6. Create `LocalStrategy` — validates email/password via `AuthService.validateUser()`
7. Create `RefreshTokenStrategy` — validates refresh tokens against Session table
8. Update `auth.module.ts` to import all new guards and strategies
9. Verify compilation: `cd backend && npx tsc --noEmit`
10. Commit: `feat: add JWT and Local auth guards and strategies`

---

### Task2: Fix AppModule Imports

**Files:**
- Modify: `backend/src/app.module.ts`

**Steps:**
1. Read current `app.module.ts` — it imports13 modules that don't exist
2. Remove or comment out non-existent module imports (keep only PrismaModule, AuthModule, AIModule)
3. Verify compilation: `cd backend && npx tsc --noEmit`
4. Verify app starts: `cd backend && npm run start:dev`
5. Commit: `fix: resolve AppModule import errors for compilation`

---

## Phase2: Backend Modules (Tasks3-14)

Each module follows the same pattern:
```
backend/src/<module>/
  <module>.module.ts      — NestJS module definition
  <module>.controller.ts  — REST endpoints with @UseGuards(JwtAuthGuard)
  <module>.service.ts     — Business logic + Prisma calls
  dto/
    create-<entity>.dto.ts
    update-<entity>.dto.ts
```

### Task3: UsersModule
- **Files:** `backend/src/users/` (module, controller, service, dto)
- **Endpoints:** `GET/PUT /users/me`, `GET /users`
- **Steps:** Create directory, DTOs, service (findById, update, findAll), controller, module. Verify compilation. Commit.

### Task4: BusinessModule
- **Files:** `backend/src/business/` (module, controller, service, dto)
- **Endpoints:** `GET/PUT /business/profile`
- **Steps:** Create directory, DTOs, service (getProfile, updateProfile with upsert), controller, module. Verify compilation. Commit.

### Task5: ProductsModule
- **Files:** `backend/src/products/` (module, controller, service, dto)
- **Endpoints:** `GET/POST /products`, `GET/PUT/DELETE /products/:id`, `POST /products/bulk`
- **Steps:** Create directory, DTOs, service (CRUD + bulkCreate), controller, module. Verify compilation. Commit.

### Task6: MediaModule
- **Files:** `backend/src/media/` (module, controller, service)
- **Endpoints:** `POST /media/upload`, `GET /media`, `DELETE /media/:id`
- **Dependencies:** `multer`, `sharp` for file upload and image processing
- **Steps:** Create directory, service (upload with Sharp processing, findAll, delete), controller with `@UseInterceptors(FileInterceptor('file'))`, module. Verify compilation. Commit.

### Task7: PostsModule
- **Files:** `backend/src/posts/` (module, controller, service, dto)
- **Endpoints:** `GET/POST /posts`, `GET/PUT/DELETE /posts/:id`, `POST /posts/:id/approve`, `POST /posts/:id/publish`
- **Steps:** Create directory, DTOs, service (CRUD + approve + publish status changes), controller, module. Verify compilation. Commit.

### Task8: SchedulerModule
- **Files:** `backend/src/scheduler/` (module, controller, service)
- **Endpoints:** `GET /scheduler/queue`, `POST /scheduler/schedule/:postId`
- **Steps:** Create directory, service (schedulePost, getQueue, cancelSchedule), controller, module. Verify compilation. Commit.

### Task9: TelegramModule
- **Files:** `backend/src/telegram/` (module, controller, service)
- **Endpoints:** `GET/PUT /telegram/settings`, `POST /telegram/test`
- **Dependencies:** `telegraf` for Telegram bot API
- **Steps:** Create directory, service (getSettings, updateSettings, testConnection), controller, module. Verify compilation. Commit.

### Task10: AnalyticsModule
- **Files:** `backend/src/analytics/` (module, controller, service)
- **Endpoints:** `GET /analytics/dashboard`, `GET /analytics/platform/:platform`
- **Steps:** Create directory, service (getDashboard with aggregation, getPlatformStats), controller, module. Verify compilation. Commit.

### Task11: NotificationsModule
- **Files:** `backend/src/notifications/` (module, controller, service)
- **Endpoints:** `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`
- **Steps:** Create directory, service (findAll, markRead, markAllRead, create), controller, module. Verify compilation. Commit.

### Task12: ExportsModule
- **Files:** `backend/src/exports/` (module, controller, service)
- **Endpoints:** `GET/POST /exports`, `GET /exports/:id/download`
- **Steps:** Create directory, service (create, findAll, findById, download), controller, module. Verify compilation. Commit.

### Task13: AdminModule
- **Files:** `backend/src/admin/` (module, controller, service)
- **Endpoints:** `GET /admin/stats`, `GET /admin/users`, `PUT /admin/users/:id`, `GET /admin/health`
- **Steps:** Create directory, service (getStats, getUsers, updateUser, getHealth), controller, module. Verify compilation. Commit.

### Task14: WebsocketsModule
- **Files:** `backend/src/websockets/` (module, gateway)
- **Dependencies:** `@nestjs/websockets`, `socket.io`
- **Steps:** Create directory, gateway with `@WebSocketGateway`, broadcast method, module. Verify compilation. Commit.

---

## Phase3: Wire Backend

### Task15: Update AppModule with All Modules

**Files:**
- Modify: `backend/src/app.module.ts`

**Steps:**
1. Add imports for all12 modules (Users, Business, Products, Media, Posts, Scheduler, Telegram, Analytics, Notifications, Exports, Admin, Websockets)
2. Verify compilation: `cd backend && npx tsc --noEmit`
3. Verify app starts: `cd backend && npm run start:dev`
4. Test API endpoints with curl/Postman:
   - `POST /auth/register` — register a user
   - `POST /auth/login` — login and get tokens
   - `GET /auth/me` — get profile with Bearer token
   - `GET /products` — get empty array
   - `POST /products` — create a product
   - `GET /products` — verify product exists
5. Commit: `feat: wire all12 modules into AppModule`

---

## Phase4: Frontend Integration

### Task16: Create API Client Layer

**Files:**
- Create: `frontend/lib/api.ts`
- Create: `frontend/.env.local`
- Modify: `frontend/package.json` (add axios dependency)

**Steps:**
1. Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
2. Install axios: `cd frontend && npm install axios`
3. Create `lib/api.ts` with:
   - Axios instance with base URL
   - Request interceptor: attach JWT Bearer token from localStorage
   - Response interceptor: auto-refresh on401, redirect to login on expiry
4. Verify file exists
5. Commit: `feat: add API client with auth interceptors`

---

### Task17: Create Zustand Stores

**Files:**
- Create: `frontend/stores/authStore.ts`
- Create: `frontend/stores/postsStore.ts`
- Create: `frontend/stores/productsStore.ts`
- Create: `frontend/stores/notificationsStore.ts`

**Steps:**
1. Create `stores/` directory
2. Create `authStore.ts` — user state, login/register/logout/loadUser actions using API client
3. Create `postsStore.ts` — posts list, fetchPosts, createPost, updatePost, deletePost
4. Create `productsStore.ts` — products list, fetchProducts, createProduct, updateProduct, deleteProduct
5. Create `notificationsStore.ts` — notifications, unreadCount, fetchNotifications, markRead, markAllRead
6. Verify files exist
7. Commit: `feat: add Zustand stores for auth, posts, products, notifications`

---

### Task18: Create React Query Hooks

**Files:**
- Create: `frontend/hooks/useAuth.ts`
- Create: `frontend/hooks/usePosts.ts`
- Create: `frontend/hooks/useProducts.ts`
- Create: `frontend/hooks/useAnalytics.ts`
- Create: `frontend/hooks/useBusiness.ts`
- Create: `frontend/hooks/useAdmin.ts`

**Steps:**
1. Create `hooks/` directory
2. Create `useAuth.ts` — useLogin, useRegister, useMe mutations/queries
3. Create `usePosts.ts` — usePosts, useCreatePost, useUpdatePost, useDeletePost with query invalidation
4. Create `useProducts.ts` — useProducts, useCreateProduct, useDeleteProduct with query invalidation
5. Create `useAnalytics.ts` — useDashboardMetrics, usePlatformStats queries
6. Create `useBusiness.ts` — useBusinessProfile, useUpdateBusinessProfile
7. Create `useAdmin.ts` — useAdminStats, useAdminUsers, useUpdateUser
8. Verify files exist
9. Commit: `feat: add React Query hooks for all modules`

---

### Task19: Create Shared Layout + Auth Guards

**Files:**
- Create: `frontend/components/AuthGuard.tsx`
- Create: `frontend/components/AdminGuard.tsx`
- Create: `frontend/components/Sidebar.tsx`
- Create: `frontend/app/(authenticated)/layout.tsx`

**Steps:**
1. Create `AuthGuard.tsx` — checks localStorage for token on mount, redirects to `/auth/login` if missing, shows loading spinner while checking
2. Create `AdminGuard.tsx` — checks user role, redirects non-admin to `/dashboard`
3. Create `Sidebar.tsx` — navigation links with icons (Dashboard, Posts, Products, Calendar, Analytics, AI Generate, Notifications, Exports, Settings, Logout)
4. Create `app/(authenticated)/layout.tsx` — wraps children with AuthGuard, includes Sidebar + main content area
5. Verify files exist
6. Commit: `feat: add shared authenticated layout with sidebar and auth guards`

---

### Task20: Move Pages to Authenticated Layout

**Files:**
- Move: All pages from `frontend/app/<page>/` to `frontend/app/(authenticated)/<page>/`
- Remove: Duplicate nav bars from each page (shared layout provides sidebar)

**Pages to move:**
- `dashboard/page.tsx`
- `posts/page.tsx`
- `products/page.tsx`
- `calendar/page.tsx`
- `analytics/page.tsx`
- `notifications/page.tsx`
- `exports/page.tsx`
- `ai/generate/page.tsx`
- `settings/business/page.tsx`
- `settings/telegram/page.tsx`
- `admin/page.tsx`
- `admin/users/page.tsx`
- `admin/models/page.tsx`

**Steps:**
1. Create `(authenticated)/` directory structure
2. Move all page files to new locations
3. Remove duplicate nav bars from each page
4. Verify pages load: `cd frontend && npm run dev`
5. Commit: `feat: move all pages to authenticated layout`

---

### Task21: Connect Dashboard to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/dashboard/page.tsx`

**Steps:**
1. Import `useDashboardMetrics` hook
2. Replace hardcoded metrics array with real API data
3. Handle loading and error states
4. Verify dashboard loads with real data
5. Commit: `feat: connect dashboard to real API data`

---

### Task22: Connect Posts to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/posts/page.tsx`

**Steps:**
1. Import `usePosts` and `useCreatePost` hooks
2. Replace hardcoded posts array with real API data
3. Connect AI generation modal to `useCreatePost`
4. Handle loading and error states
5. Verify posts page works
6. Commit: `feat: connect posts page to real API data`

---

### Task23: Connect Products to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/products/page.tsx`

**Steps:**
1. Import `useProducts` and `useCreateProduct` hooks
2. Replace hardcoded products array with real API data
3. Connect bulk upload modal to API
4. Handle loading and error states
5. Verify products page works
6. Commit: `feat: connect products page to real API data`

---

### Task24: Connect Calendar to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/calendar/page.tsx`

**Steps:**
1. Import `usePosts` hook
2. Filter posts by `scheduledFor` date to show on calendar
3. Handle loading and error states
4. Verify calendar shows real scheduled posts
5. Commit: `feat: connect calendar page to real API data`

---

### Task25: Connect Analytics to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/analytics/page.tsx`

**Steps:**
1. Import `useDashboardMetrics` and `usePlatformStats` hooks
2. Replace hardcoded analytics with real data
3. Connect Recharts to real metrics
4. Handle loading and error states
5. Verify analytics page works
6. Commit: `feat: connect analytics page to real API data`

---

### Task26: Connect Settings to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/settings/business/page.tsx`
- Modify: `frontend/app/(authenticated)/settings/telegram/page.tsx`

**Steps:**
1. Import `useBusinessProfile` and `useUpdateBusinessProfile` hooks
2. Replace `alert()` on save with real API call
3. Create `useTelegram` hook for telegram settings
4. Connect telegram settings page to real API
5. Verify settings save to database
6. Commit: `feat: connect settings pages to real API data`

---

### Task27: Connect Admin to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/admin/page.tsx`
- Modify: `frontend/app/(authenticated)/admin/users/page.tsx`

**Steps:**
1. Import `useAdminStats` and `useAdminUsers` hooks
2. Replace hardcoded stats/users with real data
3. Connect user management actions to API
4. Verify admin pages work
5. Commit: `feat: connect admin pages to real API data`

---

### Task28: Connect Notifications to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/notifications/page.tsx`

**Steps:**
1. Import `useNotifications` hook (create if needed)
2. Replace hardcoded notifications with real API data
3. Connect mark-read actions to API
4. Verify notifications page works
5. Commit: `feat: connect notifications page to real API data`

---

### Task29: Connect Exports to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/exports/page.tsx`

**Steps:**
1. Import `useExports` hook (create if needed)
2. Replace hardcoded exports with real API data
3. Connect export creation to API
4. Verify exports page works
5. Commit: `feat: connect exports page to real API data`

---

### Task30: Connect AI Generate to Real Data

**Files:**
- Modify: `frontend/app/(authenticated)/ai/generate/page.tsx`

**Steps:**
1. Import AI generation API calls
2. Replace simulated `setTimeout` with real API calls to `/ai/generate-post`
3. Connect to `useCreatePost` to save generated content
4. Verify AI generation works with Ollama
5. Commit: `feat: connect AI generate page to real API`

---

## Phase5: Testing

### Task31: Backend Unit Tests

**Files:**
- Create: `backend/src/**/*.spec.ts` (test files for each service)

**Steps:**
1. Create test files for each service with mocked Prisma
2. Test each service method independently
3. Run: `cd backend && npm run test`
4. Fix any failures
5. Commit: `feat: add backend unit tests`

---

### Task32: Backend Integration Tests

**Files:**
- Create: `backend/test/*.e2e-spec.ts`

**Steps:**
1. Create e2e test files for each controller endpoint
2. Use `supertest` to test HTTP requests
3. Run: `cd backend && npm run test:e2e`
4. Fix any failures
5. Commit: `feat: add backend integration tests`

---

### Task33: Frontend Component Tests

**Files:**
- Create: `frontend/__tests__/*.test.tsx`

**Steps:**
1. Create test files for key components
2. Use React Testing Library
3. Run: `cd frontend && npm run test`
4. Fix any failures
5. Commit: `feat: add frontend component tests`

---

### Task34: Docker Compose Verification

**Files:**
- Review: `docker-compose.yml`

**Steps:**
1. Start full stack: `docker compose up -d`
2. Wait for all services to be healthy
3. Verify backend starts: `curl http://localhost:3001`
4. Verify frontend starts: `curl http://localhost:3000`
5. Test auth flow: register → login → dashboard
6. Test CRUD: create product, create post, view analytics
7. Stop stack: `docker compose down`
8. Commit: `feat: verify Docker Compose stack works end-to-end`

---

### Task35: Final Verification Checklist

**Steps:**
1. Backend compiles and starts without errors
2. All API endpoints return proper responses
3. Auth flow works end-to-end (register → login → token refresh → logout)
4. Frontend loads with real data (no hardcoded arrays)
5. All CRUD operations work for each module
6. WebSocket connection established
7. Docker Compose stack runs successfully
8. All tests pass
9. Commit: `feat: complete full-stack integration`
