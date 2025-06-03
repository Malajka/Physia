import type { Page } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  getByTestId(testId: string) {
    return this.page.getByTestId(testId);
  }

  async waitForUrl(url: string | RegExp) {
    await this.page.waitForURL(url);
  }
}
