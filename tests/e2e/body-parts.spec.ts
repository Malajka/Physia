import { expect, test, Page } from "@playwright/test";
import { TEST_USER } from "./config";

// --- START HELPER FUNCTIONS SECTION (can be moved to a separate utils file) ---

async function acceptDisclaimerIfVisible(page: Page) {
  const disclaimerLocator = page.getByTestId("accept-disclaimer");
  try {
    if (await disclaimerLocator.isVisible({ timeout: 5000 })) {
      await disclaimerLocator.click();
    }
  } catch (error) {
    // Disclaimer not found or not visible, which is acceptable.
  }
}
// --- END HELPER FUNCTIONS SECTION ---

test("Minimal create session flow", async ({ page }) => {
  // Step 1: Login
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();

  // Step 2: Verify successful login and wait for navigation
  const loginErrorLocator = page.locator("text=Invalid login credentials");
  if (await loginErrorLocator.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.screenshot({ path: `debug-login-failure-${Date.now()}.png` });
    throw new Error("Login failed. Check credentials and if the user exists.");
  }
  await page.waitForURL(/\/sessions|\/body-parts/, { timeout: 15000 });

  // Step 3: Navigate to body-parts page (if not automatically redirected)
  if (!page.url().includes("/body-parts")) {
    await page.goto("/body-parts");
  }
  await page.waitForURL("**/body-parts", { timeout: 10000 });

  // Step 4: Accept disclaimer if visible
  await acceptDisclaimerIfVisible(page);

  // Step 5: Select a body part
  const bodyPartButtonLocator = page.getByTestId("body-part-upper-back");
  try {
    await expect(bodyPartButtonLocator, "Body part button 'body-part-upper-back' should be visible.").toBeVisible({ timeout: 20000 });
  } catch (error) {
    await page.screenshot({ path: `debug-body-part-not-visible-${Date.now()}.png`, fullPage: true });
    // Optionally, log specific debug info here if truly needed, or rely on Playwright's trace
    throw error;
  }
  await bodyPartButtonLocator.click();

  // Step 6: Click the "Next" button
  const nextButtonLocator = page.getByTestId("body-part-next");
  await expect(nextButtonLocator, "'Next' button should be enabled after selecting a body part.").toBeEnabled({ timeout: 10000 });
  await nextButtonLocator.click();

  // Step 7: Optional verification after clicking "Next"
  // Example: await expect(page).toHaveURL(/\/expected-next-url/, { timeout: 10000 });
  // Example: await expect(page.getByTestId("next-step-element")).toBeVisible({ timeout: 10000 });
});
