import { Page, Locator } from '@playwright/test';

export class AIPage {
  readonly page: Page;
  readonly promptInput: Locator;
  readonly platformSelect: Locator;
  readonly generateButton: Locator;
  readonly captionOutput: Locator;
  readonly hashtagsOutput: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.promptInput = page.locator('textarea[name="prompt"], input[name="prompt"]');
    this.platformSelect = page.locator('select[name="platform"], [role="combobox"]');
    this.generateButton = page.locator('button:has-text("Generate")');
    this.captionOutput = page.locator('[data-testid="caption-output"], .caption-output');
    this.hashtagsOutput = page.locator('[data-testid="hashtags-output"], .hashtags-output');
    this.loadingIndicator = page.locator('[role="progressbar"], .loading');
  }

  async goto() {
    await this.page.goto('/ai/generate');
  }

  async generateContent(prompt: string, platform: string) {
    await this.promptInput.fill(prompt);
    await this.platformSelect.click();
    await this.page.locator(`[role="option"]:has-text("${platform}")`).click();
    await this.generateButton.click();
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 });
  }

  async getCaption(): Promise<string> {
    return (await this.captionOutput.textContent()) || '';
  }

  async getHashtags(): Promise<string> {
    return (await this.hashtagsOutput.textContent()) || '';
  }
}