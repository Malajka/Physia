import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { AuthHelper } from "./page-objects/AuthHelper";
import { LoginPage } from "./page-objects/LoginPage";
import { SessionsPage } from "./page-objects/SessionsPage";
import { TestDataHelper } from "./page-objects/TestDataHelper";

test.describe("User Login (with POM)", () => {
  let page: Page;
  let context: BrowserContext;
  let loginPage: LoginPage;
  let sessionsPage: SessionsPage;

  const LOGIN_API_URL = "/api/auth/login";

  test.beforeEach(async ({ page: testPage, context: testContext }) => {
    page = testPage;
    context = testContext;
    loginPage = new LoginPage(page);
    sessionsPage = new SessionsPage(page);
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test.afterEach(async () => {
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test.describe("Login Form Validation", () => {
    test("should show error with invalid password", async () => {
      const testUser = TestDataHelper.getExistingTestUser();
      const invalidPassword = "wrongpassword";
      await loginPage.navigateToLogin();

      const responsePromise = page.waitForResponse((resp) => resp.url().includes(LOGIN_API_URL) && resp.status() !== 200);

      await loginPage.loginUser(testUser.email, invalidPassword);

      await responsePromise;

      await expect(page).toHaveURL(/\/login/);
      await loginPage.expectLoginError();
    });

    test("should show error with invalid email format", async () => {
      await loginPage.navigateToLogin();
      await loginPage.loginUser(TestDataHelper.getInvalidEmail(), TestDataHelper.getValidPassword());
      await loginPage.expectLoginError();
    });

    test.describe("Successful Login", () => {
      test("should login successfully with valid credentials", async () => {
        const testUser = TestDataHelper.getExistingTestUser();
        await loginPage.navigateToLogin();

        const responsePromise = page.waitForResponse((resp) => resp.url().includes(LOGIN_API_URL) && resp.status() === 200);

        await loginPage.loginUser(testUser.email, testUser.password);
        await responsePromise;

        await loginPage.expectSuccessfulLogin();
        await loginPage.expectNoLoginError();
      });

      test("should redirect to sessions page after successful login", async () => {
        const testUser = TestDataHelper.getExistingTestUser();
        await loginPage.navigateToLogin();
        await loginPage.loginUser(testUser.email, testUser.password);

        await expect(page).toHaveURL(/\/sessions/);
        await expect(page.getByTestId("sessions-page")).toBeVisible();
      });
    });

    test.describe("Login Form UI", () => {
      test("should show password when toggle button is clicked", async () => {
        await loginPage.navigateToLogin();
        const passwordInput = loginPage.passwordInput;

        await passwordInput.fill("testpassword");
        await expect(passwordInput).toHaveAttribute("type", "password");

        await page.getByRole("button", { name: "Show password" }).click();
        await expect(passwordInput).toHaveAttribute("type", "text");

        await page.getByRole("button", { name: "Hide password" }).click();
        await expect(passwordInput).toHaveAttribute("type", "password");
      });

      test("should disable submit button while loading", async () => {
        await loginPage.navigateToLogin();
        const submitButton = loginPage.submitButton;

        await expect(submitButton).toBeEnabled();

        const loginPromise = loginPage.loginUser(TestDataHelper.getExistingTestUser().email, TestDataHelper.getExistingTestUser().password);

        await expect(submitButton).toBeDisabled();
        await loginPromise;
      });
    });
  });
});
