import { test, expect } from '../fixtures/base.fixture';

test.describe('Posts Management', () => {
  test('should create a new post', async ({ authenticatedPage, postsPage }) => {
    const { page } = authenticatedPage;
    await postsPage.goto();
    const initialCount = await postsPage.getPostCount();
    
    await postsPage.createPost({
      title: 'Test Post',
      content: 'This is a test post content',
      platform: 'Instagram',
    });
    
    await expect(page.locator('.success-message, [role="status"]')).toBeVisible();
    const newCount = await postsPage.getPostCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('should delete a post', async ({ authenticatedPage, postsPage }) => {
    const { page } = authenticatedPage;
    await postsPage.goto();
    const initialCount = await postsPage.getPostCount();
    
    if (initialCount > 0) {
      await postsPage.deleteFirstPost();
      const newCount = await postsPage.getPostCount();
      expect(newCount).toBeLessThan(initialCount);
    }
  });
});
