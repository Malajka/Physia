import { useFetch } from "@/hooks/useFetch";
import type { BodyPartDto } from "@/types";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBodyParts } from "./useBodyParts";

vi.mock("@/hooks/useFetch");
const mockedUseFetch = vi.mocked(useFetch);

global.fetch = vi.fn();
const mockedFetch = vi.mocked(fetch);

describe("useBodyParts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call useFetch with disabled=true when disclaimer is not accepted", () => {
    renderHook(() => useBodyParts({ disclaimerAccepted: null }));
    expect(mockedUseFetch).toHaveBeenCalledWith(expect.any(Function), true);
  });

  it("should call useFetch with disabled=false when disclaimer is accepted", () => {
    renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01" }));
    expect(mockedUseFetch).toHaveBeenCalledWith(expect.any(Function), false);
  });

  it("should return the data provided by useFetch", () => {
    const mockData: BodyPartDto[] = [{ id: 1, name: "Shoulder", created_at: "now" }];
    mockedUseFetch.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01" }));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe("internal fetcher function", () => {
    let fetcher: (signal: AbortSignal) => Promise<BodyPartDto[]>;

    beforeEach(() => {
      renderHook(() => useBodyParts({ disclaimerAccepted: "2024-01-01" }));

      fetcher = mockedUseFetch.mock.calls[0][0] as (signal: AbortSignal) => Promise<BodyPartDto[]>;
    });

    it("should fetch and return body parts on success", async () => {
      const mockData: BodyPartDto[] = [{ id: 1, name: "Knee", created_at: "now" }];
      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify({ data: mockData }), { status: 200 }));

      const result = await fetcher(new AbortController().signal);

      expect(mockedFetch).toHaveBeenCalledWith("/api/body_parts", expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it("should throw an error if the API response is not ok", async () => {
      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: "Auth error" }), { status: 401 }));

      await expect(fetcher(new AbortController().signal)).rejects.toThrow("Auth error");
    });

    it("should return an empty array if API response data is not an array", async () => {
      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify({ data: { message: "unexpected format" } }), { status: 200 }));

      const result = await fetcher(new AbortController().signal);
      expect(result).toEqual([]);
    });
  });
});
