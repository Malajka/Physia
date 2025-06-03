import { expect, test } from "@playwright/test";
import { AuthHelper } from "./page-objects/AuthHelper";
import { LoginPage } from "./page-objects/LoginPage";
import { SessionsPage } from "./page-objects/SessionsPage";
import { TestDataHelper } from "./page-objects/TestDataHelper";

test.describe("User Logout (with POM)", () => {
  let page: any;
  let context: any;
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

  test("should log out successfully and redirect to login page", async () => {
    const testUser = TestDataHelper.getExistingTestUser();

    // Login first
    await loginPage.navigateToLogin();
    await loginPage.loginUser(testUser.email, testUser.password);
    await sessionsPage.expectOnSessionsPage();

    // Check for login error messages
    const loginErrorMessage = page.locator("text=Invalid login credentials");
    await expect(loginErrorMessage).toHaveCount(0);

    // Logout
    const logoutSuccess = await sessionsPage.logout();
    expect(logoutSuccess, "Should find and click a visible logout button").toBe(true);

    // Verify logout redirect
    await sessionsPage.expectLogoutRedirect();

    // Verify we're actually logged out by checking protected page access
    await sessionsPage.verifyProtectedRouteRedirect("/sessions");
  });

  test("should handle logout when already logged out", async () => {
    // Navigate directly to login page (user not logged in)
    await loginPage.navigateToLogin();

    // Try to access logout endpoint directly
    const logoutResponse = await page.request.post("/api/auth/logout").catch(() => null);

    // Should still be on login page or handle gracefully
    await loginPage.navigateToLogin();
  });

  test("should logout and prevent access to protected routes", async () => {
    const testUser = TestDataHelper.getExistingTestUser();

    // Login first
    await loginPage.navigateToLogin();
    await loginPage.loginUser(testUser.email, testUser.password);
    await sessionsPage.expectOnSessionsPage();

    // Logout
    await sessionsPage.logout();

    // Verify logout redirect
    await sessionsPage.expectLogoutRedirect();

    // Test that protected routes redirect to login
    const protectedRoutes = ["/sessions", "/body-parts"];
    await sessionsPage.verifyMultipleProtectedRoutes(protectedRoutes);
  });
});
