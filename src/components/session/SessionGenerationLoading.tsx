import { Button, Skeleton, Spinner } from "@/components/ui";
import { useSessionGeneration } from "@/hooks/useSessionGeneration";

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
  const { statusMessage, error, retry, isLoading } = useSessionGeneration(bodyPartId, tests);

  if (!bodyPartId || !tests || tests.length === 0) {
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
