import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { AuthHelper } from "./page-objects/AuthHelper";
import { RegisterPage } from "./page-objects/RegisterPage";
import { TestDataHelper } from "./page-objects/TestDataHelper";

test.describe("User Registration (with POM)", () => {
  let page: Page;
  let context: BrowserContext;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page: testPage, context: testContext }) => {
    page = testPage;
    context = testContext;
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test.afterEach(async () => {
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("should register successfully with valid data", async () => {
    const testUser = TestDataHelper.generateTestUser();

    await registerPage.fillForm(testUser.email, testUser.password);

    const responsePromise = page.waitForResponse("**/api/auth/register");
    await registerPage.submitButton.click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Check for registration success
    const hasSuccessMessage = await registerPage.successMessage.isVisible().catch(() => false);
    const hasCreateButton = await registerPage.createFirstSessionLink.isVisible().catch(() => false);
    const isOnBodyPartsPage = page.url().includes("/body-parts");

    const registrationSuccessful = hasSuccessMessage || hasCreateButton || isOnBodyPartsPage;
    expect(registrationSuccessful, "Registration should be successful").toBe(true);
  });

  test("should show error when email is already registered", async () => {
    const existingUser = TestDataHelper.getExistingTestUser();
    const validPassword = TestDataHelper.getValidPassword(); // Use valid password to avoid password validation errors

    await registerPage.fillForm(existingUser.email, validPassword);
    await registerPage.submitButton.click();

    await registerPage.expectValidationError("This email is already registered");
    await expect(registerPage.successMessage).not.toBeVisible();
    expect(page.url()).not.toContain("/body-parts");
  });

  test("should show error when password is too short", async () => {
    const testUser = TestDataHelper.generateTestUser();
    const shortPassword = TestDataHelper.getInvalidPassword();

    await registerPage.fillForm(testUser.email, shortPassword);
    await registerPage.submitButton.click();

    await registerPage.expectValidationError("Password must be at least 8 characters long");
    await expect(registerPage.successMessage).not.toBeVisible();
  });

  test("should show error when passwords do not match", async () => {
    const passwordMismatchData = TestDataHelper.getPasswordMismatchData();

    await registerPage.fillForm(passwordMismatchData.email, passwordMismatchData.password, passwordMismatchData.passwordConfirm);
    await registerPage.submitButton.click();

    await registerPage.expectValidationError("Passwords do not match");
    await expect(registerPage.successMessage).not.toBeVisible();
  });

  test("should show multiple validation errors when fields are empty", async () => {
    await registerPage.submitButton.click();

    await registerPage.expectValidationError("Please enter a valid email address");
    await expect(registerPage.successMessage).not.toBeVisible();
  });

  test("should show error with invalid email format", async () => {
    const invalidEmail = TestDataHelper.getInvalidEmail();
    const validPassword = TestDataHelper.getValidPassword();

    await registerPage.fillForm(invalidEmail, validPassword);
    await registerPage.submitButton.click();

    await registerPage.expectValidationError("Please enter a valid email address");
    await expect(registerPage.successMessage).not.toBeVisible();
  });
});
