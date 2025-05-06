import { Slider } from "@/components/ui/slider";
import type { MuscleTestDto } from "@/types";

interface MuscleTestItemProps {
  test: MuscleTestDto;
  value: number;
  onChange: (value: number) => void;
  animating: boolean;
}

export function MuscleTestItem({ test, value, onChange, animating }: MuscleTestItemProps) {
  const getPainColor = (v: number) => {
    if (v <= 3) return "#10b981";
    if (v <= 6) return "#fbbf24";
    return "#ef4444";
  };

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-lg font-semibold mb-2">{test.name}</h2>
      <p className="mb-6 text-gray-700">{test.description}</p>
      <div className="flex flex-col space-y-4">
        <label htmlFor={`pain-${test.id}`} className="font-medium text-lg">
          Poziom bólu:{" "}
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
          onValueChange={([v]) => onChange(v)}
          aria-label="Intensywność bólu"
        />
      </div>
    </div>
  );
} 