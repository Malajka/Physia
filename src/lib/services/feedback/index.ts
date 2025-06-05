import type { SupabaseClient } from "@/db/supabase.client";
import type { FeedbackRatingDto, ServiceResultDto } from "@/types";

/**
 * Retrieves the feedback rating for a session and user.
 */
export async function getFeedbackForSession(
  supabase: SupabaseClient,
  userId: string,
  sessionId: number
): Promise<ServiceResultDto<FeedbackRatingDto>> {
  const { data, error } = await supabase
    .from("feedback_ratings")
    .select("rating, rated_at")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  const feedbackRatingDto: FeedbackRatingDto = {
    rating: data?.rating ?? null,
    rated_at: data?.rated_at ?? null,
  };
  return { data: feedbackRatingDto };
}

/**
 * Inserts or updates the feedback rating for a session and user.
 */
export async function upsertFeedback(
  supabase: SupabaseClient,
  userId: string,
  sessionId: number,
  rating: number
): Promise<ServiceResultDto<FeedbackRatingDto>> {
  const rated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("feedback_ratings")
    .upsert({ session_id: sessionId, user_id: userId, rating, rated_at }, { onConflict: "session_id,user_id" })
    .select()
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to upsert feedback" };
  }

  const feedbackRatingDto: FeedbackRatingDto = {
    rating: data.rating,
    rated_at: data.rated_at,
  };
  return { data: feedbackRatingDto };
}
