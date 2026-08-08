import { test as base } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { PostsPage } from '../page-objects/PostsPage';
import { ProductsPage } from '../page-objects/ProductsPage';
import { AIPage } from '../page-objects/AIPage';
import { AnalyticsPage } from '../page-objects/AnalyticsPage';

export const test = base.extend<{
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  postsPage: PostsPage;
  productsPage: ProductsPage;
  aiPage: AIPage;
  analyticsPage: AnalyticsPage;
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
});

export { expect } from '@playwright/test';