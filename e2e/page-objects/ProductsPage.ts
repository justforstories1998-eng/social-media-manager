import { Page, Locator } from '@playwright/test';

interface ProductData {
  name: string;
  description: string;
  category: string;
  price: number;
}

export class ProductsPage {
  readonly page: Page;
  readonly addButton: Locator;
  readonly productList: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly categoryInput: Locator;
  readonly priceInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.locator('button:has-text("Add"), button:has-text("New Product")');
    this.productList = page.locator('[data-testid="product-list"], .product-list, table tbody tr');
    this.nameInput = page.locator('input[name="name"]');
    this.descriptionInput = page.locator('textarea[name="description"], input[name="description"]');
    this.categoryInput = page.locator('input[name="category"]');
    this.priceInput = page.locator('input[name="price"]');
    this.saveButton = page.locator('button:has-text("Save"), button:has-text("Add")');
  }

  async goto() {
    await this.page.goto('/products');
  }

  async addProduct(data: ProductData) {
    await this.addButton.click();
    await this.nameInput.fill(data.name);
    await this.descriptionInput.fill(data.description);
    await this.categoryInput.fill(data.category);
    await this.priceInput.fill(String(data.price));
    await this.saveButton.click();
  }

  async getProductCount(): Promise<number> {
    return this.productList.count();
  }
}