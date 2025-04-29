import { useState } from "react";
import type { MuscleTestDto } from "../../types";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

interface MuscleTestFormProps {
  bodyPartId: number;
  muscleTests: MuscleTestDto[];
}

interface TestSelection {
  muscleTestId: number;
  painIntensity: number;
}

export default function MuscleTestForm({ bodyPartId, muscleTests }: MuscleTestFormProps) {
  const [selections, setSelections] = useState<TestSelection[]>(
    muscleTests.map((test) => ({
      muscleTestId: test.id,
      painIntensity: 0,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPainColor = (value: number): string => {
    if (value <= 3) return "#10b981"; // Zielony dla niskiego bólu
    if (value <= 6) return "#fbbf24"; // Żółty dla średniego bólu
    return "#ef4444"; // Czerwony dla wysokiego bólu
  };

  const handlePainChange = (index: number, value: number[]) => {
    const newSelections = [...selections];
    const newValue = value[0];

    // Get element to animate
    const valueElement = document.getElementById(`pain-value-${muscleTests[index].id}`);
    if (valueElement) {
      // Add animation class and update color
      valueElement.classList.add("animate-pulse", "scale-110");
      valueElement.style.color = getPainColor(newValue);
      // Remove animation after 500ms
      setTimeout(() => {
        valueElement.classList.remove("animate-pulse", "scale-110");
      }, 500);
    }

    newSelections[index] = {
      ...newSelections[index],
      painIntensity: newValue,
    };
    setSelections(newSelections);
  };

  const isFormValid = () => {
    // At least one test should have a pain intensity > 0
    return selections.some((selection) => selection.painIntensity > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Please set pain intensity for at least one test");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Filter out tests with zero pain intensity
      const testsToSubmit = selections.filter((selection) => selection.painIntensity > 0);

      // Redirect to loading view which handles API call and shows skeleton
      const redirectUrl = `/session/generate?bodyPartId=${bodyPartId}&tests=${encodeURIComponent(
        JSON.stringify(testsToSubmit.map((s) => ({ muscle_test_id: s.muscleTestId, pain_intensity: s.painIntensity })))
      )}`;
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {/* General instructions - only once at the top */}
      <div
        style={{
          padding: "15px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
        }}
      >
        <h3 style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "16px" }}>Pain Scale</h3>
        {/* Descriptive labels under the scale */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <span style={{ fontSize: "14px", color: "#10b981" }}>No pain</span>
          <span style={{ fontSize: "14px", color: "#fbbf24" }}>Moderate</span>
          <span style={{ fontSize: "14px", color: "#ef4444" }}>Severe pain</span>
        </div>
        {/* User instructions */}
        <div
          style={{
            padding: "10px",
            backgroundColor: "#fff",
            border: "1px dashed #ccc",
            borderRadius: "4px",
          }}
        >
          <p style={{ marginBottom: "5px", fontWeight: "bold" }}>How to use the slider:</p>
          <ol style={{ paddingLeft: "20px", fontSize: "14px" }}>
            <li>Click and drag the white circle left or right</li>
            <li>Select a value from 0 (no pain) to 10 (unbearable pain)</li>
            <li>Rate each muscle test according to your pain level</li>
          </ol>
        </div>
      </div>

      <div className="space-y-6">
        {muscleTests.map((test, index) => (
          <div key={test.id} className="p-6 border rounded-lg bg-white">
            <h2 className="text-lg font-semibold mb-2">{test.name}</h2>
            <p className="mb-6 text-gray-700">{test.description}</p>

            <div className="space-y-4">
              <div className="flex flex-col space-y-4">
                <label htmlFor={`pain-${test.id}`} className="font-medium text-lg">
                  Poziom bólu:{" "}
                  <span
                    id={`pain-value-${test.id}`}
                    style={{
                      color: getPainColor(selections[index].painIntensity),
                      fontWeight: "bold",
                      fontSize: "24px",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {selections[index].painIntensity}
                  </span>
                </label>

                {/* Uproszczony suwak bez dodatkowych instrukcji */}
                <div>
                  <Slider
                    id={`pain-${test.id}`}
                    min={0}
                    max={10}
                    step={1}
                    value={[selections[index].painIntensity]}
                    onValueChange={(value) => handlePainChange(index, value)}
                    aria-label="Intensywność bólu"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isFormValid()}>
          {isSubmitting ? "Redirecting..." : "Create Session"}
        </Button>
      </div>
    </form>
  );
}
