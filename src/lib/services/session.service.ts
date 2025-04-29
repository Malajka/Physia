import type { Json, Tables } from "../../db/database.types";
import { supabaseClient } from "../../db/supabase.client";
import type { CreateSessionCommandDto, ExerciseDto, SessionDetailDto, SessionTestDto } from "../../types";
import { generateTrainingPlan } from "./openrouter.service";

/**
 * Creates a new session with the provided muscle tests and generates a personalized
 * exercise plan using OpenRouter AI.
 *
 * @param supabase - The authenticated Supabase client
 * @param userId - The ID of the authenticated user
 * @param command - The session creation command with body part and tests
 * @returns A promise resolving to the created session details or an error
 */
export async function createSession(
  supabase: typeof supabaseClient,
  userId: string,
  command: CreateSessionCommandDto
): Promise<{ session: SessionDetailDto | null; error: string | null }> {
  // For development, skip disclaimer check
  const disclaimerAcceptedAt = new Date().toISOString();

  try {
    // Verify body part exists
    const { data: bodyPart, error: bodyPartError } = await supabase.from("body_parts").select("id, name").eq("id", command.body_part_id).single();

    if (bodyPartError || !bodyPart) {
      return { session: null, error: `Body part with ID ${command.body_part_id} not found` };
    }

    // Verify muscle tests belong to the body part
    const muscleTestIds = command.tests.map((test) => test.muscle_test_id);
    const { data: validMuscleTests, error: muscleTestsError } = await supabase
      .from("muscle_tests")
      .select("id")
      .eq("body_part_id", command.body_part_id)
      .in("id", muscleTestIds);

    if (muscleTestsError) {
      return { session: null, error: "Failed to validate muscle tests" };
    }

    // Check if all provided muscle tests are valid
    const validIds = new Set(validMuscleTests.map((test) => test.id));
    const invalidTests = muscleTestIds.filter((id) => !validIds.has(id));

    if (invalidTests.length > 0) {
      return {
        session: null,
        error: `The following muscle tests are invalid for the selected body part: ${invalidTests.join(", ")}`,
      };
    }

    // 1. Insert new session
    const { data: newSession, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        body_part_id: command.body_part_id,
        disclaimer_accepted_at: disclaimerAcceptedAt,
        training_plan: {}, // Empty placeholder until we generate the real plan
      })
      .select()
      .single();

    if (sessionError || !newSession) {
      return {
        session: null,
        error: `Failed to create session: ${sessionError?.message || "Unknown error"}`,
      };
    }

    // 2. Insert session tests
    const sessionTests = command.tests.map((test) => ({
      session_id: newSession.id,
      muscle_test_id: test.muscle_test_id,
      pain_intensity: test.pain_intensity,
    }));

    const { error: testsError } = await supabase.from("session_tests").insert(sessionTests).select();

    if (testsError) {
      return {
        session: null,
        error: `Failed to record session tests: ${testsError.message}`,
      };
    }

    // 3. Retrieve full muscle test data and exercises for the selected tests
    const { data: muscleTests, error: muscleTestsDataError } = await supabase
      .from("muscle_tests")
      .select("id, name, description, body_part_id")
      .in("id", muscleTestIds);

    if (muscleTestsDataError || !muscleTests.length) {
      return {
        session: null,
        error: "Failed to retrieve detailed muscle test data",
      };
    }

    // Get exercises for these muscle tests
    const { data: exercisesData, error: exercisesError } = await supabase
      .from("exercises")
      .select(
        `
        id, 
        description, 
        muscle_test_id,
        images:exercise_images(id, file_path, metadata)
      `
      )
      .in("muscle_test_id", muscleTestIds);

    if (exercisesError || !exercisesData.length) {
      return {
        session: null,
        error: "Failed to retrieve exercises for the selected muscle tests",
      };
    }

    // 4. Prepare data for LLM prompt
    type MuscleTestWithPain = Tables<"muscle_tests"> & { pain_intensity: number };

    const muscleTestsWithPain: MuscleTestWithPain[] = muscleTests.map((test) => {
      const painTest = command.tests.find((t) => t.muscle_test_id === test.id);
      return {
        ...(test as Tables<"muscle_tests">),
        pain_intensity: painTest?.pain_intensity || 0,
      };
    });

    // Format exercises with proper TypeScript typing
    type ExerciseWithImages = Tables<"exercises"> & { images: Tables<"exercise_images">[] };

    const formattedExercises: ExerciseDto[] = exercisesData.map((exercise) => ({
      id: (exercise as ExerciseWithImages).id,
      muscle_test_id: (exercise as ExerciseWithImages).muscle_test_id,
      description: (exercise as ExerciseWithImages).description,
      created_at: new Date().toISOString(), // Default since we don't have this in the query
      images: (exercise as ExerciseWithImages).images || [],
    }));

    // 5. Generate the personalized training plan using a validated service
    const { trainingPlan: llmPlan, error: planError } = await generateTrainingPlan(bodyPart.name, muscleTestsWithPain, formattedExercises);
    if (planError) {
      // Log AI generation error
      await supabase.from("generation_error_logs").insert({
        error_code: "ai_generation_failed",
        error_message: planError,
        user_id: userId,
      });
      return { session: null, error: `Failed to generate training plan: ${planError}` };
    }
    // Use the validated plan object directly
    const trainingPlan: Json = llmPlan as Json;

    // 6. Update session with the generated training plan
    const { data: updatedSession, error: updateError } = await supabase
      .from("sessions")
      .update({ training_plan: trainingPlan })
      .eq("id", newSession.id)
      .select(
        `
        id,
        body_part_id,
        user_id,
        disclaimer_accepted_at,
        created_at,
        training_plan,
        session_tests(id, session_id, muscle_test_id, pain_intensity)
      `
      )
      .single();

    if (updateError || !updatedSession) {
      return {
        session: null,
        error: `Failed to update session with training plan: ${updateError?.message || "Unknown error"}`,
      };
    }

    // 7. Return complete session details
    const sessionDetail: SessionDetailDto = {
      id: updatedSession.id,
      body_part_id: updatedSession.body_part_id,
      user_id: updatedSession.user_id,
      disclaimer_accepted_at: updatedSession.disclaimer_accepted_at,
      created_at: updatedSession.created_at,
      training_plan: updatedSession.training_plan,
      session_tests: updatedSession.session_tests as SessionTestDto[],
      feedback_rating: null, // No feedback yet for a new session
    };

    return { session: sessionDetail, error: null };
  } catch (error) {
    console.error("Error in createSession:", error);

    // Log error to generation_error_logs table
    try {
      await supabase.from("generation_error_logs").insert({
        error_code: "session_creation_failed",
        error_message: error instanceof Error ? error.message : String(error),
        user_id: userId,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return {
      session: null,
      error: "An unexpected error occurred while creating the session",
    };
  }
}
