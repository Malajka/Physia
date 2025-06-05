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
    this.errorMessage = page.locator("text=Invalid login credentials");
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
    await expect(this.errorMessage).toBeVisible({ timeout: 3000 });
  }

  async expectSuccessfulLogin() {
    // After successful login, user should be redirected away from login page
    await this.page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 10000 });
  }

  // Alias methods for consistency with other tests
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async expectNoLoginError() {
    // Check that login error is NOT visible (successful login)
    await expect(this.errorMessage).not.toBeVisible({ timeout: 3000 });
  }

  async clearForm() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
