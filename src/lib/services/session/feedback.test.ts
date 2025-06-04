import type { FeedbackRatingDto } from "@/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchFeedback, submitFeedback, type FeedbackApiResponse } from "./feedback";

const sessionId = 123;
const feedback: FeedbackRatingDto = { rating: 1, rated_at: "2024-01-01T00:00:00Z" };

function mockFetch(response: FeedbackApiResponse, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => response,
  } as Partial<Response> as Response);
}

describe("session feedback service", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("fetches feedback (happy path)", async () => {
    mockFetch({ data: feedback });
    const result = await fetchFeedback(sessionId);
    expect(result).toEqual({ data: feedback });
  });

  it("throws on fetch feedback error", async () => {
    mockFetch({ error: "fail" } as FeedbackApiResponse, false);
    await expect(fetchFeedback(sessionId)).rejects.toThrow("fail");
  });

  it("submits feedback (happy path)", async () => {
    mockFetch({ data: feedback });
    const result = await submitFeedback(sessionId, 1);
    expect(result).toEqual({ data: feedback });
  });

  it("throws on submit feedback error", async () => {
    mockFetch({ error: "fail" } as FeedbackApiResponse, false);
    await expect(submitFeedback(sessionId, 1)).rejects.toThrow("fail");
  });
});
