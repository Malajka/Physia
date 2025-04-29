import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExerciseDto, ExerciseImageDto } from "../../types";

/**
 * Retrieves exercises for a specific session
 * @param supabase Supabase client instance
 * @param user_id ID of the authenticated user
 * @param session_id ID of the session to retrieve exercises for
 * @returns Object containing exercises array or error message
 */
export async function getExercisesForSession(
  supabase: SupabaseClient,
  user_id: string,
  session_id: number
): Promise<{ exercises: ExerciseDto[]; error?: string }> {
  try {
    // 1. Get session details
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("body_part_id, pain_intensity")
      .eq("id", session_id)
      .eq("user_id", user_id)
      .single();

    if (sessionError || !session) {
      return { exercises: [], error: "Session not found or access denied" };
    }

    // 2. Get muscle tests for the body part
    const { data: muscleTests, error: muscleTestsError } = await getMuscleTestsForBodyPart(supabase, session.body_part_id);

    if (muscleTestsError || !muscleTests || muscleTests.length === 0) {
      return { exercises: [], error: "No muscle tests found for the selected body part" };
    }

    // 3. Get exercises for the muscle tests
    const muscleTestIds = muscleTests.map((test) => test.id);
    const { data: exercisesData, error: exercisesError } = await getExercisesForMuscleTests(supabase, muscleTestIds);

    if (exercisesError || !exercisesData || exercisesData.length === 0) {
      return { exercises: [], error: "No exercises found for the selected muscle tests" };
    }

    // 4. Structure will be updated in next steps to include AI enhancement
    // For now, format the exercises according to the DTO structure
    const formattedExercises: ExerciseDto[] = exercisesData.map((exercise) => ({
      id: exercise.id,
      muscle_test_id: exercise.muscle_test_id,
      description: exercise.description,
      created_at: exercise.created_at,
      images: exercise.exercise_images as ExerciseImageDto[],
    }));

    return { exercises: formattedExercises };
  } catch (error) {
    console.error("Error in getExercisesForSession:", error);
    return {
      exercises: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Retrieves muscle tests associated with a specific body part
 * @param supabase Supabase client instance
 * @param body_part_id ID of the body part
 * @returns Object containing muscle tests data or error
 */
async function getMuscleTestsForBodyPart(supabase: SupabaseClient, body_part_id: number) {
  return await supabase.from("muscle_tests").select("id, name, description").eq("body_part_id", body_part_id);
}

/**
 * Retrieves exercises associated with specific muscle tests
 * @param supabase Supabase client instance
 * @param muscle_test_ids Array of muscle test IDs
 * @returns Object containing exercises data or error
 */
async function getExercisesForMuscleTests(supabase: SupabaseClient, muscle_test_ids: number[]) {
  return await supabase
    .from("exercises")
    .select(
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
    )
    .in("muscle_test_id", muscle_test_ids);
}
