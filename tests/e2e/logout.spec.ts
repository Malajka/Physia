import { expect, test } from "@playwright/test";
import { AuthHelper } from "./page-objects/AuthHelper";
import { TestDataHelper } from "./page-objects/TestDataHelper";

test.describe('User Logout', () => {
  let page: any;
  let context: any;

  test.beforeEach(async ({ page: testPage, context: testContext }) => {
    page = testPage;
    context = testContext;
    
    // Ensure clean state before each test
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test.afterEach(async () => {
    // Clean up after each test
    await AuthHelper.ensureLoggedOut(page, context);
  });

  test("should log out successfully and redirect to login page", async () => {
    const testUser = TestDataHelper.getExistingTestUser();
    
    // Navigate to login page
    await page.goto("/login");
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    
    // Fill login form
    const emailField = page.getByTestId("email");
    const passwordField = page.getByTestId("password");
    const loginButton = page.getByTestId("login-submit");
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    await emailField.fill(testUser.email);
    await passwordField.fill(testUser.password);
    
    // Wait for login response
    const loginResponsePromise = page.waitForResponse('**/api/auth/login').catch(() => null);
    await loginButton.click();
    
    // Verify successful login
    await expect(page).toHaveURL(/\/sessions/, { timeout: 10000 });
    
    // Check for login error messages
    const loginErrorMessage = page.locator("text=Invalid login credentials");
    await expect(loginErrorMessage).toHaveCount(0);
    
    // Find and click logout button
    const logoutButtons = await page.getByTestId("logout-button").all();
    let logoutButtonClicked = false;
    
    for (const btn of logoutButtons) {
      if (await btn.isVisible()) {
        // Wait for logout response if available
        const logoutResponsePromise = page.waitForResponse('**/api/auth/logout').catch(() => null);
        await btn.click();
        logoutButtonClicked = true;
        break;
      }
    }
    
    expect(logoutButtonClicked, 'Should find and click a visible logout button').toBe(true);
    
    // Verify successful logout and redirect
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await expect(page.getByTestId("login-submit")).toBeVisible({ timeout: 10000 });
    
    // Verify we're actually logged out by checking we can't access protected pages
    await page.goto("/sessions");
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("should handle logout when already logged out", async () => {
    // Navigate directly to login page (user not logged in)
    await page.goto("/login");
    await expect(page.getByTestId("login-submit")).toBeVisible({ timeout: 10000 });
    
    // Try to access logout endpoint directly
    const logoutResponse = await page.request.post('/api/auth/logout').catch(() => null);
    
    // Should still be on login page or handle gracefully
    await page.goto("/login");
    await expect(page.getByTestId("login-submit")).toBeVisible({ timeout: 10000 });
  });

  test("should logout and prevent access to protected routes", async () => {
    const testUser = TestDataHelper.getExistingTestUser();
    
    // Login first
    await page.goto("/login");
    await page.getByTestId("email").fill(testUser.email);
    await page.getByTestId("password").fill(testUser.password);
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/sessions/, { timeout: 10000 });
    
    // Logout
    const logoutButtons = await page.getByTestId("logout-button").all();
    for (const btn of logoutButtons) {
      if (await btn.isVisible()) {
        await btn.click();
        break;
      }
    }
    
    // Verify logout redirect
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    
    // Test that protected routes redirect to login
    const protectedRoutes = ["/sessions", "/body-parts"];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page, `Route ${route} should redirect to login when not authenticated`).toHaveURL(/\/login/, { 
        timeout: 5000
      });
    }
  });
});
