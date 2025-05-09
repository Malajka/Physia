import { describe, expect, it } from "vitest";
import { bodyPartImages } from "./bodyPartImages";

describe("bodyPartImages", () => {
  it("contains correct mappings for known body part IDs", () => {
    expect(bodyPartImages[1]).toBe("/images/body-parts/upper-back.png");
    expect(bodyPartImages[2]).toBe("/images/body-parts/arm.png");
    expect(bodyPartImages[3]).toBe("/images/body-parts/lower-back.png");
    expect(bodyPartImages[4]).toBe("/images/body-parts/leg.png");
  });

  it("returns undefined for unknown body part IDs", () => {
    expect(bodyPartImages[999]).toBeUndefined();
    expect(bodyPartImages[0]).toBeUndefined();
  });
}); 