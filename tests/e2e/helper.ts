// helpers/test-utils.ts
import type { Locator } from "@playwright/test";

/**
 * Zaawansowane czekanie na elementy z niezawodnością
 */
export async function waitForElementVisible(locator: Locator, options = { timeout: 15000 }): Promise<void> {
  try {
    // Najpierw poczekaj na załadowanie strony
    await locator.page().waitForLoadState("domcontentloaded");

    // Spróbuj kilka razy zobaczyć element (retry pattern)
    let retries = 3;
    while (retries > 0) {
      try {
        await locator.waitFor({ state: "visible", timeout: options.timeout / retries });
        return; // Sukces
      } catch (err) {
        console.log(`Próba ${4 - retries}/3 nie powiodła się. Ponawiam...`);
        retries--;
        if (retries === 0) throw err;
      }
    }
  } catch (error) {
    console.error("Nie można znaleźć elementu:", error);
    throw error;
  }
}
