import type { Locator } from "@playwright/test";

export async function waitForElementVisible(locator: Locator, options = { timeout: 15000 }): Promise<void> {
  await locator.page().waitForLoadState("domcontentloaded");

  let retries = 3;
  while (retries > 0) {
    try {
      await locator.waitFor({ state: "visible", timeout: options.timeout / retries });
      return;
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
    }
  }
}
