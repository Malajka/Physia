import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";
import { AuthHelper } from "./page-objects/AuthHelper";
import { BodyPartsPage } from "./page-objects/BodyPartsPage";
import { LoginPage } from "./page-objects/LoginPage";
import { SessionsPage } from "./page-objects/SessionsPage";

test.describe("Body Parts Selection (with POM)", () => {
  let page: any;
  let context: any;
  let loginPage: LoginPage;
  let sessionsPage: SessionsPage;
  let bodyPartsPage: BodyPartsPage;

  test.beforeEach(async ({ page: testPage, context: testContext }) => {
    page = testPage;
    context = testContext;
    loginPage = new LoginPage(page);
    sessionsPage = new SessionsPage(page);
    bodyPartsPage = new BodyPartsPage(page);

    // Ensure clean state before each test with more thorough cleanup
    await AuthHelper.ensureLoggedOut(page, context);

    // Wait a bit to ensure cleanup is complete
    await page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    // Clean up after each test
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("Minimal create session flow", async () => {
    // Step 1: Login using POM
    await loginPage.navigateToLogin();
    await loginPage.fillEmail(TEST_USER.email);
    await loginPage.fillPassword(TEST_USER.password);
    await loginPage.clickSubmit();

    // Step 2: Wait for successful login and navigation
    await page.waitForTimeout(3000);

    // Verify successful login by checking we're NOT on login page anymore
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Then verify we're on sessions page
    await sessionsPage.expectOnSessionsPage();

    // Step 3: Navigate to body parts using navigation link
    await sessionsPage.clickCreateNewSession();

    // Step 4: Wait for navigation to body-parts page
    await page.waitForURL("**/body-parts", { timeout: 10000 });

    // Step 5: Accept disclaimer if visible
    await bodyPartsPage.acceptDisclaimerIfVisible();

    // Step 6: Select a body part
    const bodyPartButtonLocator = page.getByTestId("body-part-upper-back");
    try {
      await expect(bodyPartButtonLocator, "Body part button 'body-part-upper-back' should be visible.").toBeVisible({ timeout: 20000 });
    } catch (error) {
      await page.screenshot({ path: `debug-body-part-not-visible-${Date.now()}.png`, fullPage: true });
      throw error;
    }
    await bodyPartButtonLocator.click();

    // Step 7: Click the "Next" button
    const nextButtonLocator = page.getByTestId("body-part-next");
    await expect(nextButtonLocator, "'Next' button should be enabled after selecting a body part.").toBeEnabled({ timeout: 10000 });
    await nextButtonLocator.click();
  });

  test("should accept disclaimer when visible", async () => {
    // Step 1: Login using POM
    await loginPage.navigateToLogin();
    await loginPage.fillEmail(TEST_USER.email);
    await loginPage.fillPassword(TEST_USER.password);
    await loginPage.clickSubmit();

    // Step 2: Wait for successful login and navigation
    await page.waitForTimeout(3000);

    // Verify successful login by checking we're NOT on login page anymore
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Then verify we're on sessions page
    await sessionsPage.expectOnSessionsPage();

    // Step 3: Navigate to body parts using navigation link
    await sessionsPage.clickCreateNewSession();

    // Step 4: Wait for navigation to body-parts page
    await page.waitForURL("**/body-parts", { timeout: 10000 });

    // Step 5: Accept disclaimer if visible
    await bodyPartsPage.acceptDisclaimerIfVisible();

    // Verify we're still on body parts page
    await expect(page).toHaveURL(/\/body-parts/);
  });

  test("should enable next button after selecting body part", async () => {
    // Step 1: Login using POM
    await loginPage.navigateToLogin();
    await loginPage.fillEmail(TEST_USER.email);
    await loginPage.fillPassword(TEST_USER.password);
    await loginPage.clickSubmit();

    // Step 2: Wait for successful login and navigation
    await page.waitForTimeout(3000);

    // Verify successful login by checking we're NOT on login page anymore
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Then verify we're on sessions page
    await sessionsPage.expectOnSessionsPage();

    // Step 3: Navigate to body parts using navigation link
    await sessionsPage.clickCreateNewSession();

    // Step 4: Wait for navigation to body-parts page
    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();

    // Wait a bit more for body parts to load
    await page.waitForTimeout(3000);

    // Initially next button should be disabled
    await bodyPartsPage.expectNextButtonDisabled();

    // Try to select any available body part
    const bodyPartTestIds = ["body-part-upper-back", "body-part-lower-back", "body-part-arms-and-wrists", "body-part-hips-and-knees"];
    let selected = false;

    for (const testId of bodyPartTestIds) {
      try {
        const button = page.getByTestId(testId);
        if (await button.isVisible({ timeout: 5000 })) {
          await button.click();
          selected = true;
          break;
        }
      } catch (error) {
        console.log(`${testId} not found, trying next...`);
      }
    }

    if (!selected) {
      throw new Error("No body parts available for selection");
    }

    // Next button should now be enabled
    await bodyPartsPage.expectNextButtonEnabled();
  });

  test("should navigate to next step after body part selection", async () => {
    // Step 1: Login using POM
    await loginPage.navigateToLogin();
    await loginPage.fillEmail(TEST_USER.email);
    await loginPage.fillPassword(TEST_USER.password);
    await loginPage.clickSubmit();

    // Step 2: Wait for successful login and navigation
    await page.waitForTimeout(3000);

    // Verify successful login by checking we're NOT on login page anymore
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Then verify we're on sessions page
    await sessionsPage.expectOnSessionsPage();

    // Step 3: Navigate to body parts using navigation link
    await sessionsPage.clickCreateNewSession();

    // Step 4: Wait for navigation to body-parts page
    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();

    // Wait a bit more for body parts to load
    await page.waitForTimeout(3000);

    // Try to select any available body part
    const bodyPartTestIds = ["body-part-upper-back", "body-part-lower-back", "body-part-arms-and-wrists", "body-part-hips-and-knees"];
    let selected = false;

    for (const testId of bodyPartTestIds) {
      try {
        const button = page.getByTestId(testId);
        if (await button.isVisible({ timeout: 5000 })) {
          await button.click();
          selected = true;
          break;
        }
      } catch (error) {
        console.log(`${testId} not found, trying next...`);
      }
    }

    if (!selected) {
      // Take a screenshot for debugging
      await page.screenshot({ path: `debug-no-body-parts-${Date.now()}.png`, fullPage: true });

      // Log all elements with data-testid that start with "body-part-"
      const bodyPartElements = await page.locator('[data-testid^="body-part-"]').all();
      console.log(`Found ${bodyPartElements.length} body part elements`);

      for (let i = 0; i < bodyPartElements.length; i++) {
        const testId = await bodyPartElements[i].getAttribute("data-testid");
        const isVisible = await bodyPartElements[i].isVisible();
        console.log(`Body part ${i}: ${testId}, visible: ${isVisible}`);
      }

      throw new Error("No body parts available for selection");
    }

    await bodyPartsPage.clickNext();

    // Should navigate away from body-parts page
    await expect(page).not.toHaveURL(/\/body-parts$/);
  });
});
