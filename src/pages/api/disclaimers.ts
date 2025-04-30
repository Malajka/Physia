import type { APIRoute } from "astro";
import type { AcceptDisclaimerResponseDto, DisclaimersContentDto } from "../../types";

export const prerender = false;

// GET returns the current disclaimer content and whether the user has accepted it
export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;
  // Fetch the latest disclaimer text
  const { data, error } = await supabase.from("disclaimers").select("content").order("updated_at", { ascending: false }).limit(1).single();
  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message ?? "Failed to load disclaimer" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if the authenticated user has already accepted
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accepted_at: string | null = session?.user.user_metadata?.disclaimer_accepted_at ?? null;

  const payload: DisclaimersContentDto & { accepted_at?: string | null } = {
    text: data.content,
    accepted_at,
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// POST records acceptance in the user's metadata
export const POST: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;
  // Require authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const accepted_at = new Date().toISOString();
  // Persist acceptance timestamp in user metadata
  const { error } = await supabase.auth.updateUser({
    data: { disclaimer_accepted_at: accepted_at },
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  const payload: AcceptDisclaimerResponseDto = { accepted_at };
  return new Response(JSON.stringify(payload), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
