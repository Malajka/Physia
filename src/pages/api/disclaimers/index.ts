// src/pages/api/disclaimers/index.ts
import { withAuth } from "@/lib/middleware/withAuth";
import { jsonResponse } from "@/lib/utils/response";
import type { AcceptDisclaimerResponseDto, DisclaimersContentDto } from "@/types";
import type { APIRoute, APIContext } from "astro"; // Ensure APIContext is imported

export const prerender = false;

// GET returns the current disclaimer content and whether the user has accepted it
export const GET: APIRoute = withAuth(async (context: APIContext, userId: string) => { // MODIFIED SIGNATURE
  const { locals } = context; // Destructure locals from context
  const supabase = locals.supabase;

  // console.log(`[GET HANDLER] locals.supabase defined?: ${!!locals?.supabase}, userId: ${userId}`); // For debugging

  if (!supabase) { // Add a guard just in case, though withAuth should prevent this
    console.error("[GET HANDLER] Supabase client is undefined on locals!");
    return jsonResponse({ error: "Server misconfiguration in GET" }, 500);
  }

  // Fetch the latest disclaimer text
  const { data, error } = await supabase.from("disclaimers").select("content").order("updated_at", { ascending: false }).limit(1).single();
  if (error || !data) {
    return jsonResponse({ error: error?.message ?? "Failed to load disclaimer" }, 500);
  }

  // Check if the authenticated user has already accepted
  // We can use the userId from withAuth if needed, but getSession() also works based on the established session.
  const {
    data: { session }, // session here is from supabase.auth.getSession()
  } = await supabase.auth.getSession();
  const accepted_at: string | null = session?.user.user_metadata?.disclaimer_accepted_at ?? null;

  const payload: DisclaimersContentDto & { accepted_at?: string | null } = {
    text: data.content,
    accepted_at,
  };
  return jsonResponse(payload, 200);
});

// POST records acceptance in the user's metadata
export const POST: APIRoute = withAuth(async (context: APIContext, userId: string) => { // MODIFIED SIGNATURE
  const { locals } = context; // Destructure locals from context
  const supabase = locals.supabase;

  // console.log(`[POST HANDLER] locals.supabase defined?: ${!!locals?.supabase}, userId: ${userId}`); // For debugging

  if (!supabase) { // Add a guard
    console.error("[POST HANDLER] Supabase client is undefined on locals!");
    return jsonResponse({ error: "Server misconfiguration in POST" }, 500);
  }

  const accepted_at = new Date().toISOString();
  // The userId from withAuth (which is session.user.id) is implicitly used by supabase.auth.updateUser()
  // as it updates the currently authenticated user.
  const { error } = await supabase.auth.updateUser({
    data: { disclaimer_accepted_at: accepted_at },
  });
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }
  const payload: AcceptDisclaimerResponseDto = { accepted_at };
  return jsonResponse(payload, 201);
});
