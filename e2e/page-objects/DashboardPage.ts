import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly metricsCards: Locator;
  readonly recentPosts: Locator;
  readonly platformStats: Locator;

  constructor(page: Page) {
    this.page = page;
    this.metricsCards = page.locator('[data-testid="metric-card"], .metric-card');
    this.recentPosts = page.locator('[data-testid="recent-posts"], .recent-posts');
    this.platformStats = page.locator('[data-testid="platform-stats"], .platform-stats');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async waitForLoad() {
    await this.page.waitForSelector('[data-testid="metric-card"], .metric-card', {
      timeout: 10000,
    });
  }

  async getMetricCount(): Promise<number> {
    return this.metricsCards.count();
  }
}