import type { SupabaseClient } from "@/db/supabase.client";

export async function getMuscleTestsForBodyPart(supabase: SupabaseClient, body_part_id: number) {
  return await supabase
    .from("muscle_tests")
    .select(
      `
      id, 
      name, 
      description,
      exercises (
        id,
        exercise_images (
          id,
          file_path,
          metadata
        )
      )
    `
    )
    .eq("body_part_id", body_part_id);
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

// Helper function to get the first muscle test image from exercise images
export function getMuscleTestImage(exerciseImages: { file_path: string; metadata: any }[] | null) {
  if (!exerciseImages) return null;
  return exerciseImages.find((img) => img.metadata?.purpose === "muscle_test")?.file_path || null;
}

// Helper function to get exercise images (excluding muscle test images)
export function getExerciseImages(exerciseImages: { file_path: string; metadata: any }[] | null) {
  if (!exerciseImages) return [];
  return exerciseImages.filter((img) => img.metadata?.purpose === "exercise").sort((a, b) => (a.metadata?.order || 0) - (b.metadata?.order || 0));
}
