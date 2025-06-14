import type { AcceptDisclaimerResponseDto, DisclaimersContentDto } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useDisclaimer() {
  const [disclaimerText, setDisclaimerText] = useState<string>("");
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDisclaimer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/disclaimers", { credentials: "include" });

      if (!res.ok) {
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
    try {
      const res = await fetch("/api/disclaimers", { method: "POST", credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || res.statusText);
      }
      const data = (await res.json()) as AcceptDisclaimerResponseDto;
      setAcceptedAt(data.accepted_at);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return { disclaimerText, acceptedAt, loading, error, accept };
}
