async function getMuscleTestsForBodyPart(supabase, body_part_id) {
  return await supabase.from("muscle_tests").select(
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
  ).eq("body_part_id", body_part_id);
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
function getMuscleTestImage(exerciseImages) {
  if (!exerciseImages) return null;
  return exerciseImages.find((img) => img.metadata?.purpose === "muscle_test")?.file_path || null;
}

export { getExercisesForMuscleTests as a, getMuscleTestImage as b, getMuscleTestsForBodyPart as g };
