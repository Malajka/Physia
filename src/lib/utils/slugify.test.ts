import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("replaces spaces with dashes and lowercases the string", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("Test Test TEST")).toBe("test-test-test");
    expect(slugify("Zażółć Gęślą Jaźń")).toBe("zażółć-gęślą-jaźń");
  });
  it("does not change an already slugified string", () => {
    expect(slugify("already-slugified")).toBe("already-slugified");
  });
}); 