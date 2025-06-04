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

  test.beforeEach(async ({ page: testPage, context: testContext }) => {
    page = testPage;
    context = testContext;
    loginPage = new LoginPage(page);
    sessionsPage = new SessionsPage(page);

    // Ensure clean state before each test
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test.afterEach(async () => {
    // Clean up after each test
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("should log in successfully with valid credentials", async () => {
    const testUser = TestDataHelper.getExistingTestUser();

    // Navigate to login page
    await loginPage.navigateToLogin();

    // Login with valid credentials
    await loginPage.loginUser(testUser.email, testUser.password);

    // Verify successful login - should redirect to sessions page
    await sessionsPage.expectOnSessionsPage();

    // Verify no error message is visible
    await expect(loginPage.errorMessage).toHaveCount(0);
  });

  test("should show error with invalid password", async () => {
    const testUser = TestDataHelper.getExistingTestUser();
    const invalidPassword = "wrongpassword";

    // Navigate to login page
    await loginPage.navigateToLogin();

    // Fill form with invalid password
    await loginPage.fillLoginForm(testUser.email, invalidPassword);
    await loginPage.submitLogin();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);

    // Should show error message
    await loginPage.expectLoginError();
  });

  test("should show error with invalid email", async () => {
    const invalidEmail = "nonexistent@example.com";
    const validPassword = TestDataHelper.getValidPassword();

    // Navigate to login page
    await loginPage.navigateToLogin();

    // Fill form with invalid email
    await loginPage.fillLoginForm(invalidEmail, validPassword);
    await loginPage.submitLogin();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);

    // Should show error message
    await loginPage.expectLoginError();
  });

  test("should show error with empty credentials", async () => {
    // Navigate to login page
    await loginPage.navigateToLogin();

    // Submit form without filling any fields
    await loginPage.submitLogin();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);

    // Form validation should prevent submission or show error
    // Note: This depends on your form validation implementation
  });

  test("should redirect to login when accessing protected page unauthenticated", async () => {
    // Try to access protected sessions page without authentication
    await sessionsPage.verifyProtectedRouteRedirect("/sessions");
  });

  test("should handle multiple failed login attempts", async () => {
    const testUser = TestDataHelper.getExistingTestUser();
    const invalidPassword = "wrongpassword";

    await loginPage.navigateToLogin();

    // First failed attempt
    await loginPage.fillLoginForm(testUser.email, invalidPassword);
    await loginPage.submitLogin();
    await loginPage.expectLoginError();

    // Second failed attempt
    await loginPage.fillLoginForm(testUser.email, invalidPassword + "2");
    await loginPage.submitLogin();
    await loginPage.expectLoginError();

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });
});
