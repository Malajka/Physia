import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { TEST_USER } from "./config";
import { AuthHelper } from "./page-objects/AuthHelper";
import { BodyPartsPage } from "./page-objects/BodyPartsPage";
import { LoginPage } from "./page-objects/LoginPage";
import { SessionsPage } from "./page-objects/SessionsPage";

test.describe("Body Parts Selection (with POM)", () => {
  let page: Page;
  let context: BrowserContext;
  let loginPage: LoginPage;
  let sessionsPage: SessionsPage;
  let bodyPartsPage: BodyPartsPage;

  test.beforeEach(async ({ page: testPage, context: testContext }) => {
    page = testPage;
    context = testContext;
    loginPage = new LoginPage(page);
    sessionsPage = new SessionsPage(page);
    bodyPartsPage = new BodyPartsPage(page);

    await AuthHelper.ensureLoggedOut(page, context);

    await page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("Minimal create session flow", async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await page.waitForTimeout(3000);

    await page.waitForURL("**/sessions", { timeout: 30000 });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 30000 });

    await sessionsPage.expectOnSessionsPage();

    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });

    await bodyPartsPage.acceptDisclaimerIfVisible();

    const bodyPartButtonLocator = page.getByTestId("body-part-upper-back");
    try {
      await expect(bodyPartButtonLocator, "Body part button 'body-part-upper-back' should be visible.").toBeVisible({ timeout: 20000 });
    } catch (error) {
      await page.screenshot({ path: `debug-body-part-not-visible-${Date.now()}.png`, fullPage: true });
      throw error;
    }
    await bodyPartButtonLocator.click();

    const nextButtonLocator = page.getByTestId("body-part-next");
    await expect(nextButtonLocator, "'Next' button should be enabled after selecting a body part.").toBeEnabled({ timeout: 10000 });
    await nextButtonLocator.click();
  });

  test("should accept disclaimer when visible", async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await page.waitForTimeout(3000);

    await page.waitForURL("**/sessions", { timeout: 30000 });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 30000 });

    await sessionsPage.expectOnSessionsPage();

    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });

    await bodyPartsPage.acceptDisclaimerIfVisible();

    await expect(page).toHaveURL(/\/body-parts/);
  });

  test("should enable next button after selecting body part", async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await page.waitForTimeout(3000);

    await page.waitForURL("**/sessions", { timeout: 30000 });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 30000 });

    await sessionsPage.expectOnSessionsPage();

    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();

    await page.waitForTimeout(3000);

    await bodyPartsPage.expectNextButtonDisabled();

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
      } catch {}
    }

    if (!selected) {
      throw new Error("No body parts available for selection");
    }

    await bodyPartsPage.expectNextButtonEnabled();
  });

  test("should navigate to next step after body part selection", async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await page.waitForTimeout(3000);

    await page.waitForURL("**/sessions", { timeout: 30000 });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 30000 });

    await sessionsPage.expectOnSessionsPage();

    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();

    await page.waitForTimeout(3000);

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
      } catch {}
    }

    if (!selected) {
      await page.screenshot({ path: `debug-no-body-parts-${Date.now()}.png`, fullPage: true });

      throw new Error("No body parts available for selection");
    }

    await bodyPartsPage.clickNext();

    await expect(page).not.toHaveURL(/\/body-parts$/);
  });
});
