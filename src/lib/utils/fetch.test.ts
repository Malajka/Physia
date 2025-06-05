import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchArray, fetchData, fetchJson, fetchWithTimeout } from "./fetch";

globalThis.fetch = vi.fn();

const mockFetch = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

describe("fetch utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchJson returns parsed data for ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ foo: "bar" }),
    });
    const data = await fetchJson<{ foo: string }>("/api");
    expect(data).toEqual({ foo: "bar" });
  });

  it("fetchJson throws for invalid JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error("bad json");
      },
    });
    await expect(fetchJson("/api")).rejects.toThrow("Invalid JSON in response from /api");
  });

  it("fetchJson throws for not ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "fail" }),
    });
    await expect(fetchJson("/api")).rejects.toThrow("fail");
  });

  it("fetchArray returns array if response is array", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [1, 2, 3],
    });
    const arr = await fetchArray<number>("/api");
    expect(arr).toEqual([1, 2, 3]);
  });

  it("fetchArray returns .data if response is object", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [4, 5, 6] }),
    });
    const arr = await fetchArray<number>("/api");
    expect(arr).toEqual([4, 5, 6]);
  });

  it("fetchData returns .data property", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { foo: 1 } }),
    });
    const data = await fetchData<{ foo: number }>("/api");
    expect(data).toEqual({ foo: 1 });
  });

  it("fetchWithTimeout aborts after timeout", async () => {
    const abortSpy = vi.fn();
    const fakeController = { signal: {}, abort: abortSpy };
    vi.spyOn(global, "AbortController").mockImplementation(() => fakeController as unknown as AbortController);
    mockFetch.mockImplementation(
      () =>
        new Promise(() => {
          /* intentionally empty */
        })
    );
    fetchWithTimeout("/api", {}, 10);
    await new Promise((r) => setTimeout(r, 20));
    expect(abortSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
