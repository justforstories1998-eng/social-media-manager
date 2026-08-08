import { test, expect } from '../fixtures/base.fixture';

test.describe('Products Management', () => {
  test('should add a new product', async ({ authenticatedPage, productsPage }) => {
    const { page } = authenticatedPage;
    await productsPage.goto();
    const initialCount = await productsPage.getProductCount();
    
    await productsPage.addProduct({
      name: 'Test Product',
      description: 'A test product description',
      category: 'Electronics',
      price: 99.99,
    });
    
    await expect(page.locator('.success-message, [role="status"]')).toBeVisible();
    const newCount = await productsPage.getProductCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });
});
