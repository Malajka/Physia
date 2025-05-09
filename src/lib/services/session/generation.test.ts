import type { SessionDetailDto } from "@/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startSessionGeneration } from "./generation";

const sessionDetail: SessionDetailDto = {
  id: 1,
  body_part_id: 2,
  user_id: "user-1",
  disclaimer_accepted_at: "2024-01-01T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
  training_plan: {},
  session_tests: [],
  feedback_rating: null,
};

function mockFetch(response: any, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? "OK" : "Server Error",
    json: async () => response,
  }) as any;
}

describe("session generation service", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns session detail (happy path)", async () => {
    mockFetch(sessionDetail);
    const result = await startSessionGeneration(2, []);
    expect(result.data).toEqual(sessionDetail);
    expect(result.id).toBe(sessionDetail.id);
    expect(result.error).toBeUndefined();
  });

  it("redirects to disclaimer on 403 with disclaimer_required", async () => {
    const locationSpy = vi.spyOn(window, "location", "get").mockReturnValue({ href: "" } as any);
    mockFetch({ error: "disclaimer_required" }, false, 403);
    const result = await startSessionGeneration(2, []);
    expect(result.error).toBe("disclaimer_required");
  });

  it("throws on server error with error message", async () => {
    mockFetch({ error: { code: "fail", message: "msg" } }, false, 500);
    await expect(startSessionGeneration(2, [])).rejects.toThrow("fail: msg");
  });

  it("throws on server error with details.reason", async () => {
    mockFetch({ error: { details: { reason: "custom reason" } } }, false, 500);
    await expect(startSessionGeneration(2, [])).rejects.toThrow("custom reason");
  });

  it("throws on server error with unknown error", async () => {
    mockFetch({}, false, 500);
    await expect(startSessionGeneration(2, [])).rejects.toThrow("Server error: Server Error");
  });
}); 