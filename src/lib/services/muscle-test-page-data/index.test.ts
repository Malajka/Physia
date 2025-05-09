import * as bodyPartsService from "@/lib/services/body-parts";
import * as pageTitleUtil from "@/lib/utils/getPageTitle";
import * as validator from "@/lib/validators/bodyPart.validator";
import type { AstroGlobal } from "astro";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMuscleTestsPageData } from "./index";

const astroGlobalMock: Pick<AstroGlobal, "params" | "request"> = {
  params: { body_part_id: "5" },
  request: new Request("https://example.com/muscle-tests/5"),
};

const backLink = { href: "/body-parts", label: "← Go back to body parts selection" };

describe("getMuscleTestsPageData", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns page data (happy path)", async () => {
    vi.spyOn(validator, "validateBodyPartId").mockReturnValue(5);
    vi.spyOn(bodyPartsService, "fetchMuscleTestsAndBodyPartName").mockResolvedValue({
      muscleTests: [{ id: 1, name: "Test", description: "desc", body_part_id: 5, created_at: "2024-01-01T00:00:00Z" }],
      bodyPartName: "Shoulder",
    });
    vi.spyOn(pageTitleUtil, "getPageTitle").mockReturnValue("Shoulder (5)");

    const result = await getMuscleTestsPageData(astroGlobalMock as AstroGlobal);
    expect(result).toEqual({
      muscleTests: [{ id: 1, name: "Test", description: "desc", body_part_id: 5, created_at: "2024-01-01T00:00:00Z" }],
      fetchError: null,
      pageTitle: "Shoulder (5)",
      bodyPartId: 5,
      backLink,
    });
  });

  it("returns error and empty muscleTests on fetch error", async () => {
    vi.spyOn(validator, "validateBodyPartId").mockReturnValue(5);
    vi.spyOn(bodyPartsService, "fetchMuscleTestsAndBodyPartName").mockRejectedValue(new Error("fail"));
    vi.spyOn(pageTitleUtil, "getPageTitle").mockReturnValue("(5)");

    const result = await getMuscleTestsPageData(astroGlobalMock as AstroGlobal);
    expect(result).toEqual({
      muscleTests: [],
      fetchError: "fail",
      pageTitle: "(5)",
      bodyPartId: 5,
      backLink,
    });
  });
});
