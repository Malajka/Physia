import type { Json, Tables } from "@/db/database.types";
import type { SupabaseClient } from "@/db/supabase.client";
import { generateTrainingPlan } from "@/lib/services/training-plan";
import type { CreateSessionCommandDto, ExerciseDto, SessionDetailDto } from "@/types";

type SessionWithTests = Tables<"sessions"> & { session_tests: Tables<"session_tests">[] };

export async function createSession(
  supabase: SupabaseClient,
  userId: string,
  command: CreateSessionCommandDto
): Promise<{ session: SessionDetailDto | null; error: string | null }> {
  const { body_part_id: bodyPartId, tests: selectedTests } = command;
  const disclaimerAcceptedTimestamp = new Date().toISOString();

  try {
    const bodyPartRecord = await validateBodyPart(supabase, bodyPartId);
    await validateMuscleTests(supabase, bodyPartId, selectedTests);

    const createdSessionRecord = await insertSession(supabase, userId, bodyPartId, disclaimerAcceptedTimestamp);
    await recordSessionTests(supabase, createdSessionRecord.id, selectedTests);

    const selectedTestIds = selectedTests.map((test) => test.muscle_test_id);
    const { muscleTests: fetchedMuscleTests, exercises: fetchedExercises } = await fetchTestsAndExercises(supabase, selectedTestIds);

    const muscleTestsWithPain = fetchedMuscleTests.map((muscleTestRecord) => {
      const matchingTest = selectedTests.find((test) => test.muscle_test_id === muscleTestRecord.id);
      if (!matchingTest) {
        throw new Error(`No matching test found for muscle_test_id ${muscleTestRecord.id}`);
      }
      return { ...muscleTestRecord, pain_intensity: matchingTest.pain_intensity };
    });

    const exerciseDtos: ExerciseDto[] = fetchedExercises.map((exerciseRecord) => ({
      id: exerciseRecord.id,
      muscle_test_id: exerciseRecord.muscle_test_id,
      description: exerciseRecord.description,
      created_at: exerciseRecord.created_at,
      images: exerciseRecord.images,
    }));

    const updatedSessionRecord: SessionWithTests = await generateAndSaveTrainingPlan(
      supabase,
      userId,
      createdSessionRecord.id,
      bodyPartRecord.name,
      muscleTestsWithPain,
      exerciseDtos
    );

    const sessionDetailDto: SessionDetailDto = {
      id: updatedSessionRecord.id,
      body_part_id: updatedSessionRecord.body_part_id,
      user_id: updatedSessionRecord.user_id,
      disclaimer_accepted_at: updatedSessionRecord.disclaimer_accepted_at,
      created_at: updatedSessionRecord.created_at,
      training_plan: updatedSessionRecord.training_plan,
      session_tests: updatedSessionRecord.session_tests,
      feedback_rating: null,
    };

    return { session: sessionDetailDto, error: null };
  } catch (errorCaught) {
    const errorMessage = errorCaught instanceof Error ? errorCaught.message : "An unexpected error occurred while creating the session";
    await supabase.from("generation_error_logs").insert({
      error_code: "session_creation_failed",
      error_message: errorMessage,
      user_id: userId,
    });
    return { session: null, error: errorMessage };
  }
}

async function validateBodyPart(supabase: SupabaseClient, bodyPartId: number): Promise<Pick<Tables<"body_parts">, "id" | "name">> {
  const { data: bodyPartData, error: bodyPartQueryError } = await supabase.from("body_parts").select("id, name").eq("id", bodyPartId).single();

  if (bodyPartQueryError || !bodyPartData) {
    throw new Error(`Body part with ID ${bodyPartId} not found`);
  }
  return bodyPartData;
}

async function validateMuscleTests(
  supabase: SupabaseClient,
  bodyPartId: number,
  selectedTests: { muscle_test_id: number; pain_intensity: number }[]
): Promise<Tables<"muscle_tests">[]> {
  const muscleTestIds = selectedTests.map((test) => test.muscle_test_id);
  const { data: muscleTestsData, error: muscleTestsQueryError } = await supabase
    .from("muscle_tests")
    .select("*")
    .eq("body_part_id", bodyPartId)
    .in("id", muscleTestIds);

  if (muscleTestsQueryError) {
    throw new Error("Failed to validate muscle tests");
  }
  const validIds = new Set(muscleTestsData.map((test) => test.id));
  const invalid = muscleTestIds.filter((id) => !validIds.has(id));
  if (invalid.length) {
    throw new Error(`Invalid muscle tests: ${invalid.join(", ")}`);
  }
  return muscleTestsData;
}

