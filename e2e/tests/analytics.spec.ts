import { test, expect } from '../fixtures/base.fixture';

test.describe('Analytics Dashboard', () => {
  test('should load analytics dashboard', async ({ authenticatedPage, analyticsPage }) => {
    const { page } = authenticatedPage;
    await analyticsPage.goto();
    await analyticsPage.waitForLoad();
    
    const chartCount = await analyticsPage.getChartCount();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should display metrics', async ({ authenticatedPage, analyticsPage }) => {
    const { page } = authenticatedPage;
    await analyticsPage.goto();
    
    await expect(analyticsPage.metricsContainer).toBeVisible();
  });
});
