import * as sessionService from "@/lib/services/session/generation";
import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useSessionGeneration } from "./useSessionGeneration";

describe("useSessionGeneration", () => {
  const bodyPartId = 1;
  const tests = [{ muscle_test_id: 2, pain_intensity: 5 }];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sets sessionDetail and redirects on success", async () => {
    const sessionDetail = { id: 123, foo: "bar" };
    const mockStart = vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({ data: sessionDetail, id: 123 });
    const locationSpy = vi.spyOn(window, "location", "set");
    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));
    await act(async () => {
      await result.current.startGeneration();
    });
    expect(result.current.sessionDetail).toEqual(sessionDetail);
    expect(result.current.error).toBeNull();
    expect(mockStart).toHaveBeenCalledWith(bodyPartId, tests);
    expect(result.current.isLoading).toBe(false);
  });

  it("sets error if no bodyPartId or tests", async () => {
    const { result } = renderHook(() => useSessionGeneration(0, []));
    await act(async () => {
      await result.current.startGeneration();
    });
    expect(result.current.error).toBe("Invalid request parameters");
    expect(result.current.isLoading).toBe(false);
  });

  it("sets error if startSessionGeneration throws", async () => {
    vi.spyOn(sessionService, "startSessionGeneration").mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));
    await act(async () => {
      await result.current.startGeneration();
    });
    expect(result.current.error).toBe("fail");
    expect(result.current.isLoading).toBe(false);
  });

  it("sets error if result.error is returned", async () => {
    vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({ error: "custom error" });
    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));
    await act(async () => {
      await result.current.startGeneration();
    });
    expect(result.current.error).toBe("custom error");
    expect(result.current.isLoading).toBe(false);
  });

  it("retry calls startGeneration again", async () => {
    const mockStart = vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({ data: { id: 1 }, id: 1 });
    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));
    await act(async () => {
      await result.current.retry();
    });
    expect(mockStart).toHaveBeenCalledTimes(1);
  });
}); 