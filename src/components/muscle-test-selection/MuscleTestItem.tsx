import { Slider } from "@/components/ui";
import type { MuscleTestDto } from "@/types";

interface MuscleTestItemProps {
  test: MuscleTestDto;
  value: number;
  onChange: (value: number) => void;
  animating: boolean;
}

interface FormattedContent {
  steps: string[];
  info: string[];
  warnings: string[];
  notes: string[];
}

function formatDescriptionText(description: string | null | undefined): FormattedContent {
  if (!description) {
    return { steps: [], info: [], warnings: [], notes: [] };
  }

  const steps: string[] = [];
  const info: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

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

    // If first line doesn't match any section type, treat as default content
    if (!["steps", "info", "warning", "note", "instructions", "expect", "important", "remember"].includes(sectionType)) {
      // This is content without section marker - add it to info by default
      const allLines = [lines[0], ...content];
      allLines.forEach((line) => {
        const cleanLine = line.trim();
        if (cleanLine.length > 0) {
          info.push(cleanLine);
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
        case "steps":
        case "instructions":
          steps.push(processedLine);
          break;
        case "info":
        case "expect":
          info.push(processedLine);
          break;
        case "warning":
        case "important":
          warnings.push(processedLine);
          break;
        case "note":
        case "remember":
          notes.push(processedLine);
          break;
      }
    });
  });

  // If no sections found, try to parse as simple text with line breaks
  if (steps.length === 0 && info.length === 0 && warnings.length === 0 && notes.length === 0) {
    const lines = description.split("\n").filter((line) => line.trim().length > 0);
    lines.forEach((line) => {
      const cleanLine = line
        .trim()
        .replace(/^[-*•]\s*/, "")
        .replace(/^\d+\.\s*/, "");
      if (cleanLine.length > 0) {
        info.push(cleanLine);
      }
    });
  }

  return { steps, info, warnings, notes };
}

export function MuscleTestItem({ test, value, onChange, animating }: MuscleTestItemProps) {
  const getPainColor = (v: number) => {
    if (v <= 3) return "#10b981";
    if (v <= 6) return "#fbbf24";
    return "#ef4444";
  };

  const { steps, info, warnings, notes } = formatDescriptionText(test.description);

  return (
    <div className="p-6 border drop-shadow-md rounded-lg bg-white">
      <h2 className="text-lg font-semibold mb-3" data-testid={`muscle-test-heading-${test.id}`}>
        {test.name}
      </h2>

      {/* Test Instructions */}
      <div className="mb-6 space-y-4">
        {/* Steps Section */}
        {steps.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">Instructions</h3>
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-[var(--primary)] to-[#16857f] text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 text-sm leading-relaxed pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Warnings Section */}
        {warnings.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
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
                <h4 className="text-sm font-medium text-red-800 uppercase tracking-wide mb-2">Important</h4>
                <div className="text-sm text-red-700 space-y-1">
                  {warnings.map((warning, index) => (
                    <p key={index}>{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {info.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800 uppercase tracking-wide mb-2">What to expect</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  {info.map((infoItem, index) => (
                    <p key={index}>{infoItem}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {notes.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-amber-800 uppercase tracking-wide mb-2">Remember</h4>
                <div className="text-sm text-amber-700 space-y-1">
                  {notes.map((note, index) => (
                    <p key={index}>{note}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback if no content is categorized */}
        {steps.length === 0 && info.length === 0 && warnings.length === 0 && notes.length === 0 && test.description && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 text-sm leading-relaxed">{test.description}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        <label htmlFor={`pain-${test.id}`} className="font-medium text-lg">
          Pain level:{" "}
          <span
            style={{
              color: getPainColor(value),
              fontWeight: "bold",
              fontSize: "24px",
              transition: "color 0.3s ease",
            }}
            className={animating ? "animate-pulse scale-110" : ""}
          >
            {value}
          </span>
        </label>
        <Slider
          id={`pain-${test.id}`}
          min={0}
          max={10}
          step={1}
          value={[value]}
          onValueChange={([v]: number[]) => onChange(v)}
          aria-label="Pain intensity"
          data-testid={`slider-${test.id}`}
        />
      </div>
    </div>
  );
}
