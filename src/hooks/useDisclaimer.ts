// src/hooks/useDisclaimer.ts

import type { AcceptDisclaimerResponseDto, DisclaimersContentDto } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useDisclaimer() {
  const [disclaimerText, setDisclaimerText] = useState<string>("");
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDisclaimer = useCallback(async () => {
    // Reset state for re-fetches
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/disclaimers", { credentials: "include" });

      // --- THE FIX IS HERE ---
      // Instead of throwing based on statusText, we parse the body for a detailed error.
      if (!res.ok) {
        // Try to parse the JSON error body our middleware sends.
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || res.statusText);
      }

      const data = (await res.json()) as DisclaimersContentDto & { accepted_at?: string | null };
      setDisclaimerText(data.text);
      setAcceptedAt(data.accepted_at ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisclaimer();
  }, [loadDisclaimer]);

  const accept = useCallback(async () => {
    // Apply the same robust error handling to the accept function.
    try {
      const res = await fetch("/api/disclaimers", { method: "POST", credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || res.statusText);
      }
      const data = (await res.json()) as AcceptDisclaimerResponseDto;
      setAcceptedAt(data.accepted_at);
      // After successful acceptance, we might want to reload other data.
      // For now, just setting the state is fine.
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return { disclaimerText, acceptedAt, loading, error, accept };
}
