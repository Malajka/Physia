import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchArray } from "@/lib/utils/fetch";
import { validateBodyPartId, validateBodyPartsDto } from "@/lib/validators/bodyPart.validator";
import { fetchMuscleTests } from "../muscle-tests";
import { fetchAllBodyParts, fetchMuscleTestsAndBodyPartName } from "./index";

vi.mock("@/lib/utils/fetch");
vi.mock("@/lib/validators/bodyPart.validator");
vi.mock("../muscle-tests");

const mockedFetchArray = vi.mocked(fetchArray);
const mockedValidateBodyPartId = vi.mocked(validateBodyPartId);
const mockedValidateBodyPartsDto = vi.mocked(validateBodyPartsDto);
const mockedFetchMuscleTests = vi.mocked(fetchMuscleTests);

describe("Body Parts Service", () => {
  const origin = "http://test.host";
  const mockBodyParts = [{ id: 1, name: "Shoulder", created_at: "2024-01-01T00:00:00Z" }];
  const mockMuscleTests = [{ id: 101, name: "Test 1", body_part_id: 1, description: "", created_at: "2024-01-01T00:00:00Z" }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAllBodyParts", () => {
    it("should fetch, validate, and return body parts", async () => {
      mockedFetchArray.mockResolvedValueOnce(mockBodyParts);
      mockedValidateBodyPartsDto.mockReturnValue(mockBodyParts);

      const result = await fetchAllBodyParts(origin);

      expect(mockedFetchArray).toHaveBeenCalledWith(`${origin}/api/body_parts`, undefined);
      expect(mockedValidateBodyPartsDto).toHaveBeenCalledWith(mockBodyParts);
      expect(result).toEqual(mockBodyParts);
    });

    it("should pass RequestInit to fetchArray", async () => {
      const init: RequestInit = { headers: { Authorization: "Bearer token" } };
      await fetchAllBodyParts(origin, init);
      expect(mockedFetchArray).toHaveBeenCalledWith(expect.any(String), init);
    });

    it("should re-throw validation errors", async () => {
      const validationError = new Error("Invalid DTO");
      mockedValidateBodyPartsDto.mockImplementation(() => {
        throw validationError;
      });
      mockedFetchArray.mockResolvedValueOnce([]);

      await expect(fetchAllBodyParts(origin)).rejects.toThrow(validationError);
    });
  });

  describe("fetchMuscleTestsAndBodyPartName", () => {
    beforeEach(() => {
      mockedValidateBodyPartId.mockReturnValue(1);
      mockedFetchMuscleTests.mockResolvedValue(mockMuscleTests);
      mockedFetchArray.mockResolvedValue(mockBodyParts);
      mockedValidateBodyPartsDto.mockReturnValue(mockBodyParts);
    });

    it("should fetch data and return muscle tests with the correct body part name", async () => {
      const result = await fetchMuscleTestsAndBodyPartName("1", origin);

      expect(mockedValidateBodyPartId).toHaveBeenCalledWith("1");
      expect(mockedFetchMuscleTests).toHaveBeenCalledWith(1, origin, undefined);
      expect(mockedFetchArray).toHaveBeenCalledWith(`${origin}/api/body_parts`, undefined);
      expect(result).toEqual({ muscleTests: mockMuscleTests, bodyPartName: "Shoulder" });
    });

    it("should pass RequestInit to both underlying fetch calls", async () => {
      const init: RequestInit = { cache: "no-store" };
      await fetchMuscleTestsAndBodyPartName("1", origin, init);

      expect(mockedFetchMuscleTests).toHaveBeenCalledWith(1, origin, init);
      expect(mockedFetchArray).toHaveBeenCalledWith(expect.any(String), init);
    });

    it("should return an empty string for body part name if not found", async () => {
      mockedValidateBodyPartsDto.mockReturnValue([]);
      const result = await fetchMuscleTestsAndBodyPartName("1", origin);
      expect(result.bodyPartName).toBe("");
    });

    it("should throw an error if the body part ID is undefined", async () => {
      await expect(fetchMuscleTestsAndBodyPartName(undefined, origin)).rejects.toThrow("A body part ID is required but was not provided in the URL.");
    });
  });
});
