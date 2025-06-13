import type { ExerciseDto, MuscleTestDto } from "@/types";
import { describe, expect, it } from "vitest";
import { buildTrainingPlanPrompt } from "./prompt-builder";

describe("buildTrainingPlanPrompt", () => {
  it("includes body part, muscle test names, pain intensities, and exercise descriptions", () => {
    const muscleTests: (MuscleTestDto & { pain_intensity: number })[] = [
      { id: 1, body_part_id: 1, name: "Biceps", description: "Elbow flexion", created_at: "2024-01-01", pain_intensity: 7 },
      { id: 2, body_part_id: 1, name: "Triceps", description: "Elbow extension", created_at: "2024-01-01", pain_intensity: 3 },
    ];
    const exercises: ExerciseDto[] = [
      { id: 10, muscle_test_id: 1, description: "Biceps curl", created_at: "2024-01-01", images: [] },
      { id: 11, muscle_test_id: 2, description: "Triceps extension", created_at: "2024-01-01", images: [] },
    ];
    const prompt = buildTrainingPlanPrompt("Arm", muscleTests, exercises);
    expect(prompt).toContain("Body Part: Arm");
    expect(prompt).toContain("Biceps: Pain Intensity 7/10");
    expect(prompt).toContain("Triceps: Pain Intensity 3/10");
    expect(prompt).toContain("Biceps curl");
    expect(prompt).toContain("Triceps extension");
    expect(prompt).toContain("Create a personalized training plan");
    expect(prompt).toContain("JSON object");
  });

  it("handles no exercises for a muscle test", () => {
    const muscleTests: (MuscleTestDto & { pain_intensity: number })[] = [
      { id: 1, body_part_id: 1, name: "Biceps", description: "Elbow flexion", created_at: "2024-01-01", pain_intensity: 7 },
    ];

    const exercises: ExerciseDto[] = [];
    const prompt = buildTrainingPlanPrompt("Arm", muscleTests, exercises);
    expect(prompt).toContain("Body Part: Arm");
    expect(prompt).toContain("Biceps: Pain Intensity 7/10");
    // Should not throw or include exercises section for Biceps
  });
});
