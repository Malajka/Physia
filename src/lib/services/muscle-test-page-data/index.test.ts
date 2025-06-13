import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { APIContext } from "astro";
import { fetchMuscleTestsAndBodyPartName } from "../body-parts";
import { getMuscleTestsPageData } from "./index";

vi.mock("../body-parts");
const mockedFetchData = vi.mocked(fetchMuscleTestsAndBodyPartName);

const createMockContext = (bodyPartId: string, cookie?: string): APIContext => {
  const headers = new Headers();
  if (cookie) {
    headers.set("cookie", cookie);
  }
  return {
    params: { body_part_id: bodyPartId },
    request: new Request(`http://test.com/muscle-tests/${bodyPartId}`, {
      headers,
    }),
    url: new URL(`http://test.com/muscle-tests/${bodyPartId}`),
  } as APIContext;
};

describe("getMuscleTestsPageData", () => {
  const mockData = {
    muscleTests: [{ id: 1, name: "Test", description: "", body_part_id: 5, created_at: "2024-01-01T00:00:00Z" }],
    bodyPartName: "Shoulder",
  };
  const backLink = { href: "/body-parts", text: "← Go back to Body Part Selection" };

  beforeEach(() => {
    mockedFetchData.mockResolvedValue(mockData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("on success", () => {
    it("should pass the cookie header to the fetch call when it exists", async () => {
      const context = createMockContext("5", "session=my-secret-token");
      await getMuscleTestsPageData(context);

      expect(mockedFetchData).toHaveBeenCalledWith("5", "http://test.com", { headers: { cookie: "session=my-secret-token" } });
    });

    it("should pass an empty headers object when no cookie exists", async () => {
      const context = createMockContext("5"); // No cookie
      await getMuscleTestsPageData(context);

      expect(mockedFetchData).toHaveBeenCalledWith("5", "http://test.com", { headers: {} });
    });

    it("should return correctly formatted page data", async () => {
      const context = createMockContext("5");
      const result = await getMuscleTestsPageData(context);

      expect(result).toEqual({
        muscleTests: mockData.muscleTests,
        pageTitle: `Muscle Tests for ${mockData.bodyPartName}`,
        bodyPartId: 5,
        fetchError: null,
        backLink,
      });
    });
  });

  describe("on failure", () => {
    it("should return an error state when the fetch call fails", async () => {
      const fetchError = new Error("API is down");
      mockedFetchData.mockRejectedValue(fetchError);
      const context = createMockContext("5");

      const result = await getMuscleTestsPageData(context);

      expect(result).toEqual({
        muscleTests: [],
        pageTitle: "Error",
        bodyPartId: 5,
        fetchError: ["API is down"],
        backLink,
      });
    });
  });
});
