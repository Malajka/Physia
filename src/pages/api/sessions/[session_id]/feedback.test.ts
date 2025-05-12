// src/pages/api/sessions/[session_id]/feedback.test.ts
import { getFeedbackForSession, upsertFeedback } from "@/lib/services/feedback";
import type { FeedbackRatingDto, ServiceResultDto } from "@/types";
import type { APIContext } from "astro";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { GET, POST } from "./feedback"; // Assuming your endpoint file is feedback.ts or feedback/index.ts

// Mock the feedback service module
vi.mock("@/lib/services/feedback", () => ({
  getFeedbackForSession: vi.fn(),
  upsertFeedback: vi.fn(),
}));

// --- Test Setup ---
const userId = "user-id-from-withauth"; // Simulate userId passed by withAuth
const mockSessionIdString = "123"; // Route params are strings. Ensure FeedbackParamsSchema handles string to number.
const mockSessionIdNumber = 123; // Parsed session_id, service should expect this number.

// Mock Supabase client and session for withAuth
const mockGetSession = vi.fn();
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
  },
};

// Function to create a mock Astro APIContext
function createMockContext({
  params = {},
  requestBody = undefined,
  method = "GET",
  urlPath = `/api/sessions/${mockSessionIdString}/feedback`,
}: {
  params?: Record<string, string | undefined>;
  requestBody?: unknown;
  method?: string;
  urlPath?: string;
}): APIContext {
  const request = {
    json: vi.fn().mockResolvedValue(requestBody),
    text: vi.fn().mockResolvedValue(requestBody ? JSON.stringify(requestBody) : ""),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    formData: vi.fn().mockResolvedValue(new FormData()),
    headers: new Headers({ "Content-Type": "application/json" }),
    method: method,
    url: `http://localhost:4321${urlPath}`,
  } as unknown as Request;

  return {
    locals: {
      supabase: mockSupabaseClient,
    },
    params: params,
    request: request,
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
    } as any,
    site: undefined,
    generator: undefined,
    url: new URL(`http://localhost:4321${urlPath}`),
    props: {},
    redirect: vi.fn(),
    clientAddress: "127.0.0.1",
    currentLocale: "en",
    defaultLocale: "en",
    locales: ["en"],
    routing: { strategy: "prefix-always" }
  } as unknown as APIContext;
}

describe("GET /api/sessions/:session_id/feedback", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } }, error: null });
  });

  it("returns 200 and feedback data on valid request", async () => {
    const expectedFeedback: FeedbackRatingDto = { rating: 5, rated_at: "2024-01-01T00:00:00.000Z" };
    vi.mocked(getFeedbackForSession).mockResolvedValue({ data: expectedFeedback, error: undefined } satisfies ServiceResultDto<FeedbackRatingDto>);

    const context = createMockContext({
      params: { session_id: mockSessionIdString }, // CRITICAL: FeedbackParamsSchema must correctly parse this string "123" to a number.
      method: "GET",
    });

    const response = await GET(context);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(expectedFeedback);
    expect(getFeedbackForSession).toHaveBeenCalledWith(
      mockSupabaseClient,
      userId,
      mockSessionIdNumber // Service expects the parsed number
    );
  });

  it("returns 400 if session_id is invalid (e.g., non-numeric string based on schema)", async () => {
    const context = createMockContext({
      params: { session_id: "invalid-id-string" }, // This should be rejected by FeedbackParamsSchema
      method: "GET",
    });

    const response = await GET(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid session_id");
  });

  it("returns 500 if getFeedbackForSession service fails", async () => {
    vi.mocked(getFeedbackForSession).mockResolvedValue({ data: undefined, error: "Service failure" });

    const context = createMockContext({
      params: { session_id: mockSessionIdString }, // Should pass param validation
      method: "GET",
    });

    const response = await GET(context);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Service failure");
  });
});

describe("POST /api/sessions/:session_id/feedback", () => {
  // CRITICAL: Ensure this object perfectly matches your FeedbackBodySchema definition
  // including type of 'rating' and any constraints (min, max, integer, etc.).
  const validPostBody = { rating: 1 };

  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } }, error: null });
  });

  it("returns 200 and feedback data on valid request", async () => {
    const expectedFeedback: FeedbackRatingDto = { rating: 4, rated_at: "2024-01-02T00:00:00.000Z" };
    vi.mocked(upsertFeedback).mockResolvedValue({ data: expectedFeedback, error: undefined } satisfies ServiceResultDto<FeedbackRatingDto>);

    const context = createMockContext({
      // CRITICAL: FeedbackParamsSchema must correctly parse string "123" to a number.
      params: { session_id: mockSessionIdString },
      // CRITICAL: `validPostBody` must be valid according to FeedbackBodySchema.
      requestBody: validPostBody,
      method: "POST",
    });

    const response = await POST(context);

    // If this assertion fails with "expected 400 to be 200", it means either:
    // 1. `FeedbackParamsSchema.safeParse(params)` failed.
    // 2. `FeedbackBodySchema.safeParse(rawBody)` failed.
    // Check your Zod schemas in `lib/validators/feedback.validator.ts`.
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(expectedFeedback);
    expect(upsertFeedback).toHaveBeenCalledWith(
      mockSupabaseClient,
      userId,
      mockSessionIdNumber, // Service expects the parsed number
      validPostBody.rating
    );
  });

  it("returns 400 if session_id is invalid", async () => {
    const context = createMockContext({
      params: { session_id: "invalid-id-for-schema" }, // This should be rejected by FeedbackParamsSchema
      requestBody: validPostBody, // Body is valid
      method: "POST",
    });

    const response = await POST(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid session_id");
  });

  it("returns 400 if request body is invalid JSON", async () => {
    const context = createMockContext({
      params: { session_id: mockSessionIdString }, // Params are valid
      method: "POST",
      // requestBody is undefined by default, and context.request.json() will throw.
    });
    (context.request.json as Mock).mockRejectedValue(new Error("Simulated Invalid JSON"));

    const response = await POST(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid JSON");
  });

  it("returns 400 if payload validation fails (e.g. rating out of range)", async () => {
    // CRITICAL: This `invalidPostBody` must be structured such that it *fails* your FeedbackBodySchema.
    // For example, if rating must be 0-5, then 10 should fail.
    const invalidPostBody = { rating: 10 };
    
    const context = createMockContext({
      params: { session_id: mockSessionIdString }, // Params are valid
      requestBody: invalidPostBody, // This should be rejected by FeedbackBodySchema
      method: "POST",
    });

    const response = await POST(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid payload");
    expect(body.details).toBeDefined(); // Zod should provide error details
  });

  it("returns 500 if upsertFeedback service fails", async () => {
    vi.mocked(upsertFeedback).mockResolvedValue({ data: undefined, error: "Service upsert failure" });

    const context = createMockContext({
      params: { session_id: mockSessionIdString }, // Should pass param validation
      requestBody: validPostBody, // Should pass body validation
      method: "POST",
    });

    const response = await POST(context);
    // If this fails with 400, it means param or body validation is *still* failing before
    // the service call, despite expecting them to pass for this test case.
    // Double-check that `mockSessionIdString` and `validPostBody` *truly* pass your schemas.
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Service upsert failure");
  });
});
