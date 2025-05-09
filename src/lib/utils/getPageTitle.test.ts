import { describe, expect, it } from "vitest";
import { getPageTitle } from "./getPageTitle";

describe("getPageTitle", () => {
  it("returns the title with the body part name if provided", () => {
    expect(getPageTitle("Biceps", 1)).toBe("Muscle Tests for Biceps");
  });
  it("returns the title with the body part id if name is not provided", () => {
    expect(getPageTitle("", 5)).toBe("Muscle Tests for Body Part 5");
  });
}); 