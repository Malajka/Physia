import type { ExerciseDto, MuscleTestDto } from "@/types";
import { describe, expect, it } from "vitest";
import { TrainingPlanSchema, generateMockTrainingPlan } from "./index";
// Import the pure functions directly (if not exported, you may need to export them for testability)
// For this test, we'll assume generateMockTrainingPlan and validatePlan are exported for testing

describe("generateMockTrainingPlan", () => {
  it("generates a valid training plan for given muscle tests and exercises", () => {
    const muscleTests: (MuscleTestDto & { pain_intensity: number })[] = [
      { id: 1, body_part_id: 1, name: "Test1", description: "desc1", created_at: "2024-01-01", pain_intensity: 8 },
      { id: 2, body_part_id: 1, name: "Test2", description: "desc2", created_at: "2024-01-01", pain_intensity: 3 },
    ];
    const exercises: ExerciseDto[] = [
      { id: 10, muscle_test_id: 1, description: "ex1", created_at: "2024-01-01", images: [] },
      { id: 11, muscle_test_id: 2, description: "ex2", created_at: "2024-01-01", images: [] },
    ];
    const plan = generateMockTrainingPlan("Shoulder", muscleTests, exercises);
    expect(plan.title).toBe("Shoulder Recovery Plan");
    expect(plan.exercises.length).toBeGreaterThan(0);
    expect(plan.exercises[0]).toHaveProperty("sets");
    expect(plan.exercises[0]).toHaveProperty("reps");
    expect(plan.exercises[0]).toHaveProperty("rest_time_seconds");
    expect(plan.exercises[0]).toHaveProperty("description");
    expect(plan.exercises[0]).toHaveProperty("name");
    expect(plan.warnings).toBeDefined();
  });
});

describe("TrainingPlanSchema (validatePlan)", () => {
  it("validates a correct training plan object", () => {
    const validPlan = {
      title: "Test Plan",
      description: "desc",
      exercises: [
        {
          id: 1,
          name: "ex",
          description: "desc",
          sets: 3,
          reps: 10,
          rest_time_seconds: 60,
        },
      ],
    };
    const result = TrainingPlanSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test Plan");
    }
  });

  it("fails validation for an invalid plan", () => {
    const invalidPlan = {
      title: "Test Plan",
      description: "desc",
      exercises: [
        {
          id: 1,
          name: "ex",
          description: "desc",
          sets: 0, // invalid: must be positive
          reps: 10,
          rest_time_seconds: 60,
        },
      ],
    };
    const result = TrainingPlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });
});
