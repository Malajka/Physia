import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SessionsPage extends BasePage {
  readonly logoutButton: Locator;
  readonly logoutButtons: Locator;
  readonly sessionItems: Locator;
  readonly createFirstSessionButton: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = this.getByTestId("logout-button");
    this.logoutButtons = page.getByTestId("logout-button");
    this.sessionItems = page.locator('[data-testid^="session-item-"]');
    this.createFirstSessionButton = this.getByTestId("create-first-session");
  }

  async navigateToSessions() {
    await this.goto("/sessions");
    await this.waitForUrl("**/sessions");
  }

  async logout() {
    // Find and click visible logout button
    const buttons = await this.logoutButtons.all();
    let logoutButtonClicked = false;

    for (const btn of buttons) {
      if (await btn.isVisible()) {
        // Wait for logout response if available
        await btn.click();
        logoutButtonClicked = true;
        break;
      }
    }

    if (!logoutButtonClicked) {
      throw new Error("No visible logout button found");
    }

    return logoutButtonClicked;
  }

  async expectLogoutRedirect() {
    await expect(this.page).toHaveURL(/\/login/, { timeout: 10000 });
    await expect(this.page.getByTestId("login-submit")).toBeVisible({ timeout: 10000 });
  }

  async expectOnSessionsPage() {
    await expect(this.page).toHaveURL(/\/sessions/, { timeout: 10000 });
  }

  async verifyProtectedRouteRedirect(route: string) {
    await this.page.goto(route);
    await expect(this.page, `Route ${route} should redirect to login when not authenticated`).toHaveURL(/\/login/, {
      timeout: 5000,
    });
  }

  async verifyMultipleProtectedRoutes(routes: string[]) {
    for (const route of routes) {
      await this.verifyProtectedRouteRedirect(route);
    }
  }

  async clickCreateNewSession() {
    // Try desktop navigation link first
    const createNewSessionDesktop = this.getByTestId("create-new-session-desktop");
    if (await createNewSessionDesktop.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createNewSessionDesktop.click();
      return;
    }

    // Try mobile navigation link
    const createNewSessionMobile = this.getByTestId("create-new-session-mobile");
    if (await createNewSessionMobile.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createNewSessionMobile.click();
      return;
    }

    // Fallback: try the sessions page button for users with no sessions
    const createFirstSessionButton = this.getByTestId("create-first-session");
    if (await createFirstSessionButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createFirstSessionButton.click();
      return;
    }

    // Last fallback: navigate directly to body-parts
    await this.goto("/body-parts");
  }

  async waitForSessionItems() {
    await this.page.waitForSelector('[data-testid^="session-item-"]', { timeout: 10000 });
  }

  async hasSessionItems(): Promise<boolean> {
    try {
      await this.waitForSessionItems();
      return await this.sessionItems.first().isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  async getFirstSessionItem(): Promise<Locator> {
    return this.sessionItems.first();
  }

  async getSessionId(sessionItem: Locator): Promise<string | null> {
    const testId = await sessionItem.getAttribute("data-testid");
    return testId?.replace("session-item-", "") || null;
  }

  async clickSessionDetailsLink(sessionId: string) {
    const detailsLink = this.getByTestId(`session-details-link-${sessionId}`);
    await detailsLink.click();
  }

  async expectSessionDetailsVisible() {
    await expect(this.getByTestId("session-title")).toBeVisible();
    await expect(this.getByTestId("session-description")).toBeVisible();
    await expect(this.page.locator('[data-testid^="session-exercise-"]').first()).toBeVisible();
  }

  async expectNoSessionsVisible() {
    const hasItems = await this.hasSessionItems();
    expect(hasItems).toBeFalsy();
  }
}
