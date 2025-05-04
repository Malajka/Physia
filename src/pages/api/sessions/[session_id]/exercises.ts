import { getExercisesForSession } from "@/lib/services/exercises";
import { jsonResponse } from "@/lib/utils/response";
import type { ExerciseDto } from "@/types";
import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

// Schema to parse and validate route parameter
const ParamsSchema = z.object({
  session_id: z.coerce
    .number({ required_error: "session_id is required", invalid_type_error: "session_id must be a number" })
    .int()
    .positive({ message: "session_id must be a positive integer" }),
});

export const GET: APIRoute = async ({ locals, params }) => {
  // Validate params
  const parseResult = ParamsSchema.safeParse(params);
  if (!parseResult.success) {
    return jsonResponse({ error: "Invalid session_id", details: parseResult.error.flatten() }, 400);
  }
  const sessionId = parseResult.data.session_id;

  // Authenticate user
  const supabase = locals.supabase;
  const { data, error: authError } = await supabase.auth.getSession();
  const session = data.session;
  if (authError || !session) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }
  const userId = session.user.id;

  try {
    // Fetch exercises
    const { exercises, error } = await getExercisesForSession(supabase, userId, sessionId);
    if (error) {
      const isNotFound = /not found|no /i.test(error);
      const status = isNotFound ? 404 : 500;
      return jsonResponse({ error }, status);
    }

    // Respond with data
    return jsonResponse<{ data: ExerciseDto[] }>({ data: exercises }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: "Internal server error", details: message }, 500);
  }
};
