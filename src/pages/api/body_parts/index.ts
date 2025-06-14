import { withAuth } from "@/lib/middleware/withAuth";
import { jsonResponse } from "@/lib/utils/response";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = withAuth(async ({ locals }) => {
  const { supabase } = locals;

  try {
    const { data, error } = await supabase.from("body_parts").select("*").order("id");

    if (error) {
      return jsonResponse({ error: "Failed to fetch body parts", details: error.message }, 502);
    }

    return jsonResponse({ data: data ?? [] }, 200);
  } catch {
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
