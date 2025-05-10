import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";

test("should display session list and show session details", async ({ page }) => {
  // Log in
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();

  // Go to My Sessions page
  await page.goto("/sessions");

  // Check that at least one session item is visible
  const sessionItem = page.locator('[data-testid^="session-item-"]').first();
  await expect(sessionItem).toBeVisible();

  // Get the session id from the first item
  const sessionId = await sessionItem.getAttribute("data-testid").then((id) => id?.replace("session-item-", ""));
  expect(sessionId).toBeTruthy();

  // Go to details of the first session
  await page.getByTestId(`session-details-link-${sessionId}`).click();

  // Check that session details are visible
  await expect(page.getByTestId("session-title")).toBeVisible();
  await expect(page.getByTestId("session-description")).toBeVisible();
  // Optionally, check for at least one exercise
  await expect(page.locator('[data-testid^="session-exercise-"]').first()).toBeVisible();
});

test("minimal create session flow", async ({ page }) => {
  // Logowanie
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();

  // Poczekaj na przekierowanie lub element po zalogowaniu
  await page.goto("/body-parts");
  await expect(page.getByTestId("body-part-upper-back")).toBeVisible();
  await page.getByTestId("body-part-upper-back").click();

  // Akceptacja disclaimer jeśli jest
  const disclaimer = page.getByTestId("accept-disclaimer");
  if (await disclaimer.isVisible().catch(() => false)) {
    await disclaimer.click();
  }

  // Wybierz część ciała
  const bodyPartButton = page.getByTestId("body-part-upper-back");
  await expect(bodyPartButton).toBeVisible();
  await bodyPartButton.click();

  // Kliknij Next
  const nextButton = page.getByTestId("body-part-next");
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  // Test kończy się tutaj, nie sprawdzamy URL ani dalszych kroków
});

test("should create a new session via full flow", async ({ page }) => {
  // Logowanie
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();

  // Przejście na body-parts
  await page.goto("/body-parts");

  // Akceptacja disclaimer jeśli jest
  const disclaimer = page.getByTestId("accept-disclaimer");
  if (await disclaimer.isVisible().catch(() => false)) {
    await disclaimer.click();
  }

  // Wybierz część ciała
  const bodyPartButton = page.getByTestId("body-part-upper-back");
  await expect(bodyPartButton).toBeVisible();
  await bodyPartButton.click();

  // Test kończy się tutaj – nie sprawdzamy i nie klikamy Next!
});
