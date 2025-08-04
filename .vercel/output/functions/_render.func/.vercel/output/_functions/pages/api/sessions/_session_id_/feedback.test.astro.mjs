import { g as getFeedbackForSession, u as upsertFeedback, F as FeedbackParamsSchema, a as FeedbackBodySchema, G as GET, P as POST } from '../../../../chunks/feedback_e6ZcuSad.mjs';
import { j as jsonResponse } from '../../../../chunks/response_BJucfPdF.mjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';
export { renderers } from '../../../../renderers.mjs';

vi.mock("@/lib/middleware/withAuth", () => ({
  withAuth: vi.fn((handler) => (context) => handler(context, "user-123"))
}));
vi.mock("@/lib/services/feedback");
const mockedGetFeedback = vi.mocked(getFeedbackForSession);
const mockedUpsertFeedback = vi.mocked(upsertFeedback);
vi.mock("@/lib/utils/response");
const mockedJsonResponse = vi.mocked(jsonResponse);
vi.mock("@/lib/validators/feedback.validator");
const mockedParamsSchema = vi.mocked(FeedbackParamsSchema);
const mockedBodySchema = vi.mocked(FeedbackBodySchema);
const createMockContext = (params, body = null, jsonThrows = false) => ({
  params,
  locals: {
    supabase: {},
    user: null
  },
  request: {
    json: jsonThrows ? vi.fn().mockRejectedValue(new Error("Bad JSON")) : vi.fn().mockResolvedValue(body)
  }
});
describe("GET /api/sessions/[session_id]/feedback", () => {
  const userId = "user-123";
  const sessionId = 42;
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should return 200 with feedback data on success", async () => {
    const feedbackData = { rating: 1, rated_at: "2024-01-01T00:00:00Z" };
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedGetFeedback.mockResolvedValue({ data: feedbackData, error: void 0 });
    const context = createMockContext({ session_id: String(sessionId) });
    await GET(context);
    expect(mockedGetFeedback).toHaveBeenCalledWith({}, userId, sessionId);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ data: feedbackData }, 200);
  });
  it("should return 400 if session_id is invalid", async () => {
    mockedParamsSchema.safeParse.mockReturnValue({ success: false, error: { flatten: () => "error" } });
    const context = createMockContext({ session_id: "invalid" });
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid session_id" }), 400);
    expect(mockedGetFeedback).not.toHaveBeenCalled();
  });
  it("should return 500 if the service call fails", async () => {
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedGetFeedback.mockResolvedValue({ data: void 0, error: "Database error" });
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
    const feedbackData = { rating: 1, rated_at: "2024-01-01T00:00:00Z" };
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedBodySchema.safeParse.mockReturnValue({ success: true, data: validBody });
    mockedUpsertFeedback.mockResolvedValue({ data: feedbackData, error: void 0 });
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
    mockedBodySchema.safeParse.mockReturnValue({ success: false, error: { flatten: () => "error" } });
    const context = createMockContext({ session_id: String(sessionId) }, { rating: 99 });
    await POST(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid payload" }), 400);
  });
  it("should return 500 if the upsert service call fails", async () => {
    mockedParamsSchema.safeParse.mockReturnValue({ success: true, data: { session_id: sessionId } });
    mockedBodySchema.safeParse.mockReturnValue({ success: true, data: validBody });
    mockedUpsertFeedback.mockResolvedValue({ data: void 0, error: "Database error" });
    const context = createMockContext({ session_id: String(sessionId) }, validBody);
    await POST(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Database error" }, 500);
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
