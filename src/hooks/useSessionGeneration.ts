import { startSessionGeneration } from "@/lib/services/session/generation";
import type { SessionDetailDto } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSessionGenerationParams {
  bodyPartId: number;
  tests: { muscle_test_id: number; pain_intensity: number }[];
}

export function useSessionGeneration(bodyPartId: number, tests: { muscle_test_id: number; pain_intensity: number }[]) {
  const [statusMessage, setStatusMessage] = useState("Preparing session data...");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionDetail, setSessionDetail] = useState<SessionDetailDto | null>(null);

  const generationInitiatedRef = useRef(false);

  const startGeneration = useCallback(async () => {
    if (!bodyPartId || !tests?.length) {
      setError("Invalid request parameters");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setStatusMessage("Initializing session...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStatusMessage("Sending data to the AI engine...");
      const result = await startSessionGeneration(bodyPartId, tests);

      setStatusMessage("Finalizing your personalized training plan...");

      if (!result.data) {
        throw new Error("No session data received");
      }

      if (!result.id) {
        throw new Error("Invalid session data received (missing ID)");
      }

      setSessionDetail(result.data);

      window.location.href = `/sessions/${result.id}`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [bodyPartId, tests]);

  const retry = useCallback(async () => {
    generationInitiatedRef.current = false;
    await startGeneration();
  }, [startGeneration]);

  useEffect(() => {
    if (generationInitiatedRef.current) {
      return;
    }

    if (!bodyPartId || !tests?.length) {
      return;
    }

    generationInitiatedRef.current = true;
    startGeneration();
  }, [bodyPartId, tests, startGeneration]);

  return {
    statusMessage,
    error,
    retry,
    isLoading,
    sessionDetail,
    startGeneration,
  };
}
