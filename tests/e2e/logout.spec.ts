import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";

test("should log out and redirect to login", async ({ page }) => {
  // Log in
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();

  // Check for login error before proceeding
  if (await page.locator("text=Invalid login credentials").isVisible()) {
    throw new Error("Login failed: Invalid credentials. Check TEST_USER in config.ts and make sure the user exists.");
  }

  // Wait for navigation to /sessions and for the logout button to be visible
  await expect(page).toHaveURL(/\/sessions/);
  const logoutButton = page.getByTestId("logout-button").first();
  await expect(logoutButton).toBeVisible();

  // Click the logout button
  await logoutButton.click();

  // Should be redirected to login page
  await expect(page).toHaveURL(/\/login/);
});
