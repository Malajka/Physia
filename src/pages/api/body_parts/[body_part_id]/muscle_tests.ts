import type { Database } from "@/db/database.types";
import { jsonResponse } from "@/lib/utils/response";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const ParamsSchema = z.object({
  body_part_id: z
    .string()
    .regex(/^\d+$/, { message: "body_part_id must be a number" })
    .transform((val) => parseInt(val, 10)),
});

export const GET: APIRoute = async ({ locals, params }) => {
  // Validate and parse params
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return jsonResponse({ error: "Invalid body_part_id", details: parsed.error.flatten() }, 400);
  }
  const bodyPartId = parsed.data.body_part_id;

  try {
    // Fetch muscle tests from Supabase using typed client
    const supabase: SupabaseClient<Database> = locals.supabase;
    const { data, error } = await supabase
      .from("muscle_tests")
      .select("id, body_part_id, name, description, created_at")
      .eq("body_part_id", bodyPartId);

    if (error) {
      return jsonResponse({ error: "Failed to fetch muscle tests", details: error.message }, 500);
    }

    // Return results wrapped in a data object
    return jsonResponse({ data: data ?? [] }, 200);
  } catch {
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};
