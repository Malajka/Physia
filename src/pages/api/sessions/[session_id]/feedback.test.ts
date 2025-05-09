import { getFeedbackForSession, upsertFeedback } from "@/lib/services/feedback";
import type { FeedbackRatingDto, ServiceResultDto } from "@/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./feedback";

vi.mock("@/lib/services/feedback", () => ({
  getFeedbackForSession: vi.fn(),
  upsertFeedback: vi.fn(),
}));

const mockGetSession = vi.fn();
const mockSupabase = {
  auth: {
    getSession: mockGetSession,
  },
};
const userId = "user-id";
const session_id = 123; // number, as per schema
const params: { session_id: number } = { session_id };
const locals = { supabase: mockSupabase };

function createMockRequest(body?: unknown): Request {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Request;
}

describe("GET /sessions/:session_id/feedback (MVP happy path)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } }, error: null });
    const feedback: FeedbackRatingDto = { rating: 1, rated_at: "2024-01-01T00:00:00.000Z" };
    vi.mocked(getFeedbackForSession).mockResolvedValue({ data: feedback, error: undefined } satisfies ServiceResultDto<FeedbackRatingDto>);
  });

  it("returns 200 and feedback data on valid request", async () => {
    const response = await GET({ locals, params } as unknown as Parameters<typeof GET>[0]);
    expect(response.status).toBe(200);
    const body = await response.json();
    const expected: FeedbackRatingDto = { rating: 1, rated_at: "2024-01-01T00:00:00.000Z" };
    expect(body.data).toEqual(expected);
    expect(getFeedbackForSession).toHaveBeenCalledWith(mockSupabase, userId, session_id);
  });
});

describe("POST /sessions/:session_id/feedback (MVP happy path)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } }, error: null });
    const feedback: FeedbackRatingDto = { rating: 0, rated_at: "2024-01-02T00:00:00.000Z" };
    vi.mocked(upsertFeedback).mockResolvedValue({ data: feedback, error: undefined } satisfies ServiceResultDto<FeedbackRatingDto>);
  });

  it("returns 200 and feedback data on valid request", async () => {
    const request = createMockRequest({ rating: 0 });
    const response = await POST({ locals, params, request } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = await response.json();
    const expected: FeedbackRatingDto = { rating: 0, rated_at: "2024-01-02T00:00:00.000Z" };
    expect(body.data).toEqual(expected);
    expect(upsertFeedback).toHaveBeenCalledWith(mockSupabase, userId, session_id, 0);
  });
});
