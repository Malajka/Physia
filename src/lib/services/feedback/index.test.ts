import type { SupabaseClient } from "@/db/supabase.client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeedbackForSession, upsertFeedback } from "./index";

const userId = "user-1";
const sessionId = 123;

describe("feedback service", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns feedback rating for session (happy path)", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { rating: 1, rated_at: "2024-01-01T00:00:00Z" }, error: null }),
    } as unknown as SupabaseClient;

    const result = await getFeedbackForSession(supabase, userId, sessionId);
    expect(result.data).toEqual({ rating: 1, rated_at: "2024-01-01T00:00:00Z" });
    expect(result.error).toBeUndefined();
  });

  it("returns error if feedback fetch fails", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
    } as unknown as SupabaseClient;

    const result = await getFeedbackForSession(supabase, userId, sessionId);
    expect(result.data).toBeUndefined();
    expect(result.error).toBe("fail");
  });

  it("upserts feedback rating for session (happy path)", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { rating: 1, rated_at: "2024-01-01T00:00:00Z" }, error: null }),
    } as unknown as SupabaseClient;

    const result = await upsertFeedback(supabase, userId, sessionId, 1);
    expect(result.data).toEqual({ rating: 1, rated_at: "2024-01-01T00:00:00Z" });
    expect(result.error).toBeUndefined();
  });

  it("returns error if upsert fails", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
    } as unknown as SupabaseClient;

    const result = await upsertFeedback(supabase, userId, sessionId, 1);
    expect(result.data).toBeUndefined();
    expect(result.error).toBe("fail");
  });
});
