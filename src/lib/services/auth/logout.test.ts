import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logoutUser } from "./logout";

// Mock fetch
global.fetch = vi.fn();

// Mock window.location
const originalLocation = window.location;

beforeEach(() => {
  // @ts-expect-error: Need to delete window.location to mock it
  delete window.location;
  window.location = { href: "" } as Location;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("logoutUser", () => {
  describe("Successful logout", () => {
    it("returns success when API call succeeds", async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
      });

      const result = await logoutUser();

      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      expect(result).toEqual({ success: true });
      expect(window.location.href).toBe("/login");
    });

    it("redirects to login page on success", async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
      });

      await logoutUser();

      expect(window.location.href).toBe("/login");
    });
  });

  describe("Failed logout", () => {
    it("returns error when API returns error response", async () => {
      const errorMessage = "Session expired";
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ error: errorMessage }),
      });

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: errorMessage,
      });
      expect(window.location.href).toBe("");
    });

    it("returns default error when API returns no error text", async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      });

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout failed (status: 500)",
      });
    });

    it("handles fetch network errors", async () => {
      const networkError = new Error("Network connection failed");
      (fetch as any).mockRejectedValue(networkError);

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout error: Network connection failed",
      });
      expect(window.location.href).toBe("");
    });

    it("handles non-Error exceptions", async () => {
      (fetch as any).mockRejectedValue("String error");

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout error: Unknown error",
      });
    });

    it("does not redirect on failed logout", async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: "Bad request" }),
      });

      await logoutUser();

      expect(window.location.href).toBe("");
    });
  });

  describe("API call configuration", () => {
    it("makes POST request with correct headers", async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
      });

      await logoutUser();

      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    });

    it("calls correct endpoint", async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
      });

      await logoutUser();

      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", expect.any(Object));
    });
  });
});
