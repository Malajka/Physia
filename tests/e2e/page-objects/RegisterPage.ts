import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class RegisterPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly submitButton: Locator;
  readonly form: Locator;
  readonly successMessage: Locator;
  readonly createFirstSessionLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator("form").first();
    this.emailInput = page.getByTestId("register-email");
    this.passwordInput = page.getByTestId("register-password");
    this.passwordConfirmInput = page.getByTestId("register-passwordConfirm");
    this.submitButton = page.getByTestId("register-submit");
    this.successMessage = page.locator("text=Registration Successful!");
    this.createFirstSessionLink = this.page.getByTestId("create-new-session-link");
    this.errorMessage = page.locator('[role="alert"]');
  }

  async goto() {
    await this.page.goto("/register");
    await this.waitForForm();
  }

  async waitForForm() {
    try {
      await expect(this.form).toBeVisible({ timeout: 10000 });
      await expect(this.emailInput).toBeVisible({ timeout: 10000 });
      await expect(this.passwordInput).toBeVisible({ timeout: 10000 });
      await expect(this.passwordConfirmInput).toBeVisible({ timeout: 10000 });
      await expect(this.submitButton).toBeVisible({ timeout: 10000 });
    } catch (error) {
      console.error("Form elements not visible:", error);
      // Take a screenshot for debugging
      await this.page.screenshot({ path: "form-not-visible.png" });
      throw error;
    }
  }

  async fillForm(email: string, password: string, passwordConfirm: string = password) {
    await this.waitForForm();

    try {
      // Clear and fill email
      await this.emailInput.clear();
      await this.emailInput.fill(email);
      await this.page.waitForTimeout(100);

      // Clear and fill password
      await this.passwordInput.clear();
      await this.passwordInput.fill(password);
      await this.page.waitForTimeout(100);

      // Clear and fill password confirmation
      await this.passwordConfirmInput.clear();
      await this.passwordConfirmInput.fill(passwordConfirm);
      await this.page.waitForTimeout(100);

      // Verify values
      const emailValue = await this.emailInput.inputValue();
      const passwordValue = await this.passwordInput.inputValue();
      const confirmValue = await this.passwordConfirmInput.inputValue();

      if (emailValue !== email || passwordValue !== password || confirmValue !== passwordConfirm) {
        throw new Error("Form values do not match input values");
      }
    } catch (error) {
      console.error("Error filling form:", error);
      await this.page.screenshot({ path: "form-fill-error.png" });
      throw error;
    }
  }

  async submit() {
    try {
      // Ensure button is enabled
      await expect(this.submitButton).toBeEnabled({ timeout: 5000 });

      // Click and wait for response
      await Promise.all([this.page.waitForLoadState("networkidle"), this.submitButton.click()]);

      // Check for errors
      const hasError = await this.errorMessage.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await this.errorMessage.textContent();
        throw new Error(`Registration failed: ${errorText}`);
      }

      // Wait for success
      await expect(this.successMessage).toBeVisible({ timeout: 15000 });
      await expect(this.page).toHaveURL(/\/body-parts/, { timeout: 15000 });
    } catch (error) {
      console.error("Error during form submission:", error);
      await this.page.screenshot({ path: "submit-error.png" });
      throw error;
    }
  }

  async register(email: string, password: string) {
    await this.fillForm(email, password);
    await this.submit();
  }

  async expectSuccessfulRegistration() {
    await expect(this.successMessage).toBeVisible({ timeout: 15000 });
    await expect(this.createFirstSessionLink).toBeVisible({ timeout: 15000 });
    await expect(this.createFirstSessionLink).toHaveAttribute("href", "/body-parts");
    await expect(this.createFirstSessionLink).toHaveText(/Create First Session/i);

    // Verify we're redirected to the correct page
    await expect(this.page).toHaveURL(/\/body-parts/, { timeout: 15000 });
  }

  async expectValidationError(errorText: string) {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
    await expect(this.errorMessage).toContainText(errorText);
  }

  async expectEmailAlreadyRegisteredError() {
    await this.expectValidationError("This email is already registered.");
    const loginLink = this.page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveText(/log in/i);
    await expect(loginLink).toHaveClass(/text-blue-600/);
  }

  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
    await this.passwordConfirmInput.clear();

    try {
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        if ("indexedDB" in window) {
          window.indexedDB.databases().then((dbs) => {
            dbs.forEach((db) => {
              if (db.name) {
                window.indexedDB.deleteDatabase(db.name);
              }
            });
          });
        }
      });
    } catch (error) {
      console.log("Could not clear storage:", error);
    }
  }
}
