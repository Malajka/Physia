import * as service from "@/lib/services/body-parts";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBodyParts } from "./useBodyParts";

const mockBodyParts = [
  { id: 1, name: "Shoulder", created_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Knee", created_at: "2024-01-01T00:00:00Z" },
];

describe("useBodyParts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns loading=true initially and fetches data", async () => {
    vi.spyOn(service, "fetchAllBodyParts").mockResolvedValueOnce(mockBodyParts);
    const { result } = renderHook(() => useBodyParts());
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.bodyParts).toEqual(mockBodyParts);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    vi.spyOn(service, "fetchAllBodyParts").mockRejectedValueOnce(new Error("fail"));
    const { result } = renderHook(() => useBodyParts());
    await waitFor(() => {
      expect(result.current.error).toBe("fail");
    });
    expect(result.current.bodyParts).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("does not fetch if skipInitialFetch=true", () => {
    const spy = vi.spyOn(service, "fetchAllBodyParts");
    const { result } = renderHook(() => useBodyParts({ skipInitialFetch: true }));
    expect(result.current.loading).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it("refetch fetches data again", async () => {
    const spy = vi.spyOn(service, "fetchAllBodyParts").mockResolvedValue(mockBodyParts);
    const { result } = renderHook(() => useBodyParts({ skipInitialFetch: true }));
    await act(async () => {
      await result.current.refetch();
    });
    expect(spy).toHaveBeenCalled();
    expect(result.current.bodyParts).toEqual(mockBodyParts);
  });
});
