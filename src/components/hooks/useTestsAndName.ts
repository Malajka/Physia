import { fetchMuscleTestsAndBodyPartName } from "@/lib/services/body-parts";
import { useEffect, useState } from "react";
import type { MuscleTestDto } from "../../types";

interface TestsAndName {
  tests: MuscleTestDto[];
  name: string;
}

interface UseTestsAndNameResult {
  data: TestsAndName | null;
  isLoading: boolean;
  error: string | null;
}

export function useTestsAndName(bodyPartId: number, origin: string): UseTestsAndNameResult {
  const [data, setData] = useState<TestsAndName | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchMuscleTestsAndBodyPartName(String(bodyPartId), origin)
      .then(({ muscleTests, bodyPartName }) => {
        if (!isMounted) return;
        setData({ tests: muscleTests, name: bodyPartName });
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bodyPartId, origin]);

  return { data, isLoading, error };
}
