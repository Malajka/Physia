import type { ExerciseDto, MuscleTestDto } from "@/types";

function formatMuscleTestList(muscleTests: (MuscleTestDto & { pain_intensity: number })[]): string {
  return muscleTests.map((test) => `- ${test.name}: Pain Intensity ${test.pain_intensity}/10 - ${test.description}`).join("\n");
}

function formatExercisesForMuscleTests(muscleTests: (MuscleTestDto & { pain_intensity: number })[], exercises: ExerciseDto[]): string {
  return muscleTests
    .map((test) => {
      const relatedExercises = exercises.filter((ex) => ex.muscle_test_id === test.id);
      if (relatedExercises.length === 0) {
        return "";
      }
      const exerciseLines = relatedExercises.map((ex) => `- Exercise ID ${ex.id}: ${ex.description}`).join("\n");
      return `Exercises for ${test.name}:\n${exerciseLines}`;
    })
    .filter((section) => section)
    .join("\n\n");
}

export function buildTrainingPlanPrompt(
  bodyPartName: string,
  muscleTests: (MuscleTestDto & { pain_intensity: number })[],
  exercises: ExerciseDto[]
): string {
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
      "rep": 15,
      "rest_time_seconds": 60,
      "notes": "Any specific notes for this exercise"
    }
  ]
}

Ensure your response is ONLY the valid JSON object with no additional text.
`.trim();
}
