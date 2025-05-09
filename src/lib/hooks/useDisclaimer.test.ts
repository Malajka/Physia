import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useDisclaimer } from "./useDisclaimer";

describe("useDisclaimer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads disclaimer text and acceptedAt on mount (success)", async () => {
    const mockText = "Test disclaimer";
    const mockAcceptedAt = "2024-01-01T00:00:00Z";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: mockText, accepted_at: mockAcceptedAt }),
    }));

    const { result } = renderHook(() => useDisclaimer());
    // Wait for useEffect to finish
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.disclaimerText).toBe(mockText);
    expect(result.current.acceptedAt).toBe(mockAcceptedAt);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handles error on load", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, statusText: "fail" }));
    const { result } = renderHook(() => useDisclaimer());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.error).toBe("fail");
    expect(result.current.loading).toBe(false);
  });

  it("accept sets acceptedAt on success", async () => {
    const mockAcceptedAt = "2024-02-02T00:00:00Z";
    // First fetch for loadDisclaimer
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ text: "t", accepted_at: null }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ accepted_at: mockAcceptedAt }) })
    );
    const { result } = renderHook(() => useDisclaimer());
    await act(async () => { await Promise.resolve(); });
    await act(async () => {
      await result.current.accept();
    });
    expect(result.current.acceptedAt).toBe(mockAcceptedAt);
    expect(result.current.error).toBeNull();
  });

  it("accept handles error", async () => {
    // First fetch for loadDisclaimer
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ text: "t", accepted_at: null }) })
      .mockResolvedValueOnce({ ok: false, statusText: "fail post" })
    );
    const { result } = renderHook(() => useDisclaimer());
    await act(async () => { await Promise.resolve(); });
    await act(async () => {
      await result.current.accept();
    });
    expect(result.current.error).toBe("fail post");
  });
}); 