async function insertSession(supabase: SupabaseClient, userId: string, bodyPartId: number, disclaimerAt: string): Promise<Tables<"sessions">> {
  const { data: insertedSessionData, error: insertionError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      body_part_id: bodyPartId,
      disclaimer_accepted_at: disclaimerAt,
      training_plan: {},
    })
    .select(
      `
      id,
      user_id,
      body_part_id,
      disclaimer_accepted_at,
      created_at,
      training_plan
    `
    )
    .single();

  if (insertionError || !insertedSessionData) {
    throw new Error(`Failed to create session: ${insertionError?.message || "Unknown error"}`);
  }
  return insertedSessionData;
}

async function recordSessionTests(
  supabase: SupabaseClient,
  sessionId: number,
  selectedTests: { muscle_test_id: number; pain_intensity: number }[]
): Promise<void> {
  const sessionTestEntries = selectedTests.map(({ muscle_test_id, pain_intensity }) => ({
    session_id: sessionId,
    muscle_test_id,
    pain_intensity,
  }));
  const { error: recordError } = await supabase.from("session_tests").insert(sessionTestEntries);

  if (recordError) {
    throw new Error(`Failed to record session tests: ${recordError.message}`);
  }
}

async function fetchTestsAndExercises(
  supabase: SupabaseClient,
  testIds: number[]
): Promise<{
  muscleTests: Tables<"muscle_tests">[];
  exercises: (Tables<"exercises"> & { images: Tables<"exercise_images">[] })[];
}> {
  const [{ data: muscleTestsData, error: muscleTestsQueryError }, { data: rawExerciseRows, error: exercisesQueryError }] = await Promise.all([
    supabase.from("muscle_tests").select("*").in("id", testIds),
    supabase
      .from("exercises")
      .select(
        `
          id,
          muscle_test_id,
          description,
          created_at,
          exercise_images(
            id,
            exercise_id,
            file_path,
            metadata,
            created_at
          )
        `
      )
      .in("muscle_test_id", testIds),
  ]);

  if (muscleTestsQueryError || !muscleTestsData?.length) {
    throw new Error("Failed to retrieve detailed muscle test data");
  }
  if (exercisesQueryError || !rawExerciseRows?.length) {
    throw new Error("Failed to retrieve exercises for the selected muscle tests");
  }

  const exercisesWithImages = rawExerciseRows.map((exerciseRow) => ({
    id: exerciseRow.id,
    muscle_test_id: exerciseRow.muscle_test_id,
    description: exerciseRow.description,
    created_at: exerciseRow.created_at,
    images: exerciseRow.exercise_images,
  }));

  return { muscleTests: muscleTestsData, exercises: exercisesWithImages };
}

async function generateAndSaveTrainingPlan(
  supabase: SupabaseClient,
  userId: string,
  sessionId: number,
  bodyPartName: string,
  muscleTests: (Tables<"muscle_tests"> & { pain_intensity: number })[],
  exercises: ExerciseDto[]
): Promise<SessionWithTests> {
  const { trainingPlan, error } = await generateTrainingPlan(bodyPartName, muscleTests, exercises);
  if (error) {
    await supabase.from("generation_error_logs").insert({
      error_code: "ai_generation_failed",
      error_message: error,
      user_id: userId,
    });
    throw new Error(`Failed to generate training plan: ${error}`);
  }

  const { data: updatedSessionData, error: sessionUpdateError } = await supabase
    .from("sessions")
    .update({ training_plan: trainingPlan as Json })
    .eq("id", sessionId)
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

  if (sessionUpdateError || !updatedSessionData) {
    throw new Error(`Failed to update session with training plan: ${sessionUpdateError?.message || "Unknown error"}`);
  }
  return updatedSessionData as SessionWithTests;
}
