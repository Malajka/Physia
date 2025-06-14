import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.getByTestId("email");
    this.passwordInput = this.getByTestId("password");
    this.submitButton = this.getByTestId("login-submit");
    this.errorMessage = this.getByTestId("auth-form-errors");
  }

  async navigateToLogin() {
    await this.goto("/login");
    await expect(this.emailInput).toBeVisible();
  }

  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitLogin() {
    await this.submitButton.click();
  }

  async loginUser(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitLogin();
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  async expectNoLoginError() {
    await expect(this.errorMessage).not.toBeVisible({ timeout: 3000 });
  }

  async expectSuccessfulLogin() {
    await this.page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
  }
}
