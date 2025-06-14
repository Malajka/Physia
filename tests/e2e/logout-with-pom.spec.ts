import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { AuthHelper } from "./page-objects/AuthHelper";
import { LoginPage } from "./page-objects/LoginPage";
import { SessionsPage } from "./page-objects/SessionsPage";
import { TestDataHelper } from "./page-objects/TestDataHelper";

test.describe("User Logout (with POM)", () => {
  let page: Page;
  let context: BrowserContext;
  let loginPage: LoginPage;
  let sessionsPage: SessionsPage;

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

  test("should log out successfully and redirect to login page", async () => {
    const testUser = TestDataHelper.getExistingTestUser();

    await loginPage.navigateToLogin();
    await loginPage.loginUser(testUser.email, testUser.password);
    await sessionsPage.expectOnSessionsPage();

    const loginErrorMessage = page.locator("text=Invalid login credentials");
    await expect(loginErrorMessage).toHaveCount(0);

    const logoutSuccess = await sessionsPage.logout();
    expect(logoutSuccess, "Should find and click a visible logout button").toBe(true);

    await sessionsPage.expectLogoutRedirect();

    await sessionsPage.verifyProtectedRouteRedirect("/sessions");
  });

  test("should handle logout when already logged out", async () => {
    await loginPage.navigateToLogin();

    await page.request.post("/api/auth/logout").catch(() => null);

    await loginPage.navigateToLogin();
  });

  test("should logout and prevent access to protected routes", async () => {
    const testUser = TestDataHelper.getExistingTestUser();

    await loginPage.navigateToLogin();
    await loginPage.loginUser(testUser.email, testUser.password);
    await sessionsPage.expectOnSessionsPage();

    await sessionsPage.logout();

    await sessionsPage.expectLogoutRedirect();

    const protectedRoutes = ["/sessions", "/body-parts"];
    await sessionsPage.verifyMultipleProtectedRoutes(protectedRoutes);
  });
});
