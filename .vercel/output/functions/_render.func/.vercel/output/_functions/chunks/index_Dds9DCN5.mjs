import { E as ErrorCode, w as withAuth } from './withAuth_B5AzTmJJ.mjs';
import { z } from 'zod';
import { e as errorResponse, s as successResponse } from './api_CZk8L_u-.mjs';

const HIGH_PAIN_THRESHOLD = 7;
const MEDIUM_PAIN_THRESHOLD = 4;
const DEFAULT_REST_TIME_SECONDS = 60;
const MAX_PLAN_EXERCISES = 5;
const MAX_TEST_EXERCISES = 2;

z.object({
  title: z.string(),
  description: z.string(),
  warnings: z.array(z.string()).optional(),
  exercises: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      sets: z.number().int().positive(),
      reps: z.number().int().positive(),
      rest_time_seconds: z.number().int().nonnegative(),
      notes: z.string().optional()
    })
  )
});
function calculateSetsReps(painLevel) {
  if (painLevel >= HIGH_PAIN_THRESHOLD) {
    return { sets: 2, reps: 8 };
  } else if (painLevel >= MEDIUM_PAIN_THRESHOLD) {
    return { sets: 3, reps: 10 };
  }
  return { sets: 3, reps: 12 };
}
function generateMockTrainingPlan(bodyPartName, muscleTests, exercises) {
  const sortedTests = [...muscleTests].sort((a, b) => b.pain_intensity - a.pain_intensity);
  const selected = [];
  for (const test of sortedTests) {
    const related = exercises.filter((ex) => ex.muscle_test_id === test.id);
    const takeCount = Math.min(related.length, MAX_TEST_EXERCISES);
    for (let i = 0; i < takeCount && selected.length < MAX_PLAN_EXERCISES; i++) {
      selected.push(related[i]);
    }
    if (selected.length >= MAX_PLAN_EXERCISES) break;
  }
  return {
    title: `${bodyPartName} Recovery Plan`,
    description: `A personalized training plan to address pain in the ${bodyPartName} area, focusing on strength and mobility.`,
    warnings: ["Discontinue any exercise that causes sharp pain", "Consult with a healthcare professional if symptoms worsen"],
    exercises: selected.map((ex) => {
      const test = muscleTests.find((t) => t.id === ex.muscle_test_id);
      const pain = test?.pain_intensity ?? 5;
      const { sets, reps } = calculateSetsReps(pain);
      return {
        id: ex.id,
        name: `Exercise for ${test?.name || "Muscle"}`,
        description: ex.description,
        sets,
        reps,
        rest_time_seconds: DEFAULT_REST_TIME_SECONDS,
        notes: pain >= HIGH_PAIN_THRESHOLD ? "Perform with caution due to high pain level" : void 0
      };
    })
  };
}
async function generateTrainingPlan(bodyPartName, muscleTests, exercises) {
  if (muscleTests.length === 0 || exercises.length === 0) {
    return { trainingPlan: null, error: "No muscle tests or exercises provided" };
  }
  {
    const mockPlan = generateMockTrainingPlan(bodyPartName, muscleTests, exercises);
    return { trainingPlan: mockPlan, error: null };
  }
}

