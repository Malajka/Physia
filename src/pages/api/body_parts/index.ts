// src/pages/api/body_parts/index.ts

import { withAuth } from "@/lib/middleware/withAuth";
import { jsonResponse } from "@/lib/utils/response";
import type { APIRoute } from "astro";

export const prerender = false;

// We use `withAuth` to ensure the user is authenticated.
// It uses the secure `getUser()` method internally.
export const GET: APIRoute = withAuth(async ({ locals }) => {
  // `withAuth` guarantees a valid session, so we can trust `locals.supabase`.
  // This client is already authenticated for the current user.
  const { supabase } = locals;

  try {
    // Simply perform the query. RLS policies will be automatically applied
    // by Supabase for the authenticated user. No need to create new clients.
    const { data, error } = await supabase.from("body_parts").select("*").order("id");

    if (error) {
      // Forward the specific database error for better debugging.
      return jsonResponse({ error: "Failed to fetch body parts", details: error.message }, 502);
    }

    return jsonResponse({ data: data ?? [] }, 200);
  } catch {
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
