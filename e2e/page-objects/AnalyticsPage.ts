import { Page, Locator } from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly chartsContainer: Locator;
  readonly metricsContainer: Locator;
  readonly platformBreakdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chartsContainer = page.locator('[data-testid="charts"], .charts-container, .recharts-wrapper');
    this.metricsContainer = page.locator('[data-testid="metrics"], .metrics-container');
    this.platformBreakdown = page.locator('[data-testid="platform-breakdown"], .platform-breakdown');
  }

  async goto() {
    await this.page.goto('/analytics');
  }

  async waitForLoad() {
    await this.chartsContainer.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async getChartCount(): Promise<number> {
    return this.chartsContainer.count();
  }
}