async function createSession(supabase, userId, command) {
  const { body_part_id: bodyPartId, tests: selectedTests } = command;
  const disclaimerAcceptedTimestamp = (/* @__PURE__ */ new Date()).toISOString();
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
    const exerciseDtos = fetchedExercises.map((exerciseRecord) => ({
      id: exerciseRecord.id,
      muscle_test_id: exerciseRecord.muscle_test_id,
      description: exerciseRecord.description,
      created_at: exerciseRecord.created_at,
      images: exerciseRecord.images
    }));
    const updatedSessionRecord = await generateAndSaveTrainingPlan(
      supabase,
      userId,
      createdSessionRecord.id,
      bodyPartRecord.name,
      muscleTestsWithPain,
      exerciseDtos
    );
    const sessionDetailDto = {
      id: updatedSessionRecord.id,
      body_part_id: updatedSessionRecord.body_part_id,
      user_id: updatedSessionRecord.user_id,
      disclaimer_accepted_at: updatedSessionRecord.disclaimer_accepted_at,
      created_at: updatedSessionRecord.created_at,
      training_plan: updatedSessionRecord.training_plan,
      session_tests: updatedSessionRecord.session_tests,
      feedback_rating: null
    };
    return { session: sessionDetailDto, error: null };
  } catch (errorCaught) {
    const errorMessage = errorCaught instanceof Error ? errorCaught.message : "An unexpected error occurred while creating the session";
    await supabase.from("generation_error_logs").insert({
      error_code: "session_creation_failed",
      error_message: errorMessage,
      user_id: userId
    });
    return { session: null, error: errorMessage };
  }
}
async function validateBodyPart(supabase, bodyPartId) {
  const { data: bodyPartData, error: bodyPartQueryError } = await supabase.from("body_parts").select("id, name").eq("id", bodyPartId).single();
  if (bodyPartQueryError || !bodyPartData) {
    throw new Error(`Body part with ID ${bodyPartId} not found`);
  }
  return bodyPartData;
}
async function validateMuscleTests(supabase, bodyPartId, selectedTests) {
  const muscleTestIds = selectedTests.map((test) => test.muscle_test_id);
  const { data: muscleTestsData, error: muscleTestsQueryError } = await supabase.from("muscle_tests").select("*").eq("body_part_id", bodyPartId).in("id", muscleTestIds);
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
async function insertSession(supabase, userId, bodyPartId, disclaimerAt) {
  const { data: insertedSessionData, error: insertionError } = await supabase.from("sessions").insert({
    user_id: userId,
    body_part_id: bodyPartId,
    disclaimer_accepted_at: disclaimerAt,
    training_plan: {}
  }).select(
    `
      id,
      user_id,
      body_part_id,
      disclaimer_accepted_at,
      created_at,
      training_plan
    `
  ).single();
  if (insertionError || !insertedSessionData) {
    throw new Error(`Failed to create session: ${insertionError?.message || "Unknown error"}`);
  }
  return insertedSessionData;
}
async function recordSessionTests(supabase, sessionId, selectedTests) {
  const sessionTestEntries = selectedTests.map(({ muscle_test_id, pain_intensity }) => ({
    session_id: sessionId,
    muscle_test_id,
    pain_intensity
  }));
  const { error: recordError } = await supabase.from("session_tests").insert(sessionTestEntries);
  if (recordError) {
    throw new Error(`Failed to record session tests: ${recordError.message}`);
  }
}
async function fetchTestsAndExercises(supabase, testIds) {
  const [{ data: muscleTestsData, error: muscleTestsQueryError }, { data: rawExerciseRows, error: exercisesQueryError }] = await Promise.all([
    supabase.from("muscle_tests").select("*").in("id", testIds),
    supabase.from("exercises").select(
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
    ).in("muscle_test_id", testIds)
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
    images: exerciseRow.exercise_images
  }));
  return { muscleTests: muscleTestsData, exercises: exercisesWithImages };
}
async function generateAndSaveTrainingPlan(supabase, userId, sessionId, bodyPartName, muscleTests, exercises) {
  const { trainingPlan, error } = await generateTrainingPlan(bodyPartName, muscleTests, exercises);
  if (error) {
    await supabase.from("generation_error_logs").insert({
      error_code: "ai_generation_failed",
      error_message: error,
      user_id: userId
    });
    throw new Error(`Failed to generate training plan: ${error}`);
  }
  const { data: updatedSessionData, error: sessionUpdateError } = await supabase.from("sessions").update({ training_plan: trainingPlan }).eq("id", sessionId).select(
    `
      id,
      body_part_id,
      user_id,
      disclaimer_accepted_at,
      created_at,
      training_plan,
      session_tests(id, session_id, muscle_test_id, pain_intensity)
    `
  ).single();
  if (sessionUpdateError || !updatedSessionData) {
    throw new Error(`Failed to update session with training plan: ${sessionUpdateError?.message || "Unknown error"}`);
  }
  return updatedSessionData;
}

async function parseAndValidate(request, schema) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw errorResponse(ErrorCode.VALIDATION_FAILED, "Invalid JSON in request body", 400);
  }
  try {
    return schema.parse(body);
  } catch {
    throw errorResponse(ErrorCode.VALIDATION_FAILED, "Request validation failed", 400);
  }
}

const CreateSessionSchema = z.object({
  body_part_id: z.number().int().positive(),
  tests: z.array(
    z.object({
      muscle_test_id: z.number().int().positive(),
      pain_intensity: z.number().int().min(0).max(10)
    })
  ).nonempty()
});

const prerender = false;
const POST = withAuth(async ({ request, locals }, userId) => {
  try {
    const command = await parseAndValidate(request, CreateSessionSchema);
    const { session: createdSession, error } = await createSession(locals.supabase, userId, command);
    if (error) {
      if (error === "disclaimer_required") {
        return errorResponse(ErrorCode.DISCLAIMER_REQUIRED, "User must accept the medical disclaimer before creating a session", 403);
      }
      if (error.includes("not found")) {
        return errorResponse(ErrorCode.RESOURCE_NOT_FOUND, error, 404);
      }
      return errorResponse(ErrorCode.SERVER_ERROR, "An error occurred while creating the session", 500);
    }
    return successResponse(createdSession, 201);
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    return errorResponse(ErrorCode.SERVER_ERROR, "Unexpected error", 500);
  }
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

export { POST as P, _page as _, createSession as c, parseAndValidate as p };
