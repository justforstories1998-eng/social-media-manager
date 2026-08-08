import { Page, Locator } from '@playwright/test';

interface PostData {
  title: string;
  content: string;
  platform: string;
}

export class PostsPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly postList: Locator;
  readonly titleInput: Locator;
  readonly contentInput: Locator;
  readonly platformSelect: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.locator('button:has-text("Create"), button:has-text("New Post")');
    this.postList = page.locator('[data-testid="post-list"], .post-list, table tbody tr');
    this.titleInput = page.locator('input[name="title"]');
    this.contentInput = page.locator('textarea[name="content"], input[name="content"]');
    this.platformSelect = page.locator('select[name="platform"], [role="combobox"]');
    this.saveButton = page.locator('button:has-text("Save"), button:has-text("Create")');
    this.deleteButton = page.locator('button:has-text("Delete")');
  }

  async goto() {
    await this.page.goto('/posts');
  }

  async createPost(data: PostData) {
    await this.createButton.click();
    await this.titleInput.fill(data.title);
    await this.contentInput.fill(data.content);
    await this.platformSelect.click();
    await this.page.locator(`[role="option"]:has-text("${data.platform}")`).click();
    await this.saveButton.click();
  }

  async getPostCount(): Promise<number> {
    return this.postList.count();
  }

  async deleteFirstPost() {
    await this.postList.first().locator('button:has-text("Delete")').click();
    await this.page.locator('button:has-text("Confirm"), button:has-text("Yes")').click();
  }
}