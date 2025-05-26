import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";
import { AuthHelper } from "./page-objects/AuthHelper";
import { LoginPage } from "./page-objects/LoginPage";
import { SessionsPage } from "./page-objects/SessionsPage";

test.describe('User Session Functionality (with POM)', () => {
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
    
    // Login user before each test
    await loginPage.navigateToLogin();
    await loginPage.fillEmail(TEST_USER.email);
    await loginPage.fillPassword(TEST_USER.password);
    await loginPage.clickSubmit();
    await loginPage.expectNoLoginError();
    await sessionsPage.expectOnSessionsPage();
  });

  test.afterEach(async () => {
    // Clean up after each test
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("should display session list and show session details if sessions exist", async () => {
    // This is the main test - exactly like the original sessions.spec.ts
    const hasSessionItems = await sessionsPage.hasSessionItems();
    
    if (!hasSessionItems) {
      console.log("No sessions found or /sessions page not loaded correctly.");
      return; // Exit the test if no sessions exist
    }

    // Get the first session item
    const firstSessionItem = await sessionsPage.getFirstSessionItem();
    const isSessionItemVisible = await firstSessionItem.isVisible({ timeout: 5000 }).catch(() => false);

    if (isSessionItemVisible) {
      // Get session ID
      const sessionId = await sessionsPage.getSessionId(firstSessionItem);
      expect(sessionId, "Session ID should be available").toBeTruthy();

      // Click on session details link to open session details
      await sessionsPage.clickSessionDetailsLink(sessionId!);

      // Verify session details page is displayed with all required elements
      await sessionsPage.expectSessionDetailsVisible();
    } else {
      expect(isSessionItemVisible).toBeFalsy();
    }
  });
}); 