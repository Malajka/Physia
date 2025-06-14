import { getFeedbackForSession, upsertFeedback } from "@/lib/services/feedback";
import { jsonResponse } from "@/lib/utils/response";
import { FeedbackBodySchema, FeedbackParamsSchema } from "@/lib/validators/feedback.validator";
import type { FeedbackRatingDto } from "@/types";
import type { APIContext } from "astro";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./feedback";

vi.mock("@/lib/middleware/withAuth", () => ({
  withAuth: vi.fn((handler) => (context: APIContext) => handler(context, "user-123")),
}));

vi.mock("@/lib/services/feedback");
const mockedGetFeedback = vi.mocked(getFeedbackForSession);
const mockedUpsertFeedback = vi.mocked(upsertFeedback);

vi.mock("@/lib/utils/response");
const mockedJsonResponse = vi.mocked(jsonResponse);

vi.mock("@/lib/validators/feedback.validator");
const mockedParamsSchema = vi.mocked(FeedbackParamsSchema);
const mockedBodySchema = vi.mocked(FeedbackBodySchema);

const createMockContext = (params: Record<string, any>, body: any | null = null, jsonThrows = false): APIContext =>
  ({
    params,
    locals: {
      supabase: {},
      user: null,
    },
    request: {
      json: jsonThrows ? vi.fn().mockRejectedValue(new Error("Bad JSON")) : vi.fn().mockResolvedValue(body),
    },
  }) as unknown as APIContext;

describe("GET /api/sessions/[session_id]/feedback", () => {
  const userId = "user-123";
  const sessionId = 42;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with feedback data on success", async () => {
    const feedbackData: FeedbackRatingDto = { rating: 1, rated_at: "2024-01-01T00:00:00Z" };
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedGetFeedback.mockResolvedValue({ data: feedbackData, error: undefined });

    const context = createMockContext({ session_id: String(sessionId) });
    await GET(context);

    expect(mockedGetFeedback).toHaveBeenCalledWith({}, userId, sessionId);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ data: feedbackData }, 200);
  });

  it("should return 400 if session_id is invalid", async () => {
    mockedParamsSchema.safeParse.mockReturnValue({ success: false, error: { flatten: () => "error" } as any });
    const context = createMockContext({ session_id: "invalid" });
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid session_id" }), 400);
    expect(mockedGetFeedback).not.toHaveBeenCalled();
  });

  it("should return 500 if the service call fails", async () => {
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedGetFeedback.mockResolvedValue({ data: undefined, error: "Database error" });
    const context = createMockContext({ session_id: String(sessionId) });
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Database error" }, 500);
  });
});

describe("POST /api/sessions/[session_id]/feedback", () => {
  const userId = "user-123";
  const sessionId = 42;
  const validBody = { rating: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with updated feedback on success", async () => {
    const feedbackData: FeedbackRatingDto = { rating: 1, rated_at: "2024-01-01T00:00:00Z" };
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedBodySchema.safeParse.mockReturnValue({ success: true, data: validBody });
    mockedUpsertFeedback.mockResolvedValue({ data: feedbackData, error: undefined });

    const context = createMockContext({ session_id: String(sessionId) }, validBody);
    await POST(context);

    expect(mockedUpsertFeedback).toHaveBeenCalledWith({}, userId, sessionId, validBody.rating);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ data: feedbackData }, 200);
  });

  it("should return 400 if the request body is invalid JSON", async () => {
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    const context = createMockContext({ session_id: String(sessionId) }, null, true);
    await POST(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Invalid JSON" }, 400);
  });

  it("should return 400 if the request payload fails validation", async () => {
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedBodySchema.safeParse.mockReturnValue({ success: false, error: { flatten: () => "error" } as any });
    const context = createMockContext({ session_id: String(sessionId) }, { rating: 99 });
    await POST(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid payload" }), 400);
  });

  it("should return 500 if the upsert service call fails", async () => {
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedBodySchema.safeParse.mockReturnValue({ success: true, data: validBody });
    mockedUpsertFeedback.mockResolvedValue({ data: undefined, error: "Database error" });
    const context = createMockContext({ session_id: String(sessionId) }, validBody);
    await POST(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Database error" }, 500);
  });
});
