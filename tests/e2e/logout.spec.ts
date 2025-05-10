import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";

test("should log out and redirect to login", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/sessions/);
  await expect(page.locator("text=Invalid login credentials")).toHaveCount(0);

  // Click the visible logout button
  const logoutButtons = await page.getByTestId("logout-button").all();
  for (const btn of logoutButtons) {
    if (await btn.isVisible()) {
      await btn.click();
      break;
    }
  }
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByTestId("login-submit")).toBeVisible({ timeout: 10000 });
});
