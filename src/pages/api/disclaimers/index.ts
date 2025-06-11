import { withAuth } from "@/lib/middleware/withAuth";
import { jsonResponse } from "@/lib/utils/response";
import type { AcceptDisclaimerResponseDto, DisclaimersContentDto } from "@/types";

// GET returns the current disclaimer content and whether the user has accepted it
export const GET = withAuth(async ({ locals }) => {
  const supabase = locals.supabase;
  // Fetch the latest disclaimer text
  const { data: disclaimerData, error: disclaimerError } = await supabase
    .from("disclaimers")
    .select("content")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (disclaimerError || !disclaimerData) {
    return jsonResponse({ error: disclaimerError?.message ?? "Failed to load disclaimer" }, 500);
  }

  // Check if the authenticated user has already accepted
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accepted_at: string | null = session?.user.user_metadata?.disclaimer_accepted_at ?? null;

  const payload: DisclaimersContentDto & { accepted_at?: string | null } = {
    text: disclaimerData.content,
    accepted_at,
  };
  return jsonResponse(payload, 200);
});

// POST records acceptance in the user's metadata
export const POST = withAuth(async ({ locals }) => {
  const supabase = locals.supabase;
  const accepted_at = new Date().toISOString();
  const { error } = await supabase.auth.updateUser({
    data: { disclaimer_accepted_at: accepted_at },
  });
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }
  const payload: AcceptDisclaimerResponseDto = { accepted_at };
  return jsonResponse(payload, 201);
});
