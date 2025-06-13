import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRegister } from "./useRegister";
import { handleRegisterSubmit } from "@/lib/services/auth";

vi.mock("@/lib/services/auth", () => ({
  handleRegisterSubmit: vi.fn(),
}));

const mockedHandleRegisterSubmit = vi.mocked(handleRegisterSubmit);

describe("useRegister", () => {
  const formData = new FormData();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the correct initial state", () => {
    const { result } = renderHook(() => useRegister());
    expect(result.current.registrationSuccess).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it("should set loading state during submission and clear it on completion", async () => {
    mockedHandleRegisterSubmit.mockResolvedValue({ success: true, registrationSuccess: true });
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.submitRegistration(formData);
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should set registrationSuccess to true on a successful registration", async () => {
    mockedHandleRegisterSubmit.mockResolvedValue({ success: true, registrationSuccess: true });
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submitRegistration(formData);
    });

    expect(result.current.registrationSuccess).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should set the error state when registration fails with a message", async () => {
    const errorMessage = "Email already in use";
    mockedHandleRegisterSubmit.mockResolvedValue({ success: false, error: errorMessage });
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submitRegistration(formData);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.registrationSuccess).toBe(false);
  });

  it("should set the error state when the service throws an Error", async () => {
    const networkError = new Error("Network failed");
    mockedHandleRegisterSubmit.mockRejectedValue(networkError);
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submitRegistration(formData);
    });

    expect(result.current.error).toBe("Network failed");
  });

  it("should set a generic error message when the service throws a non-Error value", async () => {
    mockedHandleRegisterSubmit.mockRejectedValue("a string error");
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submitRegistration(formData);
    });

    expect(result.current.error).toBe("Unexpected error during registration");
  });

  it("should clear a previous error on a new submission attempt", async () => {
    mockedHandleRegisterSubmit.mockResolvedValueOnce({ success: false, error: "First error" });
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submitRegistration(formData);
    });
    expect(result.current.error).toBe("First error");

    mockedHandleRegisterSubmit.mockResolvedValueOnce({ success: true, registrationSuccess: true });
    await act(async () => {
      await result.current.submitRegistration(formData);
    });

    expect(result.current.error).toBe(null);
  });

  it("should reset all state when resetForm is called", async () => {
    mockedHandleRegisterSubmit.mockResolvedValue({ success: false, error: "An error occurred" });
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submitRegistration(formData);
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.registrationSuccess).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });
});
