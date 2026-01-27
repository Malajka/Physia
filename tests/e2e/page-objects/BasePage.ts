import type { Page } from "@playwright/test";

/**
 * Base class for all page objects.
 * Provides common functionality for interacting with pages.
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get element by data-testid attribute.
   */
  protected getByTestId(testId: string) {
    return this.page.getByTestId(testId);
  }

  /**
   * Navigate to a URL.
   */
  protected async goto(url: string) {
    await this.page.goto(url);
  }

  /**
   * Wait for URL to match pattern.
   */
  protected async waitForUrl(url: string | RegExp, timeout = 10000) {
    await this.page.waitForURL(url, { timeout });
  }
}
