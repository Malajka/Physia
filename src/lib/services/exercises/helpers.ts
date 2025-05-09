import type { SupabaseClient } from "@/db/supabase.client";

export async function getMuscleTestsForBodyPart(supabase: SupabaseClient, body_part_id: number) {
  return await supabase.from("muscle_tests").select("id, name, description").eq("body_part_id", body_part_id);
}

export async function getExercisesForMuscleTests(supabase: SupabaseClient, muscle_test_ids: number[]) {
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
