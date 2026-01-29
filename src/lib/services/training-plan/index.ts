import {
  DEFAULT_REST_TIME_SECONDS,
  HIGH_PAIN_THRESHOLD,
  MAX_PLAN_EXERCISES,
  MAX_TEST_EXERCISES,
  MEDIUM_PAIN_THRESHOLD,
  OPENROUTER_TIMEOUT_MS,
  USE_MOCK_DATA,
} from "@/lib/services/training-plan/constants";
import { buildTrainingPlanPrompt } from "@/lib/services/training-plan/prompt-builder";
import { fetchWithTimeout } from "@/lib/utils/fetch";
import type { ExerciseDto, MuscleTestDto } from "@/types";
import { z } from "zod";

/**
 * OpenRouter API request interface
 */
interface OpenRouterRequest {
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  max_tokens: number;
  temperature: number;
  stream?: boolean;
  headers?: Record<string, string>;
}

/**
 * Schema for validating training plan
 */
export const TrainingPlanSchema = z.object({
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
      section_notes: z
        .object({
          warmup: z.string().optional(),
          workout: z.string().optional(),
          cooldown: z.string().optional(),
        })
        .optional(),
    })
  ),
});

export type TrainingPlan = z.infer<typeof TrainingPlanSchema>;

/**
 * Simple in-memory cache for generated plans
 */
const planCache = new Map<string, TrainingPlan>();

/**
 * Extracts JSON substring from AI response
 */
