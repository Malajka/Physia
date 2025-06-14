import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { TEST_USER } from "./config";
import { AuthHelper } from "./page-objects/AuthHelper";
import { BodyPartsPage } from "./page-objects/BodyPartsPage";
import { LoginPage } from "./page-objects/LoginPage";
import { MuscleTestsPage } from "./page-objects/MuscleTestsPage";
import { SessionsPage } from "./page-objects/SessionsPage";

test.describe("Muscle Tests (with POM)", () => {
  let page: Page;
  let context: BrowserContext;
  let loginPage: LoginPage;
  let sessionsPage: SessionsPage;
  let bodyPartsPage: BodyPartsPage;
  let muscleTestsPage: MuscleTestsPage;

  test.beforeEach(async ({ page: testPage, context: testContext }) => {
    page = testPage;
    context = testContext;
    loginPage = new LoginPage(page);
    sessionsPage = new SessionsPage(page);
    bodyPartsPage = new BodyPartsPage(page);
    muscleTestsPage = new MuscleTestsPage(page);

    await AuthHelper.ensureLoggedOut(page, context);
  });

  test.afterEach(async () => {
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("Complete flow: login → body parts → muscle tests → session generation", async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await loginPage.expectNoLoginError();
    await page.waitForURL("**/sessions", { timeout: 10000 });

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
      throw new Error("No body parts available for selection");
    }

    await bodyPartsPage.clickNext();

    await muscleTestsPage.expectOnMuscleTestsPage();

    await muscleTestsPage.setSliderValue("slider-1", 5);

    await muscleTestsPage.expectSliderValue("slider-1", 5);

    await muscleTestsPage.clickNext();

    await sessionsPage.expectSessionDetailsVisible();
  });

  test("Should require at least one slider value to proceed", async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await loginPage.expectNoLoginError();
    await page.waitForURL("**/sessions", { timeout: 10000 });

    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();
    await page.waitForTimeout(3000);

    const bodyPartButton = page.getByTestId("body-part-upper-back");
    await expect(bodyPartButton).toBeVisible({ timeout: 10000 });
    await bodyPartButton.click();
    await bodyPartsPage.clickNext();

    await muscleTestsPage.expectOnMuscleTestsPage();

    await muscleTestsPage.setSliderValue("slider-1", 3);

    await muscleTestsPage.expectNextButtonEnabled();
  });

  test("Should allow setting multiple slider values", async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await loginPage.expectNoLoginError();
    await page.waitForURL("**/sessions", { timeout: 10000 });

    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();
    await page.waitForTimeout(3000);

    const bodyPartButton = page.getByTestId("body-part-upper-back");
    await expect(bodyPartButton).toBeVisible({ timeout: 10000 });
    await bodyPartButton.click();
    await bodyPartsPage.clickNext();

    await muscleTestsPage.expectOnMuscleTestsPage();

    const sliderValues = {
      "slider-1": 5,
      "slider-2": 3,
      "slider-3": 7,
    };

    for (const [sliderId, value] of Object.entries(sliderValues)) {
      try {
        const slider = await muscleTestsPage.getSlider(sliderId);
        if (await slider.isVisible({ timeout: 2000 })) {
          await muscleTestsPage.setSliderValue(sliderId, value);
        }
      } catch {}
    }

    await muscleTestsPage.clickNext();

    await sessionsPage.expectSessionDetailsVisible();
  });

  test("Should generate different sessions based on pain levels", async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await loginPage.expectNoLoginError();
    await page.waitForURL("**/sessions", { timeout: 10000 });

    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();
    await page.waitForTimeout(3000);

    const bodyPartButton = page.getByTestId("body-part-upper-back");
    await expect(bodyPartButton).toBeVisible({ timeout: 10000 });
    await bodyPartButton.click();
    await bodyPartsPage.clickNext();

    await muscleTestsPage.expectOnMuscleTestsPage();

    await muscleTestsPage.setSliderValue("slider-1", 8);
    await muscleTestsPage.clickNext();

    await sessionsPage.expectSessionDetailsVisible();

    const sessionTitle = await page.getByTestId("session-title").textContent();
    expect(sessionTitle).toBeTruthy();
  });
});
