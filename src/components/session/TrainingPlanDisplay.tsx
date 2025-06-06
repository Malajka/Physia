import type { TrainingPlan } from "@/lib/services/training-plan";

interface TrainingPlanDisplayProps {
  trainingPlan: TrainingPlan;
  exerciseImagesMap: Record<number, { file_path: string; metadata: unknown }[]>;
}

interface FormattedContent {
  warmup: string[];
  workout: string[];
  cooldown: string[];
  general: string[];
}

function formatExerciseDescription(description: string | null | undefined): FormattedContent {
  if (!description) {
    return { warmup: [], workout: [], cooldown: [], general: [] };
  }

  const warmup: string[] = [];
  const workout: string[] = [];
  const cooldown: string[] = [];
  const general: string[] = [];

  // Split by section markers
  const sections = description.split(/###/).filter((section) => section.trim().length > 0);

  sections.forEach((section) => {
    const lines = section
      .trim()
      .split("\n")
      .filter((line) => line.trim().length > 0);
    if (lines.length === 0) return;

    const sectionType = lines[0].toLowerCase().trim();
    const content = lines.slice(1);

    // If first line doesn't match any section type, treat as general content
    if (!["warmup", "workout", "cooldown", "warm-up", "cool-down"].includes(sectionType)) {
      // This is content without section marker - add it to general by default
      const allLines = [lines[0], ...content];
      allLines.forEach((line) => {
        const cleanLine = line.trim();
        if (cleanLine.length > 0) {
          general.push(cleanLine);
        }
      });
      return;
    }

    // Process content for the identified section
    content.forEach((line) => {
      const cleanLine = line.trim();
      if (cleanLine.length === 0) return;

      // Remove bullet points and numbers if present
      const processedLine = cleanLine.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "");

      switch (sectionType) {
        case "warmup":
        case "warm-up":
          warmup.push(processedLine);
          break;
        case "workout":
          workout.push(processedLine);
          break;
        case "cooldown":
        case "cool-down":
          cooldown.push(processedLine);
          break;
      }
    });
  });

  // If no sections found, treat as general content
  if (warmup.length === 0 && workout.length === 0 && cooldown.length === 0) {
    const lines = description.split("\n").filter((line) => line.trim().length > 0);
    lines.forEach((line) => {
      const cleanLine = line
        .trim()
        .replace(/^[-*•]\s*/, "")
        .replace(/^\d+\.\s*/, "");
      if (cleanLine.length > 0) {
        general.push(cleanLine);
      }
    });
  }

  return { warmup, workout, cooldown, general };
}

export function TrainingPlanDisplay({ trainingPlan, exerciseImagesMap }: TrainingPlanDisplayProps) {
  // Extract sections from all exercises
  const allSections = {
    warmup: [] as { exercise: TrainingPlan["exercises"][number]; content: string[] }[],
    workout: [] as { exercise: TrainingPlan["exercises"][number]; content: string[] }[],
    cooldown: [] as { exercise: TrainingPlan["exercises"][number]; content: string[] }[],
  };

  trainingPlan.exercises.forEach((exercise) => {
    const formatted = formatExerciseDescription(exercise.description);

    if (formatted.warmup.length > 0) {
      allSections.warmup.push({ exercise, content: formatted.warmup });
    }

    if (formatted.workout.length > 0 || formatted.general.length > 0) {
      allSections.workout.push({
        exercise,
        content: formatted.workout.length > 0 ? formatted.workout : formatted.general,
      });
    }

    if (formatted.cooldown.length > 0) {
      allSections.cooldown.push({ exercise, content: formatted.cooldown });
    }
  });

  const SectionCard = ({
    title,
    sectionData,
    bgColor = "bg-white",
    accentColor = "blue",
  }: {
    title: string;
    sectionData: { exercise: TrainingPlan["exercises"][number]; content: string[] }[];
    bgColor?: string;
    accentColor?: string;
  }) => (
    <div className={`${bgColor} rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] min-h-[400px]`}>
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center pb-3 border-b border-gray-200">{title}</h3>

      {sectionData.length > 0 ? (
        <div className="space-y-4">
          {sectionData.map(({ exercise, content }, index) => (
            <div
              key={`${exercise.id}-${index}`}
              data-testid={`session-exercise-${exercise.id}`}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <h4 className="font-semibold text-lg text-gray-800 mb-2">{exercise.name}</h4>

              {/* Exercise Stats */}
              <div className="flex flex-wrap gap-4 mb-3 text-sm">
                <span className="bg-[var(--primary)] text-white px-2 py-1 rounded-md">{exercise.sets} sets</span>
                <span className="bg-[var(--primary)] text-white px-2 py-1 rounded-md">{exercise.reps} reps</span>
                <span className="bg-gray-600 text-white px-2 py-1 rounded-md">{exercise.rest_time_seconds}s rest</span>
              </div>

              {/* Section Content */}
              <div
                className={`${
                  accentColor === "orange"
                    ? "bg-orange-50 border-l-4 border-orange-400"
                    : accentColor === "blue"
                      ? "bg-blue-50 border-l-4 border-blue-400"
                      : "bg-green-50 border-l-4 border-green-400"
                } p-3 rounded-r`}
              >
                <ul
                  className={`text-sm ${
                    accentColor === "orange" ? "text-orange-700" : accentColor === "blue" ? "text-blue-700" : "text-green-700"
                  } space-y-1`}
                >
                  {content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span
                        className={`w-2 h-2 ${
                          accentColor === "orange" ? "bg-orange-400" : accentColor === "blue" ? "bg-blue-400" : "bg-green-400"
                        } rounded-full mt-2 mr-2 flex-shrink-0`}
                      ></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exercise Notes */}
              {exercise.notes && (
                <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
                  <p className="text-sm text-amber-800 italic">{exercise.notes}</p>
                </div>
              )}

              {/* Exercise Images */}
              {exerciseImagesMap[exercise.id]?.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {exerciseImagesMap[exercise.id].map((img, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={img.file_path}
                        alt={exercise.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>No exercises for this section</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="text-center mb-8">
        <h2 data-testid="session-title" className="text-3xl font-bold text-gray-800 mb-4">
          {trainingPlan.title}
        </h2>
        <p data-testid="session-description" className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {trainingPlan.description}
        </p>
      </div>

      {/* Warnings */}
      {trainingPlan.warnings && trainingPlan.warnings.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800 uppercase tracking-wide mb-2">Important Safety Information</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {trainingPlan.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Three-Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Warm-Up" sectionData={allSections.warmup} bgColor="bg-gradient-to-br from-orange-50 to-orange-100" accentColor="orange" />
        <SectionCard title="Workout" sectionData={allSections.workout} bgColor="bg-gradient-to-br from-blue-50 to-blue-100" accentColor="blue" />
        <SectionCard
          title="Cool-Down"
          sectionData={allSections.cooldown}
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          accentColor="green"
        />
      </div>
    </div>
  );
}
