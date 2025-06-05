import { fetchMuscleTests } from "@/lib/services/muscle-tests";
import { fetchArray } from "@/lib/utils/fetch";
import { validateBodyPartId, validateBodyPartsDto } from "@/lib/validators/bodyPart.validator";
import type { BodyPartDto, MuscleTestDto } from "@/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAllBodyParts, fetchMuscleTestsAndBodyPartName } from "./index";

// Mock dependencies
vi.mock("@/lib/utils/fetch", () => ({
  fetchArray: vi.fn(),
}));
vi.mock("@/lib/validators/bodyPart.validator", () => ({
  validateBodyPartId: vi.fn(),
  validateBodyPartsDto: vi.fn(),
}));
vi.mock("@/lib/services/muscle-tests", () => ({
  fetchMuscleTests: vi.fn(),
}));

describe("body-parts service", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchAllBodyParts", () => {
    const origin = "http://localhost";
    const bodyPartsRaw: BodyPartDto[] = [
      { id: 1, name: "Shoulder", created_at: "2024-01-01T00:00:00Z" },
      { id: 2, name: "Knee", created_at: "2024-01-01T00:00:00Z" },
    ];
    const validated: BodyPartDto[] = bodyPartsRaw;

    it("fetches and validates body parts", async () => {
      (fetchArray as ReturnType<typeof vi.fn>).mockResolvedValue(bodyPartsRaw);
      (validateBodyPartsDto as ReturnType<typeof vi.fn>).mockReturnValue(validated);
      const result = await fetchAllBodyParts(origin);
      expect(fetchArray).toHaveBeenCalledWith(`${origin}/api/body_parts`, undefined);
      expect(validateBodyPartsDto).toHaveBeenCalledWith(bodyPartsRaw);
      expect(result).toEqual(validated);
    });

    it("passes signal to fetchArray", async () => {
      (fetchArray as ReturnType<typeof vi.fn>).mockResolvedValue(bodyPartsRaw);
      (validateBodyPartsDto as ReturnType<typeof vi.fn>).mockReturnValue(validated);
      const signal = {} as AbortSignal;
      await fetchAllBodyParts(origin, { signal });
      expect(fetchArray).toHaveBeenCalledWith(`${origin}/api/body_parts`, signal);
    });

    it("throws if validation fails", async () => {
      (fetchArray as ReturnType<typeof vi.fn>).mockResolvedValue(bodyPartsRaw);
      (validateBodyPartsDto as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("Invalid");
      });
      await expect(fetchAllBodyParts(origin)).rejects.toThrow("Invalid");
    });
  });

  describe("fetchMuscleTestsAndBodyPartName", () => {
    const origin = "http://localhost";
    const bodyPartIdString = "1";
    const bodyPartId = 1;
    const muscleTests: MuscleTestDto[] = [{ id: 101, name: "Test 1", body_part_id: 1, description: "desc", created_at: "2024-01-01T00:00:00Z" }];
    const bodyParts: BodyPartDto[] = [
      { id: 1, name: "Shoulder", created_at: "2024-01-01T00:00:00Z" },
      { id: 2, name: "Knee", created_at: "2024-01-01T00:00:00Z" },
    ];

    it("fetches muscle tests and body part name", async () => {
      (validateBodyPartId as ReturnType<typeof vi.fn>).mockReturnValue(bodyPartId);
      (fetchMuscleTests as ReturnType<typeof vi.fn>).mockResolvedValue(muscleTests);
      (fetchArray as ReturnType<typeof vi.fn>).mockResolvedValue(bodyParts);
      (validateBodyPartsDto as ReturnType<typeof vi.fn>).mockReturnValue(bodyParts);
      const result = await fetchMuscleTestsAndBodyPartName(bodyPartIdString, origin);
      expect(validateBodyPartId).toHaveBeenCalledWith(bodyPartIdString);
      expect(fetchMuscleTests).toHaveBeenCalledWith(bodyPartId, origin);
      expect(result).toEqual({ muscleTests, bodyPartName: "Shoulder" });
    });

    it("returns empty string if body part not found", async () => {
      (validateBodyPartId as ReturnType<typeof vi.fn>).mockReturnValue(bodyPartId);
      (fetchMuscleTests as ReturnType<typeof vi.fn>).mockResolvedValue(muscleTests);
      (fetchArray as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 3, name: "Other", created_at: "2024-01-01T00:00:00Z" }]);
      (validateBodyPartsDto as ReturnType<typeof vi.fn>).mockReturnValue([{ id: 3, name: "Other", created_at: "2024-01-01T00:00:00Z" }]);
      const result = await fetchMuscleTestsAndBodyPartName(bodyPartIdString, origin);
      expect(result).toEqual({ muscleTests, bodyPartName: "" });
    });

    it("throws if validateBodyPartId throws", async () => {
      (validateBodyPartId as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("Invalid id");
      });
      await expect(fetchMuscleTestsAndBodyPartName(bodyPartIdString, origin)).rejects.toThrow("Invalid id");
    });
  });
});
