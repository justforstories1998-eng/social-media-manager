import { test, expect } from '../fixtures/base.fixture';

test.describe('Authentication', () => {
  test('should register a new user', async ({ authPage, page }) => {
    await authPage.gotoRegister();
    await authPage.register('Test User', `test-${Date.now()}@example.com`, 'Password123!');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should login with valid credentials', async ({ authPage, page }) => {
    await authPage.goto();
    await authPage.login('test@example.com', 'Password123!');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show error for invalid credentials', async ({ authPage }) => {
    await authPage.goto();
    await authPage.login('wrong@example.com', 'WrongPassword');
    const error = await authPage.getErrorMessage();
    expect(error).toBeTruthy();
  });

  test('should logout successfully', async ({ authenticatedPage, authPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/dashboard');
    await page.locator('button:has-text("Logout"), [data-testid="logout"]').click();
    await expect(page).toHaveURL(/.*login/);
  });
});
