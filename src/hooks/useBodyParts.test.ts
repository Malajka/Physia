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

  // Test 1: Initial loading state and successful data fetch
  it("returns loading=true initially and fetches data", async () => {
    vi.spyOn(service, "fetchAllBodyParts").mockResolvedValueOnce(mockBodyParts);
    
    // Render hook with required disclaimerAccepted value
    const { result } = renderHook(() => 
      useBodyParts({ disclaimerAccepted: 'accepted' })
    );

    // Verify initial loading state
    expect(result.current.loading).toBe(true);
    
    // Wait for data to be fetched and assert results
    await waitFor(() => {
      expect(result.current.bodyParts).toEqual(mockBodyParts);
    });
    
    // Verify final state after fetch
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // Test 2: Error handling for failed fetch
  it("sets error on fetch failure", async () => {
    vi.spyOn(service, "fetchAllBodyParts").mockRejectedValueOnce(new Error("fail"));
    
    // Render hook with required disclaimerAccepted value
    const { result } = renderHook(() => 
      useBodyParts({ disclaimerAccepted: 'accepted' })
    );

    // Wait for error state
    await waitFor(() => {
      expect(result.current.error).toMatch(/fail/); // Flexible error matching
    });
    
    // Verify error state cleanup
    expect(result.current.bodyParts).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  // Test 3: Skip initial fetch behavior
  it("does not fetch if skipInitialFetch=true", () => {
    const spy = vi.spyOn(service, "fetchAllBodyParts");
    
    // Render with both skipInitialFetch and disclaimerAccepted
    const { result } = renderHook(() => 
      useBodyParts({ 
        skipInitialFetch: true, 
        disclaimerAccepted: 'accepted' 
      })
    );
    
    // Verify initial state
    expect(result.current.loading).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  // Test 4: Refetch functionality
  it("refetch fetches data again", async () => {
    const spy = vi.spyOn(service, "fetchAllBodyParts").mockResolvedValue(mockBodyParts);
    
    // Start with skipped initial fetch
    const { result } = renderHook(() => 
      useBodyParts({ 
        skipInitialFetch: true, 
        disclaimerAccepted: 'accepted' 
      })
    );

    // Trigger manual refetch
    await act(async () => {
      await result.current.refetch();
    });

    // Verify fetch was called and data updated
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.current.bodyParts).toEqual(mockBodyParts);
  });

  // New test: Verify disclaimerAccepted=null behavior
  it("resets data when disclaimerAccepted=null", async () => {
    const { result } = renderHook(() => 
      useBodyParts({ disclaimerAccepted: null })
    );

    // Verify initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.bodyParts).toEqual([]);
  });
});
