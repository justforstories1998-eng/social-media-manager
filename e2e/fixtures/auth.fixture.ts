import { test as base } from '@playwright/test';
import { createTestUser, loginTestUser } from '../utils/test-helpers';

export const test = base.extend<{
  authenticatedPage: { page: import('@playwright/test').Page; user: any; token: string };
}>({
  authenticatedPage: async ({ browser, request }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Create test user via API
    const user = await createTestUser(request);
    const loginResult = await loginTestUser(request, user.email, user.password);
    
    // Store token in localStorage
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('access_token', token);
    }, loginResult.access_token);
    
    await use({ page, user, token: loginResult.access_token });
    await context.close();
  },
});

export { expect } from '@playwright/test';
