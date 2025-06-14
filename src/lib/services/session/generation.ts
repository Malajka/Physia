import { JSON_HEADERS } from "@/lib/utils/api";
import type { CreateSessionCommandDto, SessionDetailDto } from "@/types";

export interface SessionGenerationResult {
  data?: SessionDetailDto;
  error?: string;
  id?: number;
}

/**
 * Starts the session generation process by calling the API.
 * Throws on error, returns session detail data on success.
 */
export async function startSessionGeneration(
  bodyPartId: number,
  tests: { muscle_test_id: number; pain_intensity: number }[]
): Promise<SessionGenerationResult> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    credentials: "include",
    headers: JSON_HEADERS,
    body: JSON.stringify({ body_part_id: bodyPartId, tests } as CreateSessionCommandDto),
  });

  if (response.status === 403) {
    const data = await response.json();
    if (data.error === "disclaimer_required") {
      window.location.href = "/disclaimer";
      return { error: "disclaimer_required" };
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = `Server error: ${response.statusText} ${bodyPartId} ${tests}`;
    if (errorData.error) {
      const errObj = errorData.error as { code?: string; message?: string; details?: { reason?: string } };
      if (typeof errObj.details?.reason === "string") {
        message = errObj.details.reason;
      } else {
        const parts: string[] = [];
        if (errObj.code) parts.push(errObj.code);
        if (errObj.message) parts.push(errObj.message);
        if (parts.length > 0) {
          message = parts.join(": ");
        } else {
          message = JSON.stringify(errObj);
        }
      }
    }
    throw new Error(message);
  }

  const data = await response.json();
  return { data, id: data.id };
}

console.log("OPENROUTER_USE_MOCK:", import.meta.env.OPENROUTER_USE_MOCK);
