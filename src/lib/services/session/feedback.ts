import { JSON_HEADERS } from "@/lib/utils/api";
import type { FeedbackRatingDto, SubmitFeedbackCommandDto } from "@/types";

export interface FeedbackApiResponse {
  data: FeedbackRatingDto;
  error?: string;
}

/**
 * Fetch feedback for a session by ID
 */
export async function fetchFeedback(sessionId: number): Promise<FeedbackApiResponse> {
  const response = await fetch(`/api/sessions/${sessionId}/feedback`);
  const result: FeedbackApiResponse = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to load feedback");
  return result;
}

/**
 * Submit feedback rating for a session
 */
export async function submitFeedback(sessionId: number, rating: SubmitFeedbackCommandDto["rating"]): Promise<FeedbackApiResponse> {
  const response = await fetch(`/api/sessions/${sessionId}/feedback`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ rating }),
  });
  const result: FeedbackApiResponse = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to submit feedback");
  return result;
}
