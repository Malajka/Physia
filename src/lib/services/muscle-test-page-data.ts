import { supabaseClient } from "@/db/supabase.client";

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function getMuscleTestsPageData(bodyPartId: number) {
  // Fetch muscle tests with exercises and their images
  const { data: muscleTests, error } = await supabaseClient
    .from("muscle_tests")
    .select(
      `
      id,
      body_part_id,
      name,
      description,
      created_at,
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
    .eq("body_part_id", bodyPartId);

  // Fetch body part name
  const { data: bodyPartData } = await supabaseClient.from("body_parts").select("name").eq("id", bodyPartId).single();

  return {
    muscleTests,
    fetchError: error ? error.message : null,
    pageTitle: bodyPartData?.name ? `Muscle Tests for: ${capitalizeFirst(bodyPartData.name)}` : "Muscle Test Selection",
    bodyPartId,
    backLink: { href: "/", text: "Back to body part selection" },
  };
}
