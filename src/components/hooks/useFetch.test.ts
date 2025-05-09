import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFetch } from "./useFetch";

describe("useFetch", () => {
  it("returns loading=true initially and fetches data", async () => {
    const fetcher = vi.fn().mockResolvedValue("result");
    const { result } = renderHook(() => useFetch(fetcher));
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.data).toBe("result");
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalled();
  });

  it("sets error on fetch failure", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useFetch(fetcher));
    await waitFor(() => {
      expect(result.current.error).toBe("fail");
    });
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("does not fetch if skipInitialFetch=true", () => {
    const fetcher = vi.fn();
    const { result } = renderHook(() => useFetch(fetcher, true));
    expect(result.current.loading).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("refetch fetches data again", async () => {
    const fetcher = vi.fn().mockResolvedValue("result");
    const { result } = renderHook(() => useFetch(fetcher, true));
    await act(async () => {
      await result.current.refetch();
    });
    expect(fetcher).toHaveBeenCalled();
    expect(result.current.data).toBe("result");
  });
});
