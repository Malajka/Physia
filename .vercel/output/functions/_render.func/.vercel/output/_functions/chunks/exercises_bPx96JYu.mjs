import { w as withAuth } from './withAuth_B5AzTmJJ.mjs';
import { j as jsonResponse } from './response_BJucfPdF.mjs';
import { z } from 'zod';

async function getMuscleTestsForBodyPart(supabase, body_part_id) {
  return await supabase.from("muscle_tests").select("id, name, description").eq("body_part_id", body_part_id);
}
async function getExercisesForMuscleTests(supabase, muscle_test_ids) {
  return await supabase.from("exercises").select(
    `
      id,
      description,
      muscle_test_id,
      created_at,
      exercise_images (
        id,
        exercise_id,
        file_path,
        metadata,
        created_at
      )
    `
  ).in("muscle_test_id", muscle_test_ids);
}

async function getExercisesForSession(supabase, user_id, session_id) {
  try {
    const { data: session, error: sessionError } = await supabase.from("sessions").select("body_part_id").eq("id", session_id).eq("user_id", user_id).single();
    if (sessionError || !session) {
      return { exercises: [], error: "Session not found or access denied" };
    }
    const { data: muscleTests, error: muscleTestsError } = await getMuscleTestsForBodyPart(supabase, session.body_part_id);
    if (muscleTestsError || !muscleTests || muscleTests.length === 0) {
      return { exercises: [], error: "No muscle tests found for the selected body part" };
    }
    const muscleTestIds = muscleTests.map((test) => test.id);
    const { data: exercisesData, error: exercisesError } = await getExercisesForMuscleTests(supabase, muscleTestIds);
    if (exercisesError || !exercisesData || exercisesData.length === 0) {
      return { exercises: [], error: "No exercises found for the selected muscle tests" };
    }
    const formattedExercises = exercisesData.map((exercise) => ({
      id: exercise.id,
      muscle_test_id: exercise.muscle_test_id,
      description: exercise.description,
      created_at: exercise.created_at,
      images: exercise.exercise_images
    }));
    return { exercises: formattedExercises };
  } catch (error) {
    return {
      exercises: [],
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

const prerender = false;
const ParamsSchema = z.object({
  session_id: z.coerce.number().int().positive()
});
const GET = withAuth(async ({ locals, params }, userId) => {
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
    return jsonResponse({ data: exercises }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: "Internal server error", details: message }, 500);
  }
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

export { GET as G, _page as _, getExercisesForSession as g };
