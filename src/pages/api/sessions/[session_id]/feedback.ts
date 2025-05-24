import type { APIRoute } from "astro";

import { withAuth } from "@/lib/middleware/withAuth";
import { getFeedbackForSession, upsertFeedback } from "@/lib/services/feedback";
import { jsonResponse } from "@/lib/utils/response";
import { FeedbackBodySchema, FeedbackParamsSchema } from "@/lib/validators/feedback.validator";

export const prerender = false;

// GET /sessions/:session_id/feedback
export const GET: APIRoute = withAuth(async ({ locals, params }, userId) => {
  // Validate route params
  const parsedParams = FeedbackParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    return jsonResponse({ error: "Invalid session_id", details: parsedParams.error.flatten() }, 400);
  }
  const sessionId = parsedParams.data.session_id;

  // Fetch feedback via service
  const supabase = locals.supabase;
  const { data: feedback, error: fetchError } = await getFeedbackForSession(supabase, userId, sessionId);
  if (fetchError) {
    return jsonResponse({ error: fetchError }, 500);
  }
  return jsonResponse({ data: feedback }, 200);
});

// POST /sessions/:session_id/feedback
export const POST: APIRoute = withAuth(async ({ locals, params, request }, userId) => {
  // Validate route params
  const parsedParams = FeedbackParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    return jsonResponse({ error: "Invalid session_id", details: parsedParams.error.flatten() }, 400);
  }
  const sessionId = parsedParams.data.session_id;

  // Parse and validate payload
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
  const parsedBody = FeedbackBodySchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return jsonResponse({ error: "Invalid payload", details: parsedBody.error.flatten() }, 400);
  }
  const { rating } = parsedBody.data;

  // Upsert via service
  const supabase = locals.supabase;
  const { data: feedback, error: upsertError } = await upsertFeedback(supabase, userId, sessionId, rating);
  if (upsertError) {
    return jsonResponse({ error: upsertError }, 500);
  }
  return jsonResponse({ data: feedback }, 200);
});
