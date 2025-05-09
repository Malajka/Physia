import * as fetchUtils from "@/lib/utils/fetch";
import type { MuscleTestDto } from "@/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMuscleTests } from "./index";

const apiBase = "https://example.com";
const bodyPartId = 5;

describe("fetchMuscleTests", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns validated muscle tests (happy path)", async () => {
    const data: MuscleTestDto[] = [
      { id: 1, name: "Test", description: "desc", body_part_id: 5, created_at: "2024-01-01T00:00:00Z" },
    ];
    vi.spyOn(fetchUtils, "fetchArray").mockResolvedValue(data);
    const result = await fetchMuscleTests(bodyPartId, apiBase);
    expect(result).toEqual(data);
  });

  it("throws on invalid data", async () => {
    vi.spyOn(fetchUtils, "fetchArray").mockResolvedValue([{ id: "bad" }]);
    await expect(fetchMuscleTests(bodyPartId, apiBase)).rejects.toThrow();
  });
}); 