function extractJson(content: string): string | null {
  const match = content.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

/**
 * Validates parsed data
 */
function validatePlan(parsed: unknown): TrainingPlan {
  const result = TrainingPlanSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Training plan validation failed: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Calculate sets/reps based on pain
 */
function calculateSetsReps(painLevel: number): { sets: number; reps: number } {
  if (painLevel >= HIGH_PAIN_THRESHOLD) return { sets: 2, reps: 8 };
  if (painLevel >= MEDIUM_PAIN_THRESHOLD) return { sets: 3, reps: 10 };
  return { sets: 3, reps: 12 };
}

/**
 * Generates a mock training plan (optimized)
 */
export function generateMockTrainingPlan(
  bodyPartName: string,
  muscleTests: (MuscleTestDto & { pain_intensity: number })[],
  exercises: ExerciseDto[]
): TrainingPlan {
  // Sort tests by descending pain
  const sortedTests = [...muscleTests].sort((a, b) => b.pain_intensity - a.pain_intensity);

  // Map exercises by muscle_test_id for O(1) lookup
  const exercisesMap = new Map<number, ExerciseDto[]>();
  for (const ex of exercises) {
    if (!exercisesMap.has(ex.muscle_test_id)) exercisesMap.set(ex.muscle_test_id, []);
    exercisesMap.get(ex.muscle_test_id)?.push(ex);
  }

  const selected: ExerciseDto[] = [];

  for (const test of sortedTests) {
    const related = exercisesMap.get(test.id) || [];
    const takeCount = Math.min(related.length, MAX_TEST_EXERCISES);

    for (let i = 0; i < takeCount && selected.length < MAX_PLAN_EXERCISES; i++) {
      selected.push(related[i]);
    }
    if (selected.length >= MAX_PLAN_EXERCISES) break;
  }

  const plan: TrainingPlan = {
    title: `${bodyPartName} Recovery Plan`.replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `A personalized training plan to address pain in the ${bodyPartName} area, focusing on strength and mobility.`,
    warnings: ["Discontinue any exercise that causes sharp pain", "Consult with a healthcare professional if symptoms worsen"],
    exercises: selected.map((ex) => {
      const test = muscleTests.find((t) => t.id === ex.muscle_test_id);
      const pain = test?.pain_intensity ?? 5;
      const { sets, reps } = calculateSetsReps(pain);

      const structuredDescription = `###warmup
Sit comfortably
Take 3 deep breaths
Gently rotate your ${bodyPartName}

###workout
${ex.description || `Perform the recommended exercise for ${test?.name || "muscle strengthening"}`}
Hold each position for 10-15 seconds
Repeat slowly and controlled

###cooldown
Return to starting position
Take 2 deep breaths
Gently stretch the opposite direction`;

      const sectionNotes = {
        warmup: "Focus on gentle, controlled motions.",
        workout:
          pain >= HIGH_PAIN_THRESHOLD
            ? "Perform with extra caution. Stop immediately if sharp pain occurs."
            : "Maintain proper form and steady breathing.",
        cooldown: "Allow muscles to relax. Don't rush the cool-down.",
      };

      return {
        id: ex.id,
        name: `Exercise for ${test?.name || "Muscle"}`,
        description: structuredDescription,
        sets,
        reps,
        rest_time_seconds: DEFAULT_REST_TIME_SECONDS,
        section_notes: sectionNotes,
      };
    }),
  };

  return plan;
}

/**
 * Generates a training plan (mock or AI)
 */
export async function generateTrainingPlan(
  bodyPartName: string,
  muscleTests: (MuscleTestDto & { pain_intensity: number })[],
  exercises: ExerciseDto[],
  userNote?: string
): Promise<{ trainingPlan: TrainingPlan | null; error: string | null }> {
  if (muscleTests.length === 0 || exercises.length === 0) return { trainingPlan: null, error: "No muscle tests or exercises provided" };

  // Use cache key
  const cacheKey = `${bodyPartName}-${muscleTests.map((t) => t.id).join(",")}`;
  const cached = planCache.get(cacheKey);
  if (cached) return { trainingPlan: cached, error: null };

  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    const mockPlan = generateMockTrainingPlan(bodyPartName, muscleTests, exercises);
    planCache.set(cacheKey, mockPlan);
    return { trainingPlan: mockPlan, error: null };
  }

  // AI path
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) return { trainingPlan: null, error: "OpenRouter API key not configured" };

  // Limit exercises/tests for AI prompt to avoid huge payloads
  const limitedMuscleTests = muscleTests.slice(0, MAX_PLAN_EXERCISES);
  const limitedExercises = exercises.slice(0, MAX_PLAN_EXERCISES * MAX_TEST_EXERCISES);

  const aiPrompt = buildTrainingPlanPrompt(bodyPartName, limitedMuscleTests, limitedExercises, userNote);

  const payload: OpenRouterRequest = {
    model: "openai/gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an AI physiotherapy assistant specialized in creating personalized training plans for patients with overloaded muscles pain. Respond ONLY with JSON.",
      },
      { role: "user", content: aiPrompt },
    ],
    max_tokens: 1500,
    temperature: 0.2,
    headers: {
      "HTTP-Referer": "https://physia.app",
      "X-Title": "Physia Exercise Plan Generator",
    },
  };

  let response: Response;
  try {
    response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(payload) },
      OPENROUTER_TIMEOUT_MS
    );
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { trainingPlan: null, error: `OpenRouter API request timed out after ${OPENROUTER_TIMEOUT_MS / 1000}s` };
    }
    return { trainingPlan: null, error: `Error generating training plan: ${err instanceof Error ? err.message : String(err)}` };
  }

  if (!response.ok) {
    const errData = await response.json();
    return { trainingPlan: null, error: `OpenRouter API error: ${errData.error?.message || response.statusText}` };
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) return { trainingPlan: null, error: "No content generated by OpenRouter" };

  const jsonString = extractJson(content);
  if (!jsonString) return { trainingPlan: null, error: "Generated content does not contain valid JSON" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e: unknown) {
    return { trainingPlan: null, error: `Failed to parse training plan: ${e instanceof Error ? e.message : String(e)}` };
  }

  try {
    const plan = validatePlan(parsed);
    planCache.set(cacheKey, plan);
    return { trainingPlan: plan, error: null };
  } catch (e: unknown) {
    return { trainingPlan: null, error: e instanceof Error ? e.message : String(e) };
  }
}
