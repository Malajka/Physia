import { jsonResponse } from "@/lib/utils/response";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;

  try {
    const { data, error } = await supabase.from("body_parts").select("id, name, created_at").order("id");

    if (error) {
      return jsonResponse({ error: "Failed to fetch body parts", details: error.message }, 502);
    }

    return jsonResponse({ data: data ?? [] }, 200);
  } catch {
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};
