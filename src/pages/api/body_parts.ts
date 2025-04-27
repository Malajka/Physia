import type { APIRoute } from "astro";
import type { BodyPartDto } from "../../types";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const { data, error } = await locals.supabase.from("body_parts").select("id, name, created_at").order("id");

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch body parts",
          details: error.message,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data as BodyPartDto[]), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error fetching body parts:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
