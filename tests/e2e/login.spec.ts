import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";

test("should log in successfully with valid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();
  await page.waitForURL(/\/sessions/, { timeout: 15000 });
  // Optionally, check that no error message is visible
  await expect(page.locator("text=Invalid login credentials")).toHaveCount(0);
});

test("should show error with invalid password", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill("wrongpassword");
  await page.getByTestId("login-submit").click();
  // Should stay on /login and show error
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator("text=Invalid login credentials")).toBeVisible();
});

// 4. (Commented out: single-page version, redundant)
// test("should redirect to login when accessing protected page unauthenticated", async ({ page }) => {
//   await page.goto("/sessions");
//   await expect(page).toHaveURL(/\/login/);
// });
