import type { APIRoute } from "astro";
import { z } from "zod";
import type { FeedbackRatingDto } from "../../../../types";

export const prerender = false;

// Schema for validating feedback payload
const FeedbackSchema = z.object({
  rating: z.number().int().min(0).max(1),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const session_id = params.session_id;
  if (!session_id || isNaN(Number(session_id))) {
    return new Response(JSON.stringify({ error: "Invalid session ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = locals.supabase;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = session.user.id;

  const { data, error } = await supabase
    .from("feedback_ratings")
    .select("rating, rated_at")
    .eq("session_id", Number(session_id))
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const feedback: FeedbackRatingDto = {
    rating: data?.rating ?? null,
    rated_at: data?.rated_at ?? null,
  };

  return new Response(JSON.stringify(feedback), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const session_id = params.session_id;
  if (!session_id || isNaN(Number(session_id))) {
    return new Response(JSON.stringify({ error: "Invalid session ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = locals.supabase;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parseResult = FeedbackSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: "Invalid payload", details: parseResult.error.format() }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  const { rating } = parseResult.data;
  const rated_at = new Date().toISOString();

  const { data: upserted, error: upsertError } = await supabase
    .from("feedback_ratings")
    .upsert(
      { session_id: Number(session_id), user_id: userId, rating, rated_at },
      { onConflict: ["session_id", "user_id"] }
    )
    .select()
    .single();

  if (upsertError || !upserted) {
    return new Response(JSON.stringify({ error: upsertError?.message || "Failed to upsert feedback" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const feedback: FeedbackRatingDto = {
    rating: upserted.rating,
    rated_at: upserted.rated_at,
  };

  return new Response(JSON.stringify(feedback), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}; 