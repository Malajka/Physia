// src/pages/api/body_parts/[body_part_id]/muscle_tests.ts

import { withAuth } from "@/lib/middleware/withAuth";
import { jsonResponse } from "@/lib/utils/response";
import { z } from "zod";

export const prerender = false;

// Schema to parse and validate the route parameter as a positive integer.
const ParamsSchema = z.object({
  body_part_id: z.coerce
    .number({
      required_error: "body_part_id is required",
      invalid_type_error: "body_part_id must be a number",
    })
    .int()
    .positive(),
});

// Columns to select from the muscle_tests table.
const SELECT_COLUMNS = "id, body_part_id, name, description, created_at";

// The GET handler, wrapped with authentication middleware.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async ({ locals: { supabase }, params }, _userId) => {
  // Parse and validate the body_part_id from the URL.
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return jsonResponse({ error: "Invalid body_part_id", details: parsed.error.flatten() }, 400);
  }
  const bodyPartId = parsed.data.body_part_id;

  try {
    const { data, error } = await supabase.from("muscle_tests").select(SELECT_COLUMNS).eq("body_part_id", bodyPartId);

    if (error) {
      // Handle upstream (Supabase) failures.
      return jsonResponse({ error: "Failed to fetch muscle tests", details: error.message }, 502); // 502 Bad Gateway
    }

    // Wrap and return the data, ensuring it's always an array.
    return jsonResponse({ data: data ?? [] }, 200);
  } catch (e) {
    // Handle unexpected server errors.
    console.error("Internal server error fetching muscle tests:", e);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
