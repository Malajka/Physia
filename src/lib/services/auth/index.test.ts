import type { AuthCredentialsDto } from "@/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { login, register } from "./index";

// Helper to mock fetch
function mockFetch(response: unknown, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => response,
  } as Partial<Pick<Response, "ok" | "json">>);
}

describe("auth service", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("login", () => {
    const input: AuthCredentialsDto = { email: "test@example.com", password: "password" };

    it("returns success on valid response", async () => {
      mockFetch({}, true);
      const result = await login(input);
      expect(result).toEqual({ success: true, error: "" });
    });

    it("returns error on API error with message", async () => {
      mockFetch({ error: "Invalid credentials" }, false);
      const result = await login(input);
      expect(result).toEqual({ success: false, error: "Invalid credentials" });
    });

    it("returns default error if API error has no message", async () => {
      mockFetch({}, false);
      const result = await login(input);
      expect(result).toEqual({ success: false, error: "Login failed" });
    });

    it("returns error on fetch exception", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const result = await login(input);
      expect(result).toEqual({ success: false, error: "Network error" });
    });

    it("returns default error on non-Error exception", async () => {
      global.fetch = vi.fn().mockRejectedValue("some string error");
      const result = await login(input);
      expect(result).toEqual({ success: false, error: "An unexpected error occurred" });
    });
  });

  describe("register", () => {
    const input: AuthCredentialsDto = { email: "new@example.com", password: "password" };

    it("returns success on valid response", async () => {
      mockFetch({}, true);
      const result = await register(input);
      expect(result).toEqual({ success: true, error: "" });
    });

    it("returns error on API error with error message", async () => {
      mockFetch({ error: "Email exists" }, false);
      const result = await register(input);
      expect(result).toEqual({ success: false, error: "Email exists" });
    });

    it("returns error on API error with message property", async () => {
      mockFetch({ message: "Weak password" }, false);
      const result = await register(input);
      expect(result).toEqual({ success: false, error: "Weak password" });
    });

    it("returns default error if API error has no message", async () => {
      mockFetch({}, false);
      const result = await register(input);
      expect(result).toEqual({ success: false, error: "Registration failed" });
    });

    it("returns error on fetch exception", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const result = await register(input);
      expect(result).toEqual({ success: false, error: "Network error" });
    });

    it("returns default error on non-Error exception", async () => {
      global.fetch = vi.fn().mockRejectedValue(12345);
      const result = await register(input);
      expect(result).toEqual({ success: false, error: "An unexpected error occurred" });
    });
  });
});
