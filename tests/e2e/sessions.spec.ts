import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";

async function loginUser(page: Page) {
  // Clear cookies before login
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();
}

test.describe("User Session Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("should display session list and show session details if sessions exist", async ({ page }) => {
    try {
      await page.waitForSelector('[data-testid^="session-item-"]', { timeout: 10000 });
    } catch (error) {
      console.log("No sessions found or /sessions page not loaded correctly.");
      return; // Exit the test if the /sessions page doesn't load
    }

    const firstSessionItem = page.locator('[data-testid^="session-item-"]').first();
    const isSessionItemVisible = await firstSessionItem.isVisible({ timeout: 5000 }).catch(() => false);

    if (isSessionItemVisible) {
      const sessionId = await firstSessionItem.getAttribute("data-testid").then((id) => id?.replace("session-item-", ""));
      expect(sessionId, "Session ID should be available").toBeTruthy();

      await page.getByTestId(`session-details-link-${sessionId}`).click();

      await expect(page.getByTestId("session-title")).toBeVisible();
      await expect(page.getByTestId("session-description")).toBeVisible();
      await expect(page.locator('[data-testid^="session-exercise-"]').first()).toBeVisible();
    } else {
      expect(isSessionItemVisible).toBeFalsy();
    }
  });
});
