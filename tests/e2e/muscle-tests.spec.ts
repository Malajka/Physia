import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";

// Helper function (should be in a shared utils file or defined here if not)
async function acceptDisclaimerIfVisible(page: Page) {
  // Adjust the selector if your disclaimer has a different test-id
  const disclaimerLocator = page.getByTestId("accept-disclaimer");
  try {
    // Use a shorter timeout as this is an optional, quick check
    if (await disclaimerLocator.isVisible({ timeout: 5000 })) {
      await disclaimerLocator.click();
    }
  } catch (e) {
    console.log("Disclaimer not found or not visible, continuing...");
  }
}

test("muscle tests view: pain assessment and session generation (at least one slider)", async ({ page }) => {
  // Log in
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();

  // Check for login error before proceeding
  const loginErrorLocator = page.locator("text=Invalid login credentials");
  if (await loginErrorLocator.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Quick check for login error
    await page.screenshot({ path: "login-failure.png" });
    throw new Error("Login failed: Invalid credentials. Check TEST_USER in config.ts and make sure the user exists.");
  }
  // Ensure successful login navigation (adjust URL if needed)
  await page.waitForURL(/\/body-parts|\/sessions/, { timeout: 15000 });

  // Go to body-parts page
  if (!page.url().includes("/body-parts")) {
    // Navigate if not already there
    await page.goto("/body-parts");
  }
  await page.waitForURL("**/body-parts", { timeout: 10000 }); // Confirm URL

  // **Handle potential overlays like disclaimers**
  await acceptDisclaimerIfVisible(page);

  // Now, assert visibility and interact with the element
  const bodyPartLocator = page.getByTestId("body-part-upper-back");
  await expect(bodyPartLocator, "Body part 'upper-back' should be visible after handling prerequisites.").toBeVisible({ timeout: 20000 });
  await bodyPartLocator.click();

  // Click the Next button
  const nextButton = page.getByTestId("body-part-next");
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  // Wait for muscle tests view (at least one muscle test heading visible)
  // Using a more robust selector for potentially dynamic heading text
  await expect(page.getByRole("heading", { name: /muscle test/i }).first()).toBeVisible({ timeout: 15000 });

  // Find the first slider
  const sliderContainer = page.getByTestId("slider-1"); // Assuming slider-1 is the container
  const slider = sliderContainer.getByRole("slider");
  await expect(slider).toBeVisible();

  // Focus the slider and increase its value using keyboard events
  await slider.focus();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("ArrowRight"); // Use page.keyboard.press for better control
  }

  // Check the slider value
  await expect(slider).toHaveAttribute("aria-valuenow", "5");

  // Now the Create Session button should be enabled
  const submitButton = page.getByTestId("muscle-test-next");
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  // Wait for the generated session plan to appear
  await expect(page.getByTestId("session-title")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("session-description")).toBeVisible();
  await expect(page.locator('[data-testid^="session-exercise-"]').first()).toBeVisible();
});
