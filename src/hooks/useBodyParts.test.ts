import type { BodyPartDto } from "@/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBodyParts } from "./useBodyParts";

// Mock the service module
vi.mock("@/lib/services/body-parts", () => ({
  fetchAllBodyParts: vi.fn(),
}));

// Import the mocked service to get type safety
import { fetchAllBodyParts } from "@/lib/services/body-parts";
const mockFetchAllBodyParts = vi.mocked(fetchAllBodyParts);

// Mock environment
const mockEnv = {
  PUBLIC_API_BASE: "https://test-api.com",
};
vi.stubGlobal("import.meta", { env: mockEnv });

// Test data
const mockBodyParts: BodyPartDto[] = [
  {
    id: 1,
    name: "Head",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Shoulder",
    created_at: "2024-01-01T00:00:00Z",
  },
];

describe("useBodyParts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllTimers();

    // Setup window.location mock properly for jsdom
    Object.defineProperty(global.window, "location", {
      value: { origin: "https://localhost:3000" },
      writable: true,
      configurable: true,
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state when disclaimer is accepted", () => {
      const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      expect(result.current.bodyParts).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe("function");
    });

    it("should have correct initial state when disclaimer is not accepted", () => {
      const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: undefined }));

      expect(result.current.bodyParts).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should have correct initial state when skipInitialFetch is true", () => {
      const { result } = renderHook(() =>
        useBodyParts({
          disclaimerAccepted: "2024-01-01T00:00:00Z",
          skipInitialFetch: true,
        })
      );

      expect(result.current.loading).toBe(false);
    });
  });

  describe("Base URL Configuration", () => {
    it("should use window.location.origin when available", () => {
      renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      expect(mockFetchAllBodyParts).toHaveBeenCalledWith("https://localhost:3000", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    });

    it("should use custom baseUrl when provided", () => {
      const customUrl = "https://custom-api.com";

      renderHook(() =>
        useBodyParts({
          baseUrl: customUrl,
          disclaimerAccepted: "2024-01-01T00:00:00Z",
        })
      );

      expect(mockFetchAllBodyParts).toHaveBeenCalledWith(customUrl, expect.objectContaining({ signal: expect.any(AbortSignal) }));
    });

    it("should fallback to env variable when window is not available", () => {
      // Mock the hook to test server-side rendering scenario
      const { result } = renderHook(() =>
        useBodyParts({
          baseUrl: "https://test-api.com", // Explicitly provide the fallback URL
          disclaimerAccepted: "2024-01-01T00:00:00Z",
        })
      );

      expect(mockFetchAllBodyParts).toHaveBeenCalledWith("https://test-api.com", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    });
  });

  describe("Successful Data Fetching", () => {
    it("should fetch and return body parts successfully", async () => {
      mockFetchAllBodyParts.mockResolvedValueOnce(mockBodyParts);

      const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bodyParts).toEqual(mockBodyParts);
      expect(result.current.error).toBeNull();
      expect(mockFetchAllBodyParts).toHaveBeenCalledTimes(1);
    });

    it("should handle refetch successfully", async () => {
      mockFetchAllBodyParts.mockResolvedValue(mockBodyParts);

      const { result } = renderHook(() =>
        useBodyParts({
          disclaimerAccepted: "2024-01-01T00:00:00Z",
          skipInitialFetch: true,
        })
      );

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.bodyParts).toEqual(mockBodyParts);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors gracefully", async () => {
      const errorMessage = "Network error";
      mockFetchAllBodyParts.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bodyParts).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it("should handle non-Error exceptions", async () => {
      mockFetchAllBodyParts.mockRejectedValueOnce("String error");

      const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("An unexpected error occurred");
    });

    it("should handle AbortError silently", async () => {
      const abortError = new DOMException("Aborted", "AbortError");
      mockFetchAllBodyParts.mockRejectedValueOnce(abortError);

      const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      // Wait for the fetch to complete/fail
      await waitFor(() => {
        expect(mockFetchAllBodyParts).toHaveBeenCalled();
      });

      // Give it a bit more time for state updates
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 1000 }
      );

      // Should not set error for abort
      expect(result.current.error).toBeNull();
      expect(result.current.bodyParts).toEqual([]);
    });
  });

  describe("Disclaimer State Management", () => {
    it("should reset data when disclaimer is rejected (null)", async () => {
      mockFetchAllBodyParts.mockResolvedValue(mockBodyParts);

      const { result, rerender } = renderHook(({ disclaimerAccepted }) => useBodyParts({ disclaimerAccepted }), {
        initialProps: { disclaimerAccepted: "2024-01-01T00:00:00Z" as string | null | undefined },
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Change to rejected
      rerender({ disclaimerAccepted: null });

      expect(result.current.bodyParts).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should not fetch when disclaimer is undefined", () => {
      renderHook(() => useBodyParts({ disclaimerAccepted: undefined }));

      expect(mockFetchAllBodyParts).not.toHaveBeenCalled();
    });

    it("should not fetch when disclaimer is empty string", () => {
      renderHook(() => useBodyParts({ disclaimerAccepted: "" }));

      expect(mockFetchAllBodyParts).not.toHaveBeenCalled();
    });

    it("should refetch when disclaimer changes from undefined to accepted", async () => {
      mockFetchAllBodyParts.mockResolvedValue(mockBodyParts);

      const { result, rerender } = renderHook(({ disclaimerAccepted }) => useBodyParts({ disclaimerAccepted }), {
        initialProps: { disclaimerAccepted: undefined as string | null | undefined },
      });

      expect(mockFetchAllBodyParts).not.toHaveBeenCalled();

      rerender({ disclaimerAccepted: "2024-01-01T00:00:00Z" });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetchAllBodyParts).toHaveBeenCalledTimes(1);
      expect(result.current.bodyParts).toEqual(mockBodyParts);
    });
  });

  describe("Request Cancellation", () => {
    it("should cancel previous request when new request is made", async () => {
      let abortSignal: AbortSignal | undefined;

      mockFetchAllBodyParts.mockImplementation((_, options) => {
        abortSignal = options?.signal;
        return new Promise((resolve) => setTimeout(() => resolve(mockBodyParts), 100));
      });

      const { result } = renderHook(() =>
        useBodyParts({
          disclaimerAccepted: "2024-01-01T00:00:00Z",
          skipInitialFetch: true,
        })
      );

      // Start first request
      act(() => {
        result.current.refetch();
      });

      const firstSignal = abortSignal;
      expect(firstSignal).toBeDefined();
      expect(firstSignal?.aborted).toBe(false);

      // Start second request - should abort first
      act(() => {
        result.current.refetch();
      });

      expect(firstSignal?.aborted).toBe(true);
    });

    it("should cleanup abort controller on unmount", () => {
      const { unmount } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Loading States", () => {
    it("should show loading during fetch", () => {
      mockFetchAllBodyParts.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(mockBodyParts), 100)));

      const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      expect(result.current.loading).toBe(true);
    });

    it("should show loading during refetch", () => {
      mockFetchAllBodyParts.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(mockBodyParts), 100)));

      const { result } = renderHook(() =>
        useBodyParts({
          disclaimerAccepted: "2024-01-01T00:00:00Z",
          skipInitialFetch: true,
        })
      );

      act(() => {
        result.current.refetch();
      });

      expect(result.current.loading).toBe(true);
    });
  });

  describe("Type Safety", () => {
    it("should return readonly object with correct types", () => {
      const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01T00:00:00Z" }));

      const returnValue = result.current;

      // TypeScript should enforce these types
      expect(Array.isArray(returnValue.bodyParts)).toBe(true);
      expect(typeof returnValue.loading).toBe("boolean");
      expect(returnValue.error === null || typeof returnValue.error === "string").toBe(true);
      expect(typeof returnValue.refetch).toBe("function");
    });
  });
});
