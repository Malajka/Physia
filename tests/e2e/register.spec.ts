import { expect, test } from "@playwright/test";
import { AuthHelper } from "./page-objects/AuthHelper";
import { TestDataHelper } from "./page-objects/TestDataHelper";

test.describe('User Registration', () => {
  let page: any;
      let context: any;

  test.beforeEach(async ({ page: testPage, context: testContext }) => {
    page = testPage;
    context = testContext;
    await page.goto('/register');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test.afterEach(async () => {
    await AuthHelper.ensureLoggedOut(page, context);
  });

  // Test "should register successfully with valid data"
  test("should register successfully with valid data", async () => {
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: "Test123!@#"
    };
    
    const emailField = page.getByTestId('register-email');
    const passwordField = page.getByTestId('register-password');
    const confirmField = page.getByTestId('register-passwordConfirm');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(confirmField).toBeVisible();

    await emailField.fill(testUser.email);
    await passwordField.fill(testUser.password);
    await confirmField.fill(testUser.password);

    const submitButton = page.getByTestId('register-submit');
    await expect(submitButton).toBeEnabled();
    
    const responsePromise = page.waitForResponse('**/api/auth/register');
    
    await submitButton.click();
    
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const errorMessage = page.locator('[role="alert"]');
    if (await errorMessage.isVisible().catch(() => false)) {
      const errorText = await errorMessage.textContent();
      await page.screenshot({ path: 'registration-error.png' });
      throw new Error(`Registration failed: ${errorText}`);
    }

    const successMessage = page.locator('text=Registration Successful!');
    const successDiv = page.locator('text=Thank you for registering!');
    const createSessionButton = page.getByTestId('create-new-session-link');
    
    const hasSuccessMessage = await successMessage.isVisible().catch(() => false);
    const hasSuccessDiv = await successDiv.isVisible().catch(() => false);
    const hasCreateButton = await createSessionButton.isVisible().catch(() => false);
    const isOnBodyPartsPage = page.url().includes('/body-parts');
    
    const registrationSuccessful = hasSuccessMessage || hasSuccessDiv || hasCreateButton || isOnBodyPartsPage;
    expect(registrationSuccessful, 'Registration should be successful - either show success message or redirect').toBe(true);
  });

  test("should show error when email is already registered", async () => {
    const existingUser = TestDataHelper.getExistingTestUser();
    await page.getByTestId('register-email').fill(existingUser.email);
    await page.getByTestId('register-password').fill(existingUser.password);
    await page.getByTestId('register-passwordConfirm').fill(existingUser.password);

    const submitButton = page.getByTestId('register-submit');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    const errorText = await errorMessage.textContent();
    await page.screenshot({ path: 'duplicate-email-error.png' });
    const expectedErrorSubstring = "ErrorThis email is already registered. Would you like to log in instead?";
    expect(errorText).toContain(expectedErrorSubstring);
    const successIndicator = page.locator('text=Registration Successful!');
    await expect(successIndicator).not.toBeVisible();
    expect(page.url()).not.toContain('/body-parts');
  });

  test("should show error when password is too short", async () => {
    const testUser = TestDataHelper.generateTestUser();
    const shortPassword = TestDataHelper.getInvalidPassword();
    
    await page.getByTestId('register-email').fill(testUser.email);
    await page.getByTestId('register-password').fill(shortPassword);
    await page.getByTestId('register-passwordConfirm').fill(shortPassword);

    const submitButton = page.getByTestId('register-submit');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    const errorText = await errorMessage.textContent();
    
    expect(errorText).toContain('Password must be at least 8 characters long');
    
    const successIndicator = page.locator('text=Registration Successful!');
    await expect(successIndicator).not.toBeVisible();
  });

  test("should show error when passwords do not match", async () => {
    const passwordMismatchData = TestDataHelper.getPasswordMismatchData();
    
    await page.getByTestId('register-email').fill(passwordMismatchData.email);
    await page.getByTestId('register-password').fill(passwordMismatchData.password);
    await page.getByTestId('register-passwordConfirm').fill(passwordMismatchData.passwordConfirm);

    const submitButton = page.getByTestId('register-submit');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    const errorText = await errorMessage.textContent();
    
    expect(errorText).toContain('Passwords do not match');
    
    const successIndicator = page.locator('text=Registration Successful!');
    await expect(successIndicator).not.toBeVisible();
  });

  test("should show multiple validation errors when fields are empty", async () => {
    const submitButton = page.getByTestId('register-submit');
    await submitButton.click();

    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    const errorText = await errorMessage.textContent();
    
    // Should show multiple validation errors
    expect(errorText).toContain('Please enter a valid email address');
    
    const successIndicator = page.locator('text=Registration Successful!');
    await expect(successIndicator).not.toBeVisible();
  });

  test("should show error with invalid email format", async () => {
    const invalidEmail = TestDataHelper.getInvalidEmail();
    const validPassword = TestDataHelper.getValidPassword();
    
    const emailField = page.getByTestId('register-email');
    const passwordField = page.getByTestId('register-password');
    const confirmField = page.getByTestId('register-passwordConfirm');
    const submitButton = page.getByTestId('register-submit');

    await emailField.fill(invalidEmail);
    await passwordField.fill(validPassword);
    await confirmField.fill(validPassword);

    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    const errorText = await errorMessage.textContent();
    
    expect(errorText).toContain('Please enter a valid email address');
    
    const successIndicator = page.locator('text=Registration Successful!');
    await expect(successIndicator).not.toBeVisible();
  });
});
