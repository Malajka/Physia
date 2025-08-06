import type { ExerciseDto, MuscleTestDto } from "@/types";

function formatMuscleTestList(muscleTests: (MuscleTestDto & { pain_intensity: number })[]): string {
  return muscleTests.map((test) => `- ${test.name}: Pain Intensity ${test.pain_intensity}/10`).join("\n");
}

function formatExercisesForMuscleTests(muscleTests: (MuscleTestDto & { pain_intensity: number })[], exercises: ExerciseDto[]): string {
  return muscleTests
    .map((test) => {
      const relatedExercises = exercises.filter((ex) => ex.muscle_test_id === test.id);
      if (relatedExercises.length === 0) {
        return "";
      }
      const exerciseLines = relatedExercises.map((ex) => `- Exercise ID ${ex.id}: ${ex.description.substring(0, 200)}...`).join("\n");
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

FORMATTING REQUIREMENTS - READ CAREFULLY:
Every exercise description MUST be structured with exactly 3 sections using these exact markers:
1. ###warmup (on its own line)
2. ###workout (on its own line) 
3. ###cooldown (on its own line)

Each section must contain specific, unique instructions. Never skip any section.

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

IMPORTANT: Each exercise description MUST include ALL THREE training phases with section markers:

- Use \`###warmup\` for warm-up instructions (preparation, joint mobilization, gentle movements)
- Use \`###workout\` for main exercise instructions (strengthening, therapeutic movements)
- Use \`###cooldown\` for cool-down instructions (relaxation, return to rest state)

Each marker must be on a separate line, followed by instructions on subsequent lines.

CRITICAL FORMATTING REQUIREMENTS:
- Every exercise MUST have exactly 3 sections: warmup, workout, cooldown
- Each section marker (\`###warmup\`, \`###workout\`, \`###cooldown\`) must be on its own line
- Use \n for line breaks between instructions within each section
- Use \n\n to separate sections
- Never skip any of the three sections
- Never duplicate content between sections

Please return a JSON object with the following structure:
{
  "title": "Training Plan Title",
  "description": "Brief description of the overall plan and its goals",
  "warnings": ["Any specific warnings or precautions"],
  "exercises": [
    {
      "id": 123,
      "name": "Exercise Name",
      "description": "###warmup\nSit comfortably on chair\nPerform gentle neck rotations\nTake 3 deep breaths\n\n###workout\nPlace hand on head\nApply gentle pressure\nHold for 15 seconds\nRepeat movement 3 times\n\n###cooldown\nReturn to neutral position\nTake deep breaths\nRelax shoulders",
      "sets": 3,
      "reps": 15,
      "rest_time_seconds": 60,
      "section_notes": {
        "warmup": "Prepare body for exercise, focus on breathing",
        "workout": "Main strengthening exercise, maintain proper form", 
        "cooldown": "Gradual return to rest, focus on relaxation"
      }
    }
  ]
}

NOTE: The description field above shows the EXACT format required. Each section marker (###warmup, ###workout, ###cooldown) must be on its own line, followed by instructions on subsequent lines.

DESCRIPTION FORMATTING RULES:
- Each section marker (\`###warmup\`, \`###workout\`, \`###cooldown\`) must be on its own line
- ALL THREE sections are MANDATORY for every exercise
- Instructions for each section go on lines after the marker
- Use \n for line breaks in the JSON string
- Keep instructions clear, specific, and easy to follow
- Include starting positions and specific movements
- Specify timing or repetitions based on the pain intensity of the muscle test
- Be concise and to the point
- Warm-up should be brief (2-3 instructions)
- Workout should be the main focus (3-5 instructions)
- Cool-down should be brief (2-3 instructions)
- Never duplicate content between sections
- Each section should have unique, specific instructions
- Format: ###warmup\ninstruction1\ninstruction2\n\n###workout\ninstruction1\ninstruction2\n\n###cooldown\ninstruction1\ninstruction2

SECTION NOTES RULES:
- Provide specific, relevant notes for each training phase
- Warm-up notes: focus on preparation, breathing, and gentle movement tips
- Workout notes: focus on technique, form, and intensity guidance
- Cool-down notes: focus on relaxation, recovery, and post-exercise care
- Make notes practical and actionable for the patient
- Consider pain levels when writing section-specific notes

FINAL REMINDER:
- EVERY exercise MUST have ###warmup, ###workout, and ###cooldown sections
- Each section marker must be on its own line
- Use \n for line breaks, not \\n
- Never skip any of the three sections
- Each section should have unique content
- Follow the exact format shown in the example above
- Each section must contain at least 2-3 specific instructions

Ensure your response is ONLY the valid JSON object with no additional text.
`.trim();
}
