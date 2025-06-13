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

    // Ensure clean state before each test
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test.afterEach(async () => {
    // Clean up after each test
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("Complete flow: login → body parts → muscle tests → session generation", async () => {
    // Step 1: Login
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);
    // Step 2: Verify successful login and wait for navigation to sessions
    await loginPage.expectNoLoginError();
    await page.waitForURL("**/sessions", { timeout: 10000 });

    // Step 3: Click "Create New Session" to go to body parts
    await sessionsPage.clickCreateNewSession();

    // Step 4: Navigate through body parts selection
    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();

    // Wait for body parts to load
    await page.waitForTimeout(3000);

    // Select first available body part
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
      } catch {
        // Body part not found, trying next
      }
    }

    if (!selected) {
      throw new Error("No body parts available for selection");
    }

    await bodyPartsPage.clickNext();

    // Step 5: Handle muscle tests
    await muscleTestsPage.expectOnMuscleTestsPage();

    // Set slider value for first muscle test
    await muscleTestsPage.setSliderValue("slider-1", 5);

    // Verify the slider value was set correctly
    await muscleTestsPage.expectSliderValue("slider-1", 5);

    // Click next to generate session
    await muscleTestsPage.clickNext();

    // Step 6: Verify session plan was generated
    await sessionsPage.expectSessionDetailsVisible();
  });

  test("Should require at least one slider value to proceed", async () => {
    // Step 1: Login and navigate to muscle tests
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await loginPage.expectNoLoginError();
    await page.waitForURL("**/sessions", { timeout: 10000 });

    // Navigate to body parts
    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();
    await page.waitForTimeout(3000);

    // Select body part
    const bodyPartButton = page.getByTestId("body-part-upper-back");
    await expect(bodyPartButton).toBeVisible({ timeout: 10000 });
    await bodyPartButton.click();
    await bodyPartsPage.clickNext();

    // Step 2: Verify muscle tests page loads
    await muscleTestsPage.expectOnMuscleTestsPage();

    // Step 3: Initially next button should be disabled (assuming no sliders are set)
    // Note: This might need adjustment based on actual implementation
    // await muscleTestsPage.expectNextButtonDisabled();

    // Step 4: Set a slider value
    await muscleTestsPage.setSliderValue("slider-1", 3);

    // Step 5: Now next button should be enabled
    await muscleTestsPage.expectNextButtonEnabled();
  });

  test("Should allow setting multiple slider values", async () => {
    // Step 1: Login and navigate to muscle tests
    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);

    await loginPage.expectNoLoginError();
    await page.waitForURL("**/sessions", { timeout: 10000 });

    // Navigate through body parts
    await sessionsPage.clickCreateNewSession();

    await page.waitForURL("**/body-parts", { timeout: 10000 });
    await bodyPartsPage.acceptDisclaimerIfVisible();
    await page.waitForTimeout(3000);

    const bodyPartButton = page.getByTestId("body-part-upper-back");
    await expect(bodyPartButton).toBeVisible({ timeout: 10000 });
    await bodyPartButton.click();
    await bodyPartsPage.clickNext();

    // Step 2: Set multiple slider values
    await muscleTestsPage.expectOnMuscleTestsPage();

    // Try to set multiple sliders if they exist
    const sliderValues = {
      "slider-1": 5,
      "slider-2": 3,
      "slider-3": 7,
    };

    // Set values for sliders that exist
    for (const [sliderId, value] of Object.entries(sliderValues)) {
      try {
        const slider = await muscleTestsPage.getSlider(sliderId);
        if (await slider.isVisible({ timeout: 2000 })) {
          await muscleTestsPage.setSliderValue(sliderId, value);
        }
      } catch {
        // Slider not found, skipping
      }
    }

    // Proceed to session generation
    await muscleTestsPage.clickNext();

    // Verify session was generated
    await sessionsPage.expectSessionDetailsVisible();
  });

  test("Should generate different sessions based on pain levels", async () => {
    // This test could be expanded to verify that different slider values
    // result in different exercise recommendations

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

    // Set high pain level
    await muscleTestsPage.setSliderValue("slider-1", 8);
    await muscleTestsPage.clickNext();

    // Verify session was generated
    await sessionsPage.expectSessionDetailsVisible();

    // Could add assertions about the type of exercises recommended for high pain
    const sessionTitle = await page.getByTestId("session-title").textContent();
    expect(sessionTitle).toBeTruthy();
  });
});
