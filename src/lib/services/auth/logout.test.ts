import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logoutUser } from "./logout";

// Mock fetch
global.fetch = vi.fn();
const mockedFetch = vi.mocked(fetch);

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { href: "" },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("logoutUser", () => {
  describe("Successful logout", () => {
    it("returns success when API call succeeds", async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
      } as Partial<Response> as Response);

      const result = await logoutUser();

      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      expect(result).toEqual({ success: true });
      expect(window.location.href).toBe("/login");
    });

    it("redirects to login page on success", async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
      } as Partial<Response> as Response);

      await logoutUser();

      expect(window.location.href).toBe("/login");
    });
  });

  describe("Failed logout", () => {
    it("returns error when API returns error response", async () => {
      const errorMessage = "Session expired";
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ error: errorMessage }),
      } as Partial<Response> as Response);

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: errorMessage,
      });
      expect(window.location.href).toBe("");
    });

    it("returns default error when API returns no error text", async () => {
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      } as Partial<Response> as Response);

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout failed (status: 500)",
      });
    });

    it("handles fetch network errors", async () => {
      const networkError = new Error("Network connection failed");
      mockedFetch.mockRejectedValue(networkError);

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout error: Network connection failed",
      });
      expect(window.location.href).toBe("");
    });

    it("handles non-Error exceptions", async () => {
      mockedFetch.mockRejectedValue("String error");

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout error: Unknown error",
      });
    });

    it("does not redirect on failed logout", async () => {
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: "Bad request" }),
      } as Partial<Response> as Response);

      await logoutUser();

      expect(window.location.href).toBe("");
    });
  });

  describe("API call configuration", () => {
    it("makes POST request with correct headers", async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
      } as Partial<Response> as Response);

      await logoutUser();

      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    });

    it("calls correct endpoint", async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
      } as Partial<Response> as Response);

      await logoutUser();

      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", expect.any(Object));
    });
  });
});
