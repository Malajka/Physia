import type { SupabaseClient } from "@/db/supabase.client";
import type { ExerciseDto, ExerciseImageDto } from "@/types";

export async function getExercisesForSession(
  supabase: SupabaseClient,
  user_id: string,
  session_id: number
): Promise<{ exercises: ExerciseDto[]; error?: string }> {
  try {
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("body_part_id")
      .eq("id", session_id)
      .eq("user_id", user_id)
      .single();

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

    const formattedExercises: ExerciseDto[] = exercisesData.map((exercise) => ({
      id: exercise.id,
      muscle_test_id: exercise.muscle_test_id,
      description: exercise.description,
      created_at: exercise.created_at,
      images: exercise.exercise_images as ExerciseImageDto[],
    }));

    return { exercises: formattedExercises };
  } catch (error) {
    return {
      exercises: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

async function getMuscleTestsForBodyPart(supabase: SupabaseClient, body_part_id: number) {
  return await supabase.from("muscle_tests").select("id, name, description").eq("body_part_id", body_part_id);
}

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
