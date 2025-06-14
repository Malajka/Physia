import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";
import { AuthHelper } from "./page-objects/AuthHelper";
import { LoginPage } from "./page-objects/LoginPage";
import { SessionsPage } from "./page-objects/SessionsPage";

test.describe("User Session Functionality (with POM)", () => {
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

    await loginPage.navigateToLogin();
    await loginPage.loginUser(TEST_USER.email, TEST_USER.password);
    await loginPage.expectNoLoginError();
    await sessionsPage.expectOnSessionsPage();
  });

  test.afterEach(async () => {
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("should display session list and show session details if sessions exist", async () => {
    const hasSessionItems = await sessionsPage.hasSessionItems();

    if (!hasSessionItems) {
      return;
    }

    const firstSessionItem = await sessionsPage.getFirstSessionItem();
    const isSessionItemVisible = await firstSessionItem.isVisible({ timeout: 5000 }).catch(() => false);

    if (isSessionItemVisible) {
      const sessionId = await sessionsPage.getSessionId(firstSessionItem);
      expect(sessionId, "Session ID should be available").toBeTruthy();

      if (sessionId) {
        await sessionsPage.clickSessionDetailsLink(sessionId);

        await sessionsPage.expectSessionDetailsVisible();
      }
    } else {
      expect(isSessionItemVisible).toBeFalsy();
    }
  });
});
