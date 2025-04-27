import type { APIRoute } from "astro";
import type { MuscleTestDto } from "../../../../types";

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  const bodyPartId = parseInt(params.body_part_id!, 10);
  try {
    const { data, error } = await locals.supabase
      .from("muscle_tests")
      .select("id, body_part_id, name, description, created_at")
      .eq("body_part_id", bodyPartId);

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch muscle tests", details: error.message }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data as MuscleTestDto[]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching muscle tests:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}; 