import * as service from "@/lib/services/body-parts";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTestsAndName } from "./useTestsAndName";

const mockResult = {
  muscleTests: [{ id: 1, name: "Test", body_part_id: 1, description: "", created_at: "2024-01-01T00:00:00Z" }],
  bodyPartName: "Shoulder",
};

describe("useTestsAndName", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns loading=true initially and fetches data", async () => {
    vi.spyOn(service, "fetchMuscleTestsAndBodyPartName").mockResolvedValueOnce(mockResult);
    const { result } = renderHook(() => useTestsAndName(1, "origin"));
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.data).toEqual({ tests: mockResult.muscleTests, name: mockResult.bodyPartName });
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    vi.spyOn(service, "fetchMuscleTestsAndBodyPartName").mockRejectedValueOnce(new Error("fail"));
    const { result } = renderHook(() => useTestsAndName(1, "origin"));
    await waitFor(() => {
      expect(result.current.error).toBe("fail");
    });
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("refetches when bodyPartId or origin changes", async () => {
    const spy = vi.spyOn(service, "fetchMuscleTestsAndBodyPartName").mockResolvedValue(mockResult);
    const { rerender } = renderHook(({ id, origin }) => useTestsAndName(id, origin), { initialProps: { id: 1, origin: "origin" } });
    expect(spy).toHaveBeenCalledWith("1", "origin");
    rerender({ id: 2, origin: "origin2" });
    expect(spy).toHaveBeenCalledWith("2", "origin2");
  });
});
