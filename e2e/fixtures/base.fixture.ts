import { test as base } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { PostsPage } from '../page-objects/PostsPage';
import { ProductsPage } from '../page-objects/ProductsPage';
import { AIPage } from '../page-objects/AIPage';
import { AnalyticsPage } from '../page-objects/AnalyticsPage';
import { createTestUser, loginTestUser } from '../utils/test-helpers';

export const test = base.extend<{
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  postsPage: PostsPage;
  productsPage: ProductsPage;
  aiPage: AIPage;
  analyticsPage: AnalyticsPage;
  authenticatedPage: { page: import('@playwright/test').Page; user: any; token: string };
}>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  postsPage: async ({ page }, use) => {
    await use(new PostsPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  aiPage: async ({ page }, use) => {
    await use(new AIPage(page));
  },
  analyticsPage: async ({ page }, use) => {
    await use(new AnalyticsPage(page));
  },
  authenticatedPage: async ({ browser, request }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const user = await createTestUser(request);
    const loginResult = await loginTestUser(request, user.email, user.password);
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('access_token', token);
    }, loginResult.access_token);
    await use({ page, user, token: loginResult.access_token });
    await context.close();
  },
});

export { expect } from '@playwright/test';