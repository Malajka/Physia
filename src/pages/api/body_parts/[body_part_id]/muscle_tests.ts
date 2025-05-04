import { withAuth } from "@/lib/middleware/withAuth";
import { jsonResponse } from "@/lib/utils/response";
import type { MuscleTestDto } from "@/types";
import { z } from "zod";

export const prerender = false;

// Schema to parse and validate route parameter as a positive integer
const ParamsSchema = z.object({
  body_part_id: z.coerce
    .number({
      required_error: "body_part_id is required",
      invalid_type_error: "body_part_id must be a number",
    })
    .int()
    .positive(),
});

// Columns to select from muscle_tests table
const SELECT_COLUMNS = "id, body_part_id, name, description, created_at";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async ({ locals: { supabase }, params }, _userId) => {
  // Parse and validate body_part_id
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return jsonResponse({ error: "Invalid body_part_id", details: parsed.error.flatten() }, 400);
  }
  const bodyPartId = parsed.data.body_part_id;

  try {
    const { data, error } = await supabase.from("muscle_tests").select(SELECT_COLUMNS).eq("body_part_id", bodyPartId);

    if (error) {
      // Upstream (Supabase) failure
      return jsonResponse({ error: "Failed to fetch muscle tests", details: error.message }, 502);
    }

    // Wrap and return data with explicit response type
    return jsonResponse<{ data: MuscleTestDto[] }>({ data: data ?? [] }, 200);
  } catch {
    // Unexpected server error
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
