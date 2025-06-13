import type { Page } from "@playwright/test";

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected getByTestId(testId: string) {
    return this.page.getByTestId(testId);
  }

  protected async goto(url: string) {
    await this.page.goto(url);
  }

  protected async waitForUrl(url: string | RegExp, timeout = 10000) {
    await this.page.waitForURL(url, { timeout });
  }

  /**
   * Enhanced utility method for waiting for session elements to appear.
   * This addresses common timeout issues with session generation.
   */
  protected async waitForSessionElement(testId: string, timeout = 60000) {
    try {
      // First wait for URL to indicate session page
      await this.page.waitForURL("**/sessions/**", { timeout });

      // Then wait for the specific element to be visible
      await this.page.waitForSelector(`[data-testid="${testId}"]`, {
        state: "visible",
        timeout,
      });

      return this.getByTestId(testId);
    } catch (error) {
      // Take screenshot for debugging
      await this.page.screenshot({
        path: `debug-${testId}-timeout-${Date.now()}.png`,
        fullPage: true,
      });
      throw new Error(`Element with testId "${testId}" not found within ${timeout}ms. ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retry mechanism for flaky actions.
   * Use sparingly, prefer Playwright's built-in auto-waiting.
   */
  protected async retryAction(action: () => Promise<void>, retries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await action();
        return; // Exit if successful
      } catch (error) {
        if (attempt === retries) throw error; // Throw if final attempt fails
        await this.page.waitForTimeout(delay); // Wait before retry
      }
    }
  }
}
