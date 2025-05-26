import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MuscleTestsPage extends BasePage {
  readonly muscleTestHeading: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.muscleTestHeading = this.page.getByRole("heading", { name: /muscle test/i }).first();
    this.nextButton = this.getByTestId('muscle-test-next');
  }

  async navigateToMuscleTests(bodyPartId?: number) {
    if (bodyPartId) {
      await this.goto(`/muscle-tests/${bodyPartId}`);
    } else {
      // For cases where we don't know the body part ID, we'll rely on navigation flow
      throw new Error('Body part ID is required to navigate to muscle tests');
    }
  }

  async waitForMuscleTestsToLoad() {
    await expect(this.muscleTestHeading).toBeVisible({ timeout: 15000 });
  }

  async expectOnMuscleTestsPage() {
    await expect(this.page).toHaveURL(/\/muscle-tests\/\d+/, { timeout: 10000 });
    await this.waitForMuscleTestsToLoad();
  }

  async getSlider(sliderId: string) {
    const sliderContainer = this.getByTestId(sliderId);
    return sliderContainer.getByRole("slider");
  }

  async setSliderValue(sliderId: string, value: number) {
    const slider = await this.getSlider(sliderId);
    await expect(slider).toBeVisible();
    
    // Focus the slider and set value using keyboard events
    await slider.focus();
    
    // Reset to 0 first by pressing Home key
    await this.page.keyboard.press("Home");
    
    // Then press ArrowRight the desired number of times
    for (let i = 0; i < value; i++) {
      await this.page.keyboard.press("ArrowRight");
    }
    
    // Verify the value was set correctly
    await expect(slider).toHaveAttribute("aria-valuenow", value.toString());
  }

  async expectNextButtonEnabled() {
    await expect(this.nextButton).toBeEnabled();
  }

  async expectNextButtonDisabled() {
    await expect(this.nextButton).toBeDisabled();
  }

  async clickNext() {
    await this.expectNextButtonEnabled();
    await this.nextButton.click();
  }

  async expectMuscleTestsPageVisible() {
    await expect(this.muscleTestHeading).toBeVisible({ timeout: 15000 });
  }

  async setMultipleSliderValues(sliderValues: Record<string, number>) {
    for (const [sliderId, value] of Object.entries(sliderValues)) {
      await this.setSliderValue(sliderId, value);
    }
  }

  async expectSliderValue(sliderId: string, expectedValue: number) {
    const slider = await this.getSlider(sliderId);
    await expect(slider).toHaveAttribute("aria-valuenow", expectedValue.toString());
  }
} 