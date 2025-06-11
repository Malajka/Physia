import { w as withAuth } from "./withAuth_BrNYmeHs.mjs";
import { j as jsonResponse } from "./response_BJucfPdF.mjs";
import { z } from "zod";

async function getFeedbackForSession(supabase, userId, sessionId) {
  const { data, error } = await supabase
    .from("feedback_ratings")
    .select("rating, rated_at")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    return { error: error.message };
  }
  const feedbackRatingDto = {
    rating: data?.rating ?? null,
    rated_at: data?.rated_at ?? null,
  };
  return { data: feedbackRatingDto };
}
async function upsertFeedback(supabase, userId, sessionId, rating) {
  const rated_at = /* @__PURE__ */ new Date().toISOString();
  const { data, error } = await supabase
    .from("feedback_ratings")
    .upsert({ session_id: sessionId, user_id: userId, rating, rated_at }, { onConflict: "session_id,user_id" })
    .select()
    .single();
  if (error || !data) {
    return { error: error?.message ?? "Failed to upsert feedback" };
  }
  const feedbackRatingDto = {
    rating: data.rating,
    rated_at: data.rated_at,
  };
  return { data: feedbackRatingDto };
}

const FeedbackParamsSchema = z.object({
  session_id: z.coerce
    .number({ invalid_type_error: "session_id must be a number" })
    .int({ message: "session_id must be an integer" })
    .positive({ message: "session_id must be a positive integer" }),
});
const FeedbackBodySchema = z.object({
  rating: z.number().int().min(0).max(1),
});

const prerender = false;
const GET = withAuth(async ({ locals, params }, userId) => {
  const parsedParams = FeedbackParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    return jsonResponse({ error: "Invalid session_id", details: parsedParams.error.flatten() }, 400);
  }
  const sessionId = parsedParams.data.session_id;
  const supabase = locals.supabase;
  const { data: feedback, error: fetchError } = await getFeedbackForSession(supabase, userId, sessionId);
  if (fetchError) {
    return jsonResponse({ error: fetchError }, 500);
  }
  return jsonResponse({ data: feedback }, 200);
});
const POST = withAuth(async ({ locals, params, request }, userId) => {
  const parsedParams = FeedbackParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    return jsonResponse({ error: "Invalid session_id", details: parsedParams.error.flatten() }, 400);
  }
  const sessionId = parsedParams.data.session_id;
  let rawBody;
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
  const supabase = locals.supabase;
  const { data: feedback, error: upsertError } = await upsertFeedback(supabase, userId, sessionId, rating);
  if (upsertError) {
    return jsonResponse({ error: upsertError }, 500);
  }
  return jsonResponse({ data: feedback }, 200);
});

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      GET,
      POST,
      prerender,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

export { GET as G, POST as P, _page as _, getFeedbackForSession as g, upsertFeedback as u };
