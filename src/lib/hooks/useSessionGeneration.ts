import { useState } from "react";
import type { CreateSessionCommandDto, SessionDetailDto } from "../../types";

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

      // Small delay to show initial status
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStatusMessage("Sending data to the AI engine...");

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body_part_id: bodyPartId,
          tests: tests,
        } as CreateSessionCommandDto),
      });

      if (response.status === 403) {
        const data = await response.json();
        if (data.error === "disclaimer_required") {
          window.location.href = "/disclaimer";
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Normalize API error: include code, message, or details.reason
        let message = `Server error: ${response.statusText}`;
        if (errorData.error) {
          const errObj = errorData.error as { code?: string; message?: string; details?: { reason?: string } };
          // Use detailed reason if provided
          if (typeof errObj.details?.reason === "string") {
            message = errObj.details.reason;
          } else {
            // Combine code and message if present
            const parts: string[] = [];
            if (errObj.code) parts.push(errObj.code);
            if (errObj.message) parts.push(errObj.message);
            if (parts.length > 0) {
              message = parts.join(": ");
            } else {
              // Fallback to stringify the whole object
              message = JSON.stringify(errObj);
            }
          }
        }
        throw new Error(message);
      }

      setStatusMessage("Finalizing your personalized training plan...");

      const data = await response.json();
      setSessionDetail(data);

      // Navigate to the session detail page
      if (data.id) {
        window.location.href = `/sessions/${data.id}`;
      } else {
        throw new Error("Invalid session data received");
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
