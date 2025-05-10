import { expect, test } from "@playwright/test";
import { TEST_USER } from "./config";

test("muscle tests view: slider and create session button", async ({ page }) => {
  // Logowanie
  await page.goto("/login");
  await page.getByTestId("email").fill(TEST_USER.email);
  await page.getByTestId("password").fill(TEST_USER.password);
  await page.getByTestId("login-submit").click();

  // Przejście na body-parts i wybór części ciała
  await page.goto("/body-parts");
  await expect(page.getByTestId("body-part-upper-back")).toBeVisible();
  await page.getByTestId("body-part-upper-back").click();

  // Click the Next button (with data-testid)
  const nextButton = page.getByTestId("body-part-next");
  await expect(nextButton).toBeEnabled();
  await nextButton.click();
});
