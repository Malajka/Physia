import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config"; // Assuming this file exists and exports TEST_USER

/**
 * Helper function to log in a user.
 * @param page - Playwright Page instance.
 */
async function loginUser(page: Page) {
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();
  // Wait for navigation to either sessions or body-parts page
  await page.waitForURL(/\/sessions|\/body-parts/, { timeout: 15000 });
}

/**
 * Helper function to accept the disclaimer if it's visible.
 * @param page - Playwright Page instance.
 */
async function acceptDisclaimerIfVisible(page: Page) {
  const disclaimer = page.getByTestId("accept-disclaimer");
  // Using .catch(() => false) is a good way to handle when the element might not exist
  if (await disclaimer.isVisible().catch(() => false)) {
    await disclaimer.click();
  }
}

test.describe("User Session Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test in this group
    await loginUser(page);
  });

  test("should display session list and show session details", async ({ page }) => {
    // Ensure we are on the /sessions page if login doesn't default there
    if (!page.url().includes("/sessions")) {
      await page.goto("/sessions");
      await page.waitForURL(/\/sessions/, { timeout: 10000 });
    }

    // Check that at least one session item is visible
    const firstSessionItem = page.locator('[data-testid^="session-item-"]').first();
    await expect(firstSessionItem).toBeVisible({ timeout: 10000 });

    // Get the session ID from the first item
    const sessionId = await firstSessionItem.getAttribute("data-testid").then((id) => id?.replace("session-item-", ""));
    expect(sessionId, "Session ID should be available").toBeTruthy();

    // Go to details of the first session
    await page.getByTestId(`session-details-link-${sessionId}`).click();

    // Check that session details are visible
    await expect(page.getByTestId("session-title")).toBeVisible();
    await expect(page.getByTestId("session-description")).toBeVisible();
    // Optionally, check for at least one exercise
    await expect(page.locator('[data-testid^="session-exercise-"]').first()).toBeVisible();
  });
});

test.describe("Create New Session", () => {
  test.beforeEach(async ({ page }) => {
    // Log in and navigate to body-parts page before each test in this group
    await loginUser(page);
    await page.goto("/body-parts");
    await acceptDisclaimerIfVisible(page);
  });

  test("should allow selecting a body part and proceeding to the next step", async ({ page }) => {
    // Select a body part
    const bodyPartButton = page.getByTestId("body-part-upper-back");
    await expect(bodyPartButton).toBeVisible();
    await bodyPartButton.click();

    // Click Next
    const nextButton = page.getByTestId("body-part-next");
    // Wait for the Next button to be enabled
    await expect(nextButton).not.toBeDisabled({ timeout: 15000 });
    await nextButton.click();

    // Add a clear assertion for the result of clicking "Next"
    // This is an example; adjust the URL or element to match your application's behavior
    await expect(page).toHaveURL(/\/muscle-tests/, { timeout: 10000 });
    // OR check for an element on the next page:
    // await expect(page.getByTestId("element-on-next-page")).toBeVisible();
  });
});
