import { withAuth } from "@/lib/middleware/withAuth";
import { getExercisesForSession } from "@/lib/services/exercises";
import { jsonResponse } from "@/lib/utils/response";
import type { ExerciseDto } from "@/types";
import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const ParamsSchema = z.object({
  session_id: z.coerce.number().int().positive(),
});

export const GET: APIRoute = withAuth(async ({ locals, params }, userId) => {
  const parseResult = ParamsSchema.safeParse(params);
  if (!parseResult.success) {
    return jsonResponse({ error: "Invalid session_id", details: parseResult.error.flatten() }, 400);
  }
  const sessionId = parseResult.data.session_id;

  try {
    const { exercises, error } = await getExercisesForSession(locals.supabase, userId, sessionId);

    if (error) {
      const isNotFound = /not found|no /i.test(error);
      const status = isNotFound ? 404 : 500;
      return jsonResponse({ error }, status);
    }

    return jsonResponse<{ data: ExerciseDto[] }>({ data: exercises }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: "Internal server error", details: message }, 500);
  }
});
