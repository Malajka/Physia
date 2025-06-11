import { E as ErrorCode, w as withAuth } from "./withAuth_BrNYmeHs.mjs";
import { a as fetchWithTimeout } from "./fetch_BqXSZS0y.mjs";
import { z } from "zod";
import { e as errorResponse, s as successResponse } from "./api_CZk8L_u-.mjs";

const OPENROUTER_TIMEOUT_MS = 6e4;

function formatMuscleTestList(muscleTests) {
  return muscleTests.map((test) => `- ${test.name}: Pain Intensity ${test.pain_intensity}/10 - ${test.description}`).join("\n");
}
function formatExercisesForMuscleTests(muscleTests, exercises) {
  return muscleTests
    .map((test) => {
      const relatedExercises = exercises.filter((ex) => ex.muscle_test_id === test.id);
      if (relatedExercises.length === 0) {
        return "";
      }
      const exerciseLines = relatedExercises.map((ex) => `- Exercise ID ${ex.id}: ${ex.description}`).join("\n");
      return `Exercises for ${test.name}:
${exerciseLines}`;
    })
    .filter((section) => section)
    .join("\n\n");
}
function buildTrainingPlanPrompt(bodyPartName, muscleTests, exercises) {
  const muscleTestsSection = formatMuscleTestList(muscleTests);
  const exercisesSection = formatExercisesForMuscleTests(muscleTests, exercises);
  return `
You are an AI physiotherapy assistant specialized in creating personalized training plans for patients with muscle pain.

PATIENT INFORMATION:
- Body Part: ${bodyPartName}
- Muscle Test Results:
${muscleTestsSection}

AVAILABLE EXERCISES:
${exercisesSection}

TASK:
Create a personalized training plan for the patient based on their muscle test results and pain intensities.
Use only the exercises provided above. Prioritize exercises for muscle tests with higher pain intensities.

The training plan should be appropriate for the reported pain levels and focus on strengthening and rehabilitation.
For exercises selected from tests with high pain intensity (7-10), reduce the sets and reps.
For exercises selected from tests with medium pain intensity (4-6), use moderate sets and reps.
For exercises selected from tests with low pain intensity (1-3), use standard sets and reps.

Please return a JSON object with the following structure:
{
  "title": "Training Plan Title",
  "description": "Brief description of the overall plan and its goals",
  "warnings": ["Any specific warnings or precautions"],
  "exercises": [
    {
      "id": 123,
      "name": "Exercise Name",
      "description": "Brief instructions on how to perform the exercise",
      "sets": 3,
      "reps": 10,
      "rest_time_seconds": 60,
      "notes": "Any specific notes for this exercise"
    }
  ]
}

Ensure your response is ONLY the valid JSON object with no additional text.
`.trim();
}

const TrainingPlanSchema = z.object({
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
      notes: z.string().optional(),
    })
  ),
});
function extractJson(content) {
  const match = content.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}
function validatePlan(parsed) {
  const result = TrainingPlanSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Training plan validation failed: ${result.error.message}`);
  }
  return result.data;
}
async function generateTrainingPlan(bodyPartName, muscleTests, exercises) {
  if (muscleTests.length === 0 || exercises.length === 0) {
    return { trainingPlan: null, error: "No muscle tests or exercises provided" };
  }
  const apiKey = "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";
  const aiPrompt = buildTrainingPlanPrompt(bodyPartName, muscleTests, exercises);
  const payload = {
    model: "openai/gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an AI physiotherapy assistant specialized in creating personalized training plans." },
      { role: "user", content: aiPrompt },
    ],
    max_tokens: 2e3,
    temperature: 0.2,
    headers: {
      "HTTP-Referer": "https://physia.app",
      "X-Title": "Physia Exercise Plan Generator",
    },
  };
  let response;
  try {
    response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(payload) },
      OPENROUTER_TIMEOUT_MS
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { trainingPlan: null, error: `OpenRouter API request timed out after ${OPENROUTER_TIMEOUT_MS / 1e3} seconds` };
    }
    return { trainingPlan: null, error: `Error generating training plan: ${err instanceof Error ? err.message : String(err)}` };
  }
  if (!response.ok) {
    const errData = await response.json();
    return { trainingPlan: null, error: `OpenRouter API error: ${errData.error?.message || response.statusText}` };
  }
  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    return { trainingPlan: null, error: "No content generated by OpenRouter" };
  }
  const jsonString = extractJson(content);
  if (!jsonString) {
    return { trainingPlan: null, error: "Generated content does not contain valid JSON" };
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { trainingPlan: null, error: `Failed to parse training plan: ${e instanceof Error ? e.message : String(e)}` };
  }
  try {
    const plan = validatePlan(parsed);
    return { trainingPlan: plan, error: null };
  } catch (e) {
    return { trainingPlan: null, error: e instanceof Error ? e.message : String(e) };
  }
}

async function createSession(supabase, userId, command) {
  const { body_part_id: bodyPartId, tests: selectedTests } = command;
  const disclaimerAcceptedTimestamp = /* @__PURE__ */ new Date().toISOString();
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
      images: exerciseRecord.images,
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
async function validateBodyPart(supabase, bodyPartId) {
  const { data: bodyPartData, error: bodyPartQueryError } = await supabase.from("body_parts").select("id, name").eq("id", bodyPartId).single();
  if (bodyPartQueryError || !bodyPartData) {
    throw new Error(`Body part with ID ${bodyPartId} not found`);
  }
  return bodyPartData;
}
async function validateMuscleTests(supabase, bodyPartId, selectedTests) {
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
async function insertSession(supabase, userId, bodyPartId, disclaimerAt) {
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
async function recordSessionTests(supabase, sessionId, selectedTests) {
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
async function fetchTestsAndExercises(supabase, testIds) {
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
async function generateAndSaveTrainingPlan(supabase, userId, sessionId, bodyPartName, muscleTests, exercises) {
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
    .update({ training_plan: trainingPlan })
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
  tests: z
    .array(
      z.object({
        muscle_test_id: z.number().int().positive(),
        pain_intensity: z.number().int().min(0).max(10),
      })
    )
    .nonempty(),
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

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      POST,
      prerender,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

export { POST as P, _page as _, createSession as c, parseAndValidate as p };
