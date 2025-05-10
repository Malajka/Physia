import { Button } from "@/components/ui/Button";
import type { MuscleTestDto } from "@/types";
import { ChevronLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { MuscleTestItem } from "./MuscleTestItem";

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
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  const handlePainChange = useCallback(
    (index: number, value: number) => {
      setSelections((prev) => {
        const newSelections = [...prev];
        newSelections[index] = { ...newSelections[index], painIntensity: value };
        return newSelections;
      });
      setAnimatingId(muscleTests[index].id);
      setTimeout(() => setAnimatingId(null), 500);
    },
    [muscleTests]
  );

  const isFormValid = useCallback(() => {
    return selections.some((selection) => selection.painIntensity > 0);
  }, [selections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("Please set pain intensity for at least one test");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const testsToSubmit = selections.filter((selection) => selection.painIntensity > 0);
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
      {error && (
        <div aria-live="assertive" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="p-4 border drop-shadow-md border-gray-200 rounded-lg bg-gray-50">
        <h3 className="font-bold mb-2 text-base mb-4">Pain Scale</h3>
        <div className="flex justify-between mb-4">
          <span className="text-sm text-emerald-500 font-bold">No pain</span>
          <span className="text-sm text-yellow-400 font-bold">Moderate</span>
          <span className="text-sm text-red-500 font-bold">Severe pain</span>
        </div>
        <div className="p-2 bg-white border border-dashed border-gray-300 rounded">
          <p className="mb-1 font-bold">How to use the slider:</p>
          <ol className="pl-5 text-sm list-decimal">
            <li>Click and drag the white circle left or right</li>
            <li>Select a value from 0 (no pain) to 10 (unbearable pain)</li>
            <li>Rate each muscle test according to your pain level</li>
          </ol>
        </div>
      </div>
      <div className="space-y-6">
        {muscleTests.map((test, index) => (
          <MuscleTestItem
            key={test.id}
            test={test}
            value={selections[index].painIntensity}
            onChange={(v) => handlePainChange(index, v)}
            animating={animatingId === test.id}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="link" onClick={() => window.history.back()} disabled={isSubmitting} size="lg">
          <ChevronLeft />
          Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid()}
          aria-busy={isSubmitting}
          size="lg"
          className=""
          data-testid="muscle-test-next"
        >
          {isSubmitting ? "Redirecting..." : "Create Session"}
        </Button>
      </div>
    </form>
  );
}
