import { test, expect } from '../fixtures/base.fixture';
import { createTestUser } from '../utils/test-helpers';

test.describe('Complete User Journey', () => {
  test('should complete full user flow', async ({ request, authPage, postsPage, productsPage, aiPage, analyticsPage, page }) => {
    // 1. Register new account
    const user = await createTestUser(request);
    await authPage.gotoRegister();
    await authPage.register('Full Flow User', user.email, user.password);
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Add a product
    await productsPage.goto();
    await productsPage.addProduct({
      name: 'Flow Product',
      description: 'Product for full flow test',
      category: 'Test',
      price: 49.99,
    });

    // 3. Generate AI post
    await aiPage.goto();
    await aiPage.generateContent('Create a promotional post', 'Instagram');
    const caption = await aiPage.getCaption();
    expect(caption).toBeTruthy();

    // 4. Create post
    await postsPage.goto();
    await postsPage.createPost({
      title: 'Flow Post',
      content: caption,
      platform: 'Instagram',
    });

    // 5. View analytics
    await analyticsPage.goto();
    await analyticsPage.waitForCharts();
    const chartCount = await analyticsPage.getChartCount();
    expect(chartCount).toBeGreaterThan(0);
  });
});