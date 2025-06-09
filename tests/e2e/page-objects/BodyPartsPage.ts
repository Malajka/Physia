import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class BodyPartsPage extends BasePage {
  readonly disclaimerAcceptButton: Locator;
  readonly nextButton: Locator;
  readonly infoBar: Locator;

  constructor(page: Page) {
    super(page);
    this.disclaimerAcceptButton = this.getByTestId("accept-disclaimer");
    this.nextButton = this.getByTestId("body-part-next");
    this.infoBar = this.getByTestId("info-bar");
  }

  async navigateToBodyParts() {
    await this.goto("/body-parts");
    await this.page.waitForURL("**/body-parts", { timeout: 10000 });
  }

  async acceptDisclaimerIfVisible() {
    try {
      if (await this.disclaimerAcceptButton.isVisible({ timeout: 5000 })) {
        await this.disclaimerAcceptButton.click();
      }
    } catch {
      // Disclaimer not found or not visible, continuing...
    }
  }

  async selectBodyPart(bodyPartTestId: string) {
    const bodyPartButton = this.getByTestId(bodyPartTestId);
    await expect(bodyPartButton, `Body part button '${bodyPartTestId}' should be visible.`).toBeVisible({ timeout: 20000 });
    await bodyPartButton.click();
  }

  async clickNext() {
    await expect(this.nextButton, "'Next' button should be enabled after selecting a body part.").toBeEnabled({ timeout: 10000 });
    await this.nextButton.click();
  }

  async expectInfoBarVisible() {
    await expect(this.infoBar).toBeVisible();
  }

  async expectNextButtonEnabled() {
    await expect(this.nextButton).toBeEnabled();
  }

  async expectNextButtonDisabled() {
    await expect(this.nextButton).toBeDisabled();
  }

  async selectBodyPartAndProceed(bodyPartTestId: string) {
    await this.acceptDisclaimerIfVisible();
    await this.selectBodyPart(bodyPartTestId);
    await this.clickNext();
  }
}
