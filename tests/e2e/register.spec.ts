import { expect, test } from "@playwright/test";

// Utility to generate a unique email for registration
function generateUniqueEmail() {
  return `user${Date.now()}@example.com`;
}

// 1. Successful registration with valid data
test("should register successfully with valid data", async ({ page }) => {
  await page.goto("/register");
  await page.getByTestId("register-email").fill(generateUniqueEmail());
  await page.getByTestId("register-password").fill("validpassword");
  await page.getByTestId("register-passwordConfirm").fill("validpassword");
  await page.getByTestId("register-submit").click();
  await expect(page.locator("text=Registration Successful!")).toBeVisible();
});

// 2. Registration fails with already registered email
test("should show error when email is already registered", async ({ page }) => {
  const existingEmail = "mongitarra@gmail.com"; // Use a known existing email
  await page.goto("/register");
  await page.getByTestId("register-email").fill(existingEmail);
  await page.getByTestId("register-password").fill("validpassword");
  await page.getByTestId("register-passwordConfirm").fill("validpassword");
  await page.getByTestId("register-submit").click();
  await expect(page.locator("text=This email is already registered. Would you like to log in instead?")).toBeVisible();
});

// 3. Registration fails with too short password
test("should show error when password is too short", async ({ page }) => {
  await page.goto("/register");
  await page.getByTestId("register-email").fill(generateUniqueEmail());
  await page.getByTestId("register-password").fill("short");
  await page.getByTestId("register-passwordConfirm").fill("short");
  await page.getByTestId("register-submit").click();
  await expect(page.locator("text=Password must be at least 8 characters long.")).toBeVisible();
});

// 4. Registration fails when passwords do not match
test("should show error when passwords do not match", async ({ page }) => {
  await page.goto("/register");
  await page.getByTestId("register-email").fill(generateUniqueEmail());
  await page.getByTestId("register-password").fill("validpassword");
  await page.getByTestId("register-passwordConfirm").fill("differentpassword");
  await page.getByTestId("register-submit").click();
  await expect(page.locator("text=Passwords do not match")).toBeVisible();
});
