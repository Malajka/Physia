import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logoutUser } from "./logout";
import { JSON_HEADERS } from "@/lib/utils/api";

vi.mock("@/lib/utils/api", () => ({
  JSON_HEADERS: { "Content-Type": "application/json" },
}));

global.fetch = vi.fn();
const mockedFetch = vi.mocked(fetch);

describe("logoutUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  describe("on success", () => {
    it("should call the API with correct parameters, redirect, and return success", async () => {
      mockedFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));

      const result = await logoutUser();

      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: JSON_HEADERS,
      });
      expect(window.location.href).toBe("/login");
      expect(result).toEqual({ success: true });
    });
  });

  describe("on failure", () => {
    it("should return an error if the API response is not ok", async () => {
      const errorPayload = { message: "Session invalid" };
      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorPayload), { status: 401 }));

      const result = await logoutUser();

      expect(result).toEqual({ success: false, error: "Session invalid" });
      expect(window.location.href).not.toBe("/login");
    });

    it("should return a default error message if payload has no error text", async () => {
      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 500 }));

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout failed (status: 500)",
      });
      expect(window.location.href).not.toBe("/login");
    });

    it("should handle network errors during fetch", async () => {
      const networkError = new Error("Network request failed");
      mockedFetch.mockRejectedValueOnce(networkError);

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout error: Network request failed",
      });
      expect(window.location.href).not.toBe("/login");
    });

    it("should handle non-Error exceptions", async () => {
      mockedFetch.mockRejectedValueOnce("A string error");

      const result = await logoutUser();

      expect(result).toEqual({
        success: false,
        error: "Logout error: Unknown error",
      });
      expect(window.location.href).not.toBe("/login");
    });
  });
});
