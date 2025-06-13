import { g as getFeedbackForSession, G as GET, u as upsertFeedback, P as POST } from '../../../../chunks/feedback_DbJCpAEE.mjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';
export { renderers } from '../../../../renderers.mjs';

vi.mock("@/lib/services/feedback", () => ({
  getFeedbackForSession: vi.fn(),
  upsertFeedback: vi.fn()
}));
const userId = "user-id-from-withauth";
const mockSessionIdString = "123";
const mockSessionIdNumber = 123;
const mockGetSession = vi.fn();
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession
  }
};
function createMockContext({
  params = {},
  requestBody = void 0,
  method = "GET",
  urlPath = `/api/sessions/${mockSessionIdString}/feedback`
}) {
  const request = {
    json: vi.fn().mockResolvedValue(requestBody),
    text: vi.fn().mockResolvedValue(requestBody ? JSON.stringify(requestBody) : ""),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    formData: vi.fn().mockResolvedValue(new FormData()),
    headers: new Headers({ "Content-Type": "application/json" }),
    method,
    url: `http://localhost:4321${urlPath}`
  };
  return {
    locals: {
      supabase: mockSupabaseClient
    },
    params,
    request,
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn()
    },
    site: void 0,
    generator: void 0,
    url: new URL(`http://localhost:4321${urlPath}`),
    props: {},
    redirect: vi.fn(),
    clientAddress: "127.0.0.1",
    currentLocale: "en",
    defaultLocale: "en",
    locales: ["en"],
    routing: { strategy: "prefix-always" }
  };
}
describe("GET /api/sessions/:session_id/feedback", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } }, error: null });
  });
  it("returns 200 and feedback data on valid request", async () => {
    const expectedFeedback = { rating: 5, rated_at: "2024-01-01T00:00:00.000Z" };
    vi.mocked(getFeedbackForSession).mockResolvedValue({ data: expectedFeedback, error: void 0 });
    const context = createMockContext({
      params: { session_id: mockSessionIdString },
      // CRITICAL: FeedbackParamsSchema must correctly parse this string "123" to a number.
      method: "GET"
    });
    const response = await GET(context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(expectedFeedback);
    expect(getFeedbackForSession).toHaveBeenCalledWith(
      mockSupabaseClient,
      userId,
      mockSessionIdNumber
      // Service expects the parsed number
    );
  });
  it("returns 400 if session_id is invalid (e.g., non-numeric string based on schema)", async () => {
    const context = createMockContext({
      params: { session_id: "invalid-id-string" },
      // This should be rejected by FeedbackParamsSchema
      method: "GET"
    });
    const response = await GET(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid session_id");
  });
  it("returns 500 if getFeedbackForSession service fails", async () => {
    vi.mocked(getFeedbackForSession).mockResolvedValue({ data: void 0, error: "Service failure" });
    const context = createMockContext({
      params: { session_id: mockSessionIdString },
      // Should pass param validation
      method: "GET"
    });
    const response = await GET(context);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Service failure");
  });
});
describe("POST /api/sessions/:session_id/feedback", () => {
  const validPostBody = { rating: 1 };
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } }, error: null });
  });
  it("returns 200 and feedback data on valid request", async () => {
    const expectedFeedback = { rating: 4, rated_at: "2024-01-02T00:00:00.000Z" };
    vi.mocked(upsertFeedback).mockResolvedValue({ data: expectedFeedback, error: void 0 });
    const context = createMockContext({
      // CRITICAL: FeedbackParamsSchema must correctly parse string "123" to a number.
      params: { session_id: mockSessionIdString },
      // CRITICAL: `validPostBody` must be valid according to FeedbackBodySchema.
      requestBody: validPostBody,
      method: "POST"
    });
    const response = await POST(context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(expectedFeedback);
    expect(upsertFeedback).toHaveBeenCalledWith(
      mockSupabaseClient,
      userId,
      mockSessionIdNumber,
      // Service expects the parsed number
      validPostBody.rating
    );
  });
  it("returns 400 if session_id is invalid", async () => {
    const context = createMockContext({
      params: { session_id: "invalid-id-for-schema" },
      // This should be rejected by FeedbackParamsSchema
      requestBody: validPostBody,
      // Body is valid
      method: "POST"
    });
    const response = await POST(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid session_id");
  });
  it("returns 400 if request body is invalid JSON", async () => {
    const context = createMockContext({
      params: { session_id: mockSessionIdString },
      // Params are valid
      method: "POST"
      // requestBody is undefined by default, and context.request.json() will throw.
    });
    context.request.json.mockRejectedValue(new Error("Simulated Invalid JSON"));
    const response = await POST(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid JSON");
  });
  it("returns 400 if payload validation fails (e.g. rating out of range)", async () => {
    const invalidPostBody = { rating: 10 };
    const context = createMockContext({
      params: { session_id: mockSessionIdString },
      // Params are valid
      requestBody: invalidPostBody,
      // This should be rejected by FeedbackBodySchema
      method: "POST"
    });
    const response = await POST(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid payload");
    expect(body.details).toBeDefined();
  });
  it("returns 500 if upsertFeedback service fails", async () => {
    vi.mocked(upsertFeedback).mockResolvedValue({ data: void 0, error: "Service upsert failure" });
    const context = createMockContext({
      params: { session_id: mockSessionIdString },
      // Should pass param validation
      requestBody: validPostBody,
      // Should pass body validation
      method: "POST"
    });
    const response = await POST(context);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Service upsert failure");
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
