import type { LogoutResult } from "@/lib/services/auth/logout";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLogout } from "./useLogout";

// Mock the logout service
vi.mock("@/lib/services/auth/logout", () => ({
  logoutUser: vi.fn(),
}));

// Mock window.alert
global.alert = vi.fn();

describe("useLogout", () => {
  const getLogoutService = async () => {
    const { logoutUser } = await import("@/lib/services/auth/logout");
    return logoutUser as ReturnType<typeof vi.fn<[], Promise<LogoutResult>>>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial state", () => {
    it("returns correct initial state", () => {
      const { result } = renderHook(() => useLogout());

      expect(result.current.isLoggingOut).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.logout).toBe("function");
    });
  });

  describe("Successful logout", () => {
    it("sets loading state during logout process", async () => {
      const logoutService = await getLogoutService();
      logoutService.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useLogout());

      expect(result.current.isLoggingOut).toBe(false);

      act(() => {
        result.current.logout();
      });

      expect(result.current.isLoggingOut).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(false);
      });
    });

    it("clears error state on successful logout", async () => {
      const logoutService = await getLogoutService();
      logoutService.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe(null);
      expect(global.alert).not.toHaveBeenCalled();
    });

    it("calls logout service", async () => {
      const logoutService = await getLogoutService();
      logoutService.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout();
      });

      expect(logoutService).toHaveBeenCalledTimes(1);
    });
  });

  describe("Failed logout", () => {
    it("handles service error and shows alert", async () => {
      const logoutService = await getLogoutService();
      const errorMessage = "Session expired";
      logoutService.mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoggingOut).toBe(false);
      expect(global.alert).toHaveBeenCalledWith(errorMessage);
    });

    it("handles service exception and shows alert", async () => {
      const logoutService = await getLogoutService();
      const networkError = new Error("Network failed");
      logoutService.mockRejectedValue(networkError);

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe("Network failed");
      expect(result.current.isLoggingOut).toBe(false);
      expect(global.alert).toHaveBeenCalledWith("Network failed");
    });

    it("handles non-Error exceptions", async () => {
      const logoutService = await getLogoutService();
      logoutService.mockRejectedValue("String error");

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe("Unexpected error during logout");
      expect(global.alert).toHaveBeenCalledWith("Unexpected error during logout");
    });

    it("resets loading state after error", async () => {
      const logoutService = await getLogoutService();
      logoutService.mockRejectedValue(new Error("Test error"));

      const { result } = renderHook(() => useLogout());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isLoggingOut).toBe(false);
    });
  });

  describe("State management", () => {
    it("clears previous error before new logout attempt", async () => {
      const logoutService = await getLogoutService();

      // First call fails
      logoutService.mockResolvedValueOnce({
        success: false,
        error: "First error",
      });

      // Second call succeeds
      logoutService.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useLogout());

      // First logout (failure)
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe("First error");

      // Second logout (success)
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe(null);
    });

    it("maintains stable logout function reference", () => {
      const { result, rerender } = renderHook(() => useLogout());

      const firstLogoutFn = result.current.logout;

      rerender();

      const secondLogoutFn = result.current.logout;

      expect(firstLogoutFn).toBe(secondLogoutFn);
    });
  });

  describe("Concurrent logout calls", () => {
    it("handles multiple concurrent logout calls gracefully", async () => {
      const logoutService = await getLogoutService();
      logoutService.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)));

      const { result } = renderHook(() => useLogout());

      // Start multiple logout calls
      act(() => {
        result.current.logout();
        result.current.logout();
        result.current.logout();
      });

      expect(result.current.isLoggingOut).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(false);
      });

      // Service should be called multiple times
      expect(logoutService).toHaveBeenCalledTimes(3);
    });
  });
});
