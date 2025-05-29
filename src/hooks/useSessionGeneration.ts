import { startSessionGeneration as apiStartSessionGeneration } from "@/lib/services/session/generation"; // Zmieniona nazwa importu dla jasności
import { useCallback, useState, useEffect, useRef } from "react"; // Dodano useRef
import type { SessionDetailDto } from "../../types";

export function useSessionGeneration(bodyPartId: number, tests: { muscle_test_id: number; pain_intensity: number }[]) {
  const [statusMessage, setStatusMessage] = useState("Preparing session data...");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionDetail, setSessionDetail] = useState<SessionDetailDto | null>(null);

  // Ref do śledzenia, czy generowanie zostało już zainicjowane
  // aby uniknąć wielokrotnych wywołań z useEffect w komponencie nadrzędnym,
  // jeśli propsy (bodyPartId, tests) by się nie zmieniały.
  const generationInitiatedRef = useRef(false);

  // Użyj useCallback dla startGeneration
  const startGeneration = useCallback(async () => {
    // Sprawdź, czy parametry są poprawne (to już robisz)
    if (!bodyPartId || !tests?.length) {
      setError("Invalid request parameters");
      setIsLoading(false); // Upewnij się, że isLoading jest resetowane
      return;
    }

    console.log("[useSessionGeneration] startGeneration called. bodyPartId:", bodyPartId, "tests length:", tests.length); // LOG

    setIsLoading(true);
    setError(null);
    // generationInitiatedRef.current = true; // Oznacz, że rozpoczęto

    try {
      setStatusMessage("Initializing session...");
      await new Promise((resolve) => setTimeout(resolve, 500)); // Symulacja opóźnienia
      setStatusMessage("Sending data to the AI engine...");

      // Wywołaj funkcję API
      const result = await apiStartSessionGeneration(bodyPartId, tests); // Użyj zaimportowanej funkcji API

      setStatusMessage("Finalizing your personalized training plan...");
      if (result.data) {
        setSessionDetail(result.data);
        if (result.id) {
          console.log(`[useSessionGeneration] Generation successful. Redirecting to /sessions/${result.id}`); // LOG
          window.location.href = `/sessions/${result.id}`;
        } else {
          console.error("[useSessionGeneration] Invalid session data received (missing ID)"); // LOG
          throw new Error("Invalid session data received (missing ID)");
        }
      } else if (result.error && result.error !== "disclaimer_required") {
        // Jak omawialiśmy, apiStartSessionGeneration rzuca błędy,
        // więc ten blok jest mniej prawdopodobny do osiągnięcia,
        // chyba że apiStartSessionGeneration zostanie zmodyfikowane, aby zwracać obiekt błędu.
        console.error(`[useSessionGeneration] Error from apiStartSessionGeneration (via result.error): ${result.error}`); // LOG
        throw new Error(result.error);
      }
      // Jeśli result.error to "disclaimer_required", przekierowanie nastąpiło już w apiStartSessionGeneration.
    } catch (err) {
      console.error("[useSessionGeneration] Exception caught during generation:", err); // LOG
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  // Zależności dla useCallback:
  // `bodyPartId` i `tests` są propsami hooka. Jeśli się zmienią,
  // `startGeneration` powinno zostać utworzone na nowo, co jest poprawne.
  // UWAGA: Jeśli `tests` jest obiektem/tablicą przekazywaną jako prop,
  // upewnij się, że komponent nadrzędny nie tworzy nowej referencji `tests` przy każdym renderze,
  // bo to unieważni memoizację useCallback. Rozważ `useMemo` dla `tests` w komponencie nadrzędnym
  // lub użyj stabilnej wartości (np. JSON.stringify(tests)) jako zależności, jeśli to konieczne.
  // Na razie zakładamy, że `bodyPartId` i `tests` są stabilne lub ich zmiana ma oznaczać nową generację.
  }, [bodyPartId, tests]);


  const retry = useCallback(async () => {
    console.log("[useSessionGeneration] Retry called."); // LOG
    // generationInitiatedRef.current = false; // Pozwól na ponowne uruchomienie przez useEffect w SessionGenerationLoading
    // LUB bezpośrednie wywołanie:
    await startGeneration();
  }, [startGeneration]); // Zależy od zmemoizowanej `startGeneration`


  // Ten useEffect w hooku może teraz kontrolować inicjalne wywołanie,
  // zamiast polegać tylko na useEffect w SessionGenerationLoading.
  useEffect(() => {
    // Wywołaj tylko raz, jeśli nie zostało jeszcze zainicjowane i parametry są OK.
    if (!generationInitiatedRef.current && bodyPartId && tests?.length) {
      console.log("[useSessionGeneration useEffect] Initial generation triggered from within the hook."); // LOG
      startGeneration();
      generationInitiatedRef.current = true; // Oznacz, że zainicjowano
    }
  // Zależności: stabilna funkcja startGeneration oraz propsy.
  // Jeśli bodyPartId lub tests się zmienią (np. użytkownik wróci i wybierze inne),
  // chcemy pozwolić na ponowne uruchomienie.
  }, [startGeneration, bodyPartId, tests]);


  return { statusMessage, error, retry, isLoading, sessionDetail, startGeneration };
}
