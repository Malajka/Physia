import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchArray, fetchData, fetchJson, fetchWithTimeout } from "./fetch";

global.fetch = vi.fn();
const mockedFetch = vi.mocked(fetch);

const createMockResponse = (body: any, status: number) => {
  return new Response(body ? JSON.stringify(body) : null, { status });
};

describe("Fetch Utilities Minimal Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchJson", () => {
    it("should return data on successful response", async () => {
      mockedFetch.mockResolvedValueOnce(createMockResponse({ id: 1 }, 200));
      const result = await fetchJson("/api");
      expect(result).toEqual({ id: 1 });
    });

    it("should throw on server error response", async () => {
      mockedFetch.mockResolvedValueOnce(createMockResponse({ error: "Server Error" }, 500));
      await expect(fetchJson("/api")).rejects.toThrow("Server Error");
    });
  });

  describe("fetchArray", () => {
    it("should handle a direct array response", async () => {
      mockedFetch.mockResolvedValueOnce(createMockResponse([1, 2], 200));
      const result = await fetchArray("/api");
      expect(result).toEqual([1, 2]);
    });

    it("should handle an object-wrapped array response", async () => {
      mockedFetch.mockResolvedValueOnce(createMockResponse({ data: [3, 4] }, 200));
      const result = await fetchArray("/api");
      expect(result).toEqual([3, 4]);
    });
  });

  describe("fetchData", () => {
    it("should handle an object-wrapped data response", async () => {
      mockedFetch.mockResolvedValueOnce(createMockResponse({ data: { name: "test" } }, 200));
      const result = await fetchData("/api");
      expect(result).toEqual({ name: "test" });
    });
  });
});
