// src/hooks/useBodyParts.ts

import { useFetch } from "@/hooks/useFetch";
import type { BodyPartDto } from "@/types";
import { useCallback } from "react";

interface UseBodyPartsOptions {
  disclaimerAccepted: string | null;
}

export function useBodyParts({ disclaimerAccepted }: UseBodyPartsOptions) {
  const fetcher = useCallback(async (signal: AbortSignal) => {
    const response = await fetch("/api/body_parts", {
      credentials: "include",
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || response.statusText);
    }

    const result = await response.json();

    // Defensive guard to ensure we always return an array
    if (Array.isArray(result.data)) {
      return result.data as BodyPartDto[];
    }

    console.warn("API response for /api/body_parts did not contain a 'data' array.", result);
    return [];
  }, []);

  // THE FIX: Explicitly provide the generic type to useFetch.
  // This ensures the return type is correctly inferred by TypeScript.
  return useFetch<BodyPartDto[]>(fetcher, !disclaimerAccepted);
}
