import { startSessionGeneration } from "@/lib/services/session/generation";
import { useState } from "react";
import type { SessionDetailDto } from "../../types";

export function useSessionGeneration(bodyPartId: number, tests: { muscle_test_id: number; pain_intensity: number }[]) {
  const [statusMessage, setStatusMessage] = useState("Preparing session data...");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionDetail, setSessionDetail] = useState<SessionDetailDto | null>(null);

  async function startGeneration() {
    if (!bodyPartId || !tests?.length) {
      setError("Invalid request parameters");
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
      if (result.data) {
        setSessionDetail(result.data);
        if (result.id) {
          window.location.href = `/sessions/${result.id}`;
        } else {
          throw new Error("Invalid session data received");
        }
      } else if (result.error && result.error !== "disclaimer_required") {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Session generation error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const retry = () => {
    startGeneration();
  };

  return { statusMessage, error, retry, isLoading, sessionDetail, startGeneration };
}
