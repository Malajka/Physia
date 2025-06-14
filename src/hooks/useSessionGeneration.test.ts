import * as sessionService from "@/lib/services/session/generation";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionGeneration } from "./useSessionGeneration";

Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
});

describe("useSessionGeneration", () => {
  const bodyPartId = 1;
  const tests = [{ muscle_test_id: 2, pain_intensity: 5 }];

  beforeEach(() => {
    vi.resetAllMocks();
    window.location.href = "";
  });

  it("sets sessionDetail and redirects on success", async () => {
    const sessionDetail = {
      id: 123,
      body_part_id: 1,
      user_id: "1",
      disclaimer_accepted_at: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      training_plan: {},
      session_tests: [],
      feedback_rating: null,
    };

    const mockStart = vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({
      data: sessionDetail,
      id: 123,
    });

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(result.current.sessionDetail).toEqual(sessionDetail);
    expect(result.current.error).toBeNull();
    expect(mockStart).toHaveBeenCalledWith(bodyPartId, tests);
    expect(result.current.isLoading).toBe(false);
    expect(window.location.href).toBe("/sessions/123");
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
    vi.spyOn(sessionService, "startSessionGeneration").mockRejectedValue(new Error("API failure"));

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(result.current.error).toBe("API failure");
    expect(result.current.isLoading).toBe(false);
  });

  it("sets error if no session data received", async () => {
    vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({
      data: undefined,
      id: undefined,
    });

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(result.current.error).toBe("No session data received");
    expect(result.current.isLoading).toBe(false);
  });

  it("sets error if session ID is missing", async () => {
    const sessionDetail = {
      id: 123,
      body_part_id: 1,
      user_id: "1",
      disclaimer_accepted_at: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      training_plan: {},
      session_tests: [],
      feedback_rating: null,
    };

    vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({
      data: sessionDetail,
      id: undefined,
    });

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(result.current.error).toBe("Invalid session data received (missing ID)");
    expect(result.current.isLoading).toBe(false);
  });

  it("retry calls startGeneration again", async () => {
    const sessionDetail = {
      id: 1,
      body_part_id: 1,
      user_id: "1",
      disclaimer_accepted_at: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      training_plan: {},
      session_tests: [],
      feedback_rating: null,
    };

    const mockStart = vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({
      data: sessionDetail,
      id: 1,
    });

    const { result, rerender } = renderHook(({ bodyPartId, tests }) => useSessionGeneration(bodyPartId, tests), {
      initialProps: {
        bodyPartId: 0,
        tests: [] as { muscle_test_id: number; pain_intensity: number }[],
      },
    });

    await act(async () => {
      rerender({ bodyPartId, tests });
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(mockStart).toHaveBeenCalledTimes(2);
    expect(mockStart).toHaveBeenCalledWith(bodyPartId, tests);
  });

  it("automatically starts generation on mount with valid params", async () => {
    const sessionDetail = {
      id: 456,
      body_part_id: 1,
      user_id: "1",
      disclaimer_accepted_at: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      training_plan: {},
      session_tests: [],
      feedback_rating: null,
    };

    const mockStart = vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({
      data: sessionDetail,
      id: 456,
    });

    renderHook(() => useSessionGeneration(bodyPartId, tests));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(mockStart).toHaveBeenCalledWith(bodyPartId, tests);
  });

  it("does not start generation automatically with invalid params", async () => {
    const mockStart = vi.spyOn(sessionService, "startSessionGeneration");

    renderHook(() => useSessionGeneration(0, []));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(mockStart).not.toHaveBeenCalled();
  });
});
