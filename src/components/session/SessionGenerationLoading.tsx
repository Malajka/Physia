import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useSessionGeneration } from "@/lib/hooks/useSessionGeneration"; // Adjust path if needed
import { useEffect } from "react";

interface SessionGenerationLoadingProps {
  bodyPartId: number;
  tests: { muscle_test_id: number; pain_intensity: number }[];
}

interface ErrorDisplayProps {
  error: string;
  retry: () => void;
}

function ErrorDisplay({ error, retry }: ErrorDisplayProps) {
  return (
    <div className="text-center">
      <div className="text-red-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-4">Generation Failed</h2>
      <p className="mb-6">{error}</p>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Button onClick={retry}>Try Again</Button>
        <Button variant="outline" asChild>
          <a href="/body-parts">Go Back</a>
        </Button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div className="mb-8">
        <Spinner className="w-12 h-12" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="col-span-full">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3 mt-1" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-16 w-full mb-3" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function InvalidRequestDisplay() {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Invalid Request</h2>
      <p className="mb-6">Missing required parameters to generate your training plan.</p>
      <Button asChild>
        <a href="/body-parts">← Go back to body parts selection</a>
      </Button>
    </div>
  );
}

export function SessionGenerationLoading({ bodyPartId, tests }: SessionGenerationLoadingProps) {
  const { statusMessage, error, retry, isLoading, startGeneration } = useSessionGeneration(bodyPartId, tests);

  // The useSessionGeneration hook now handles its own initial start via its internal useEffect and ref.
  // This useEffect is kept to ensure that if `startGeneration` function reference *itself* changes
  // (which it shouldn't often, due to useCallback, unless its dependencies bodyPartId/tests change),
  // or if `bodyPartId` or `tests` props change, we re-initiate.
  // However, the primary gate for initial start is now within useSessionGeneration's own useEffect.
  useEffect(() => {
    // This call might be redundant if useSessionGeneration's internal useEffect always triggers first.
    // However, it acts as a safeguard or can be used if you want the component to explicitly
    // control the "start" signal based on its own lifecycle or prop changes,
    // and useSessionGeneration's internal useEffect is removed or modified.
    // For now, with the internal useEffect in useSessionGeneration, this specific call might
    // try to call startGeneration when generationInitiatedRef.current is already true.
    // The `startGeneration` (exposed from the hook) could be a wrapper that checks the ref
    // or the internal useEffect in the hook is the sole initiator.
    // Let's simplify: if the hook manages its own start, this component doesn't need to call it explicitly.
    // console.log("[SessionGenerationLoading useEffect] Component mounted/updated. Props:", { bodyPartId, testsLength: tests?.length });
    // If `startGeneration` is memoized and its deps `bodyPartId`, `tests` are stable, this runs once.
    // The hook's internal useEffect is now the primary initiator.
    // This useEffect can be removed if the hook's internal useEffect is sufficient.
    // Or, it can be kept if you want to re-trigger if `bodyPartId` or `tests` props change *after* initial mount.

    // If the hook itself doesn't auto-start, then this is needed:
    // if (bodyPartId && tests?.length) {
    //   startGeneration();
    // }
  }, [startGeneration, bodyPartId, tests]); // Re-run if these props/functions change

  if (!bodyPartId || !tests || tests.length === 0) { // Added null check for tests
    return <InvalidRequestDisplay />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6">Generating Your Training Plan</h1>
      {isLoading ? (
        <>
          <p role="status" aria-live="polite" className="text-lg text-center mb-8 max-w-md">
            {statusMessage}
          </p>
          <LoadingSkeleton />
        </>
      ) : error ? (
        <ErrorDisplay error={error} retry={retry} />
      ) : null}
    </div>
  );
}
