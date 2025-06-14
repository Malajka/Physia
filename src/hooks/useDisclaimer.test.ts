import type { AcceptDisclaimerResponseDto, DisclaimersContentDto } from "@/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDisclaimer } from "./useDisclaimer";

global.fetch = vi.fn();
const mockedFetch = vi.mocked(fetch);

const mockDisclaimerContent: DisclaimersContentDto & { accepted_at?: string | null } = {
  text: "This is the disclaimer text.",
  accepted_at: null,
};

const mockAcceptanceResponse: AcceptDisclaimerResponseDto = {
  accepted_at: new Date().toISOString(),
};

describe("useDisclaimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be in a loading state initially and fetch the disclaimer", async () => {
    mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockDisclaimerContent)));
    const { result } = renderHook(() => useDisclaimer());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedFetch).toHaveBeenCalledWith("/api/disclaimers", { credentials: "include" });
    expect(result.current.disclaimerText).toBe(mockDisclaimerContent.text);
  });

  it("should handle a successful response where the disclaimer is not yet accepted", async () => {
    mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockDisclaimerContent)));
    const { result } = renderHook(() => useDisclaimer());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.acceptedAt).toBeNull();
  });

  it("should handle a successful response where the disclaimer is already accepted", async () => {
    const acceptedContent = { ...mockDisclaimerContent, accepted_at: "2024-01-01T00:00:00Z" };
    mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify(acceptedContent)));
    const { result } = renderHook(() => useDisclaimer());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.acceptedAt).toBe("2024-01-01T00:00:00Z");
  });

  it("should set an error state if fetching the disclaimer fails", async () => {
    mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: "Server down" }), { status: 500 }));
    const { result } = renderHook(() => useDisclaimer());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Server down");
    expect(result.current.disclaimerText).toBe("");
  });

  describe("accept function", () => {
    it("should successfully accept the disclaimer and update the acceptedAt state", async () => {
      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockDisclaimerContent)));
      const { result } = renderHook(() => useDisclaimer());

      await waitFor(() => expect(result.current.loading).toBe(false));

      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockAcceptanceResponse)));

      await act(async () => {
        await result.current.accept();
      });

      expect(mockedFetch).toHaveBeenCalledWith("/api/disclaimers", { method: "POST", credentials: "include" });
      expect(result.current.acceptedAt).toBe(mockAcceptanceResponse.accepted_at);
      expect(result.current.error).toBeNull();
    });

    it("should set an error state if accepting the disclaimer fails", async () => {
      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockDisclaimerContent)));
      const { result } = renderHook(() => useDisclaimer());

      await waitFor(() => expect(result.current.loading).toBe(false));

      mockedFetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: "Update failed" }), { status: 500 }));

      await act(async () => {
        await result.current.accept();
      });

      expect(result.current.error).toBe("Update failed");
    });
  });
});
