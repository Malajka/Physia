import * as sessionService from "@/lib/services/session/generation";
import type { SessionDetailDto } from "@/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionGeneration } from "./useSessionGeneration";

Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
});

const mockSessionDetail: SessionDetailDto = {
  id: 123,
  body_part_id: 1,
  user_id: "user-1",
  disclaimer_accepted_at: "2024-01-01T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
  training_plan: {},
  session_tests: [],
  feedback_rating: null,
};

describe("useSessionGeneration", () => {
  const bodyPartId = 1;
  const tests = [{ muscle_test_id: 2, pain_intensity: 5 }];
  const userNote = "Feeling a bit stiff today";

  beforeEach(() => {
    vi.resetAllMocks();
    window.location.href = "";
  });

  it("should automatically start generation and redirect on success", async () => {
    const mockStart = vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({
      data: mockSessionDetail,
      id: mockSessionDetail.id,
    });

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests, userNote));

    await waitFor(() => {
      expect(window.location.href).toBe(`/sessions/${mockSessionDetail.id}`);
    });

    expect(result.current.sessionDetail).toEqual(mockSessionDetail);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockStart).toHaveBeenCalledWith(bodyPartId, tests, userNote);
    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it("should set an error if automatic generation fails", async () => {
    vi.spyOn(sessionService, "startSessionGeneration").mockRejectedValue(new Error("API failure"));

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));

    await waitFor(() => {
      expect(result.current.error).toBe("API failure");
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sessionDetail).toBeNull();
    expect(window.location.href).toBe("");
  });

  it("should not start generation automatically with invalid params", () => {
    const mockStart = vi.spyOn(sessionService, "startSessionGeneration");

    renderHook(() => useSessionGeneration(0, []));

    expect(mockStart).not.toHaveBeenCalled();
  });

  it("should set an error when startGeneration is called with invalid params", () => {
    const mockStart = vi.spyOn(sessionService, "startSessionGeneration");
    const { result } = renderHook(() => useSessionGeneration(0, []));

    act(() => {
      result.current.startGeneration();
    });

    expect(result.current.error).toBe("Invalid request parameters");
    expect(result.current.isLoading).toBe(false);
    expect(mockStart).not.toHaveBeenCalled();
  });

  it("should set an error if API returns no session data", async () => {
    vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({
      data: undefined,
      id: 123,
    });

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));

    await waitFor(() => {
      expect(result.current.error).toBe("No session data received");
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should set an error if API returns no session ID", async () => {
    vi.spyOn(sessionService, "startSessionGeneration").mockResolvedValue({
      data: mockSessionDetail,
      id: undefined,
    });

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));

    await waitFor(() => {
      expect(result.current.error).toBe("Invalid session data received (missing ID)");
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should allow retrying a failed generation", async () => {
    const successResponse = { data: mockSessionDetail, id: mockSessionDetail.id };
    const mockStart = vi
      .spyOn(sessionService, "startSessionGeneration")
      .mockRejectedValueOnce(new Error("Initial failure"))
      .mockResolvedValueOnce(successResponse);

    const { result } = renderHook(() => useSessionGeneration(bodyPartId, tests));

    await waitFor(() => expect(result.current.error).toBe("Initial failure"));
    expect(mockStart).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(window.location.href).toBe(`/sessions/${mockSessionDetail.id}`));

    expect(result.current.error).toBeNull();
    expect(mockStart).toHaveBeenCalledTimes(2);
  });
});
