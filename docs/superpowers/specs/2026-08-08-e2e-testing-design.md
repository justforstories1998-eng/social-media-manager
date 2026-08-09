# E2E Testing Design Specification

## Overview

Implement comprehensive end-to-end testing for the Aether Social Media Management Platform using Playwright. Tests will cover the complete user journey from registration through analytics.

## Goals

- Full E2E flow testing for all user-facing features
- Modular page objects for maintainability
- Parallel test execution
- CI-ready configuration

## Architecture

### Project Structure

```
e2e/
├── playwright.config.ts
├── fixtures/
│   ├── auth.fixture.ts          # Login helper, test user creation
│   └── base.fixture.ts          # Shared test context
├── page-objects/
│   ├── AuthPage.ts              # Login/Register pages
│   ├── DashboardPage.ts         # Dashboard interactions
│   ├── PostsPage.ts             # Posts CRUD
│   ├── ProductsPage.ts          # Products management
│   ├── AIPage.ts                # AI content generation
│   └── AnalyticsPage.ts         # Analytics dashboard
├── tests/
│   ├── auth.spec.ts             # Register, login, logout
│   ├── posts.spec.ts            # Create, edit, delete, schedule
│   ├── products.spec.ts         # Upload, manage products
│   ├── ai-content.spec.ts       # Generate captions/hashtags
│   ├── analytics.spec.ts        # Dashboard metrics
│   └── full-flow.spec.ts        # Complete user journey
└── utils/
    └── test-helpers.ts          # API calls, data factories
```

### Page Objects

Each page object encapsulates selectors and actions for a specific page:

```typescript
// PostsPage.ts
class PostsPage {
  constructor(private page: Page) {}
  
  async navigate() { /* go to /posts */ }
  async createPost(data: PostData) { /* fill form, submit */ }
  async editPost(id: string, data: Partial<PostData>) { /* edit post */ }
  async deletePost(id: string) { /* delete post */ }
  async getPostCount(): Promise<number> { /* count posts */ }
}
```

### Fixtures

```typescript
// base.fixture.ts
const test = base.extend<{ authPage: AuthPage }>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
});

// auth.fixture.ts - auto-login fixture
const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    // Login via API, store token
    await use(page);
    await context.close();
  },
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Test Flows

### 1. Authentication (`auth.spec.ts`)

| Test | Steps | Expected |
|------|-------|----------|
| Register new user | Fill form → submit | Redirect to dashboard |
| Login valid credentials | Enter email/password → submit | Dashboard loads |
| Login invalid credentials | Enter wrong password → submit | Error message shown |
| Logout | Click logout → confirm | Redirect to login |

### 2. Posts Management (`posts.spec.ts`)

| Test | Steps | Expected |
|------|-------|----------|
| Create post | Fill form → submit | Post appears in list |
| Edit post | Click edit → modify → save | Changes reflected |
| Delete post | Click delete → confirm | Post removed |
| Schedule post | Set date → save | Shows scheduled status |

### 3. Products Management (`products.spec.ts`)

| Test | Steps | Expected |
|------|-------|----------|
| Add product | Fill form → submit | Product in library |
| Edit product | Click edit → modify → save | Changes saved |
| Delete product | Click delete → confirm | Product removed |

### 4. AI Content Generation (`ai-content.spec.ts`)

| Test | Steps | Expected |
|------|-------|----------|
| Generate caption | Enter prompt → generate | Caption returned |
| Generate hashtags | Enter prompt → generate | Hashtags returned |
| Platform-specific | Select platform → generate | Content tailored |

### 5. Analytics Dashboard (`analytics.spec.ts`)

| Test | Steps | Expected |
|------|-------|----------|
| Dashboard loads | Navigate to analytics | Metrics display |
| Charts render | Wait for chart load | No errors, charts visible |

### 6. Full User Journey (`full-flow.spec.ts`)

Complete flow test:
1. Register new account
2. Complete business profile
3. Add a product
4. Generate AI post
5. Schedule post
6. View analytics

## Test Data Strategy

- Create unique users per run: `test-${Date.now()}@example.com`
- Seed data via API calls (faster than UI)
- Cleanup after tests via API

## Environment Setup

### Local Development

```bash
# Start servers
npm run dev:frontend &
npm run dev:backend &

# Wait for ready
npx wait-on http://localhost:3000 http://localhost:3001

# Run tests
npx playwright test
```

### CI Integration

GitHub Actions workflow:
1. Checkout code
2. Start Docker Compose services
3. Run database migrations
4. Execute Playwright tests
5. Upload test reports as artifacts

## Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.50.0"
  }
}
```

## Success Criteria

- [ ] All auth flows tested
- [ ] All CRUD operations tested
- [ ] AI generation tested
- [ ] Analytics tested
- [ ] Full user journey tested
- [ ] Tests run in parallel
- [ ] CI pipeline configured
