// helpers/test-utils.ts
import type { Locator } from "@playwright/test";

/**
 * Zaawansowane czekanie na elementy z niezawodnością
 */
export async function waitForElementVisible(locator: Locator, options = { timeout: 15000 }): Promise<void> {
  // First wait for the page to load
  await locator.page().waitForLoadState("domcontentloaded");

  // Try to see the element several times (retry pattern)
  let retries = 3;
  while (retries > 0) {
    try {
      await locator.waitFor({ state: "visible", timeout: options.timeout / retries });
      return; // Sukces
    } catch (err) {
      // Retry attempt failed, trying again
      retries--;
      if (retries === 0) throw err;
    }
  }
}
