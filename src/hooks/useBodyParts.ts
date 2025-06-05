import { fetchAllBodyParts } from "@/lib/services/body-parts";
import type { BodyPartDto } from "@/types";
import { useCallback, useEffect, useReducer, useRef } from "react";

interface UseBodyPartsOptions {
  baseUrl?: string;
  skipInitialFetch?: boolean;
  disclaimerAccepted?: string | null | undefined;
}

interface BodyPartsState {
  data: BodyPartDto[];
  loading: boolean;
  error: string | null;
}

type BodyPartsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: BodyPartDto[] }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "FETCH_ABORT" }
  | { type: "RESET" };

// Helper functions
const getDefaultBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return import.meta.env.PUBLIC_API_BASE || "";
};

const isValidDisclaimerAccepted = (disclaimerAccepted: string | null | undefined): disclaimerAccepted is string => {
  return typeof disclaimerAccepted === "string" && disclaimerAccepted.length > 0;
};

const isDisclaimerRejected = (disclaimerAccepted: string | null | undefined): boolean => {
  return disclaimerAccepted === null;
};

const shouldInitiallyLoad = (skipInitialFetch: boolean, disclaimerAccepted: string | null | undefined): boolean => {
  return !skipInitialFetch && isValidDisclaimerAccepted(disclaimerAccepted);
};

function bodyPartsReducer(state: BodyPartsState, action: BodyPartsAction): BodyPartsState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { data: [], loading: false, error: action.error };
    case "FETCH_ABORT":
      return { ...state, loading: false };
    case "RESET":
      return { data: [], loading: false, error: null };
    default:
      return state;
  }
}

const createInitialState = (skipInitialFetch: boolean, disclaimerAccepted: string | null | undefined): BodyPartsState => ({
  data: [],
  loading: shouldInitiallyLoad(skipInitialFetch, disclaimerAccepted),
  error: null,
});

export function useBodyParts({ baseUrl = getDefaultBaseUrl(), skipInitialFetch = false, disclaimerAccepted = undefined }: UseBodyPartsOptions = {}) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, dispatch] = useReducer(bodyPartsReducer, createInitialState(skipInitialFetch, disclaimerAccepted));

  const abortPreviousRequest = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const createNewAbortController = useCallback(() => {
    abortPreviousRequest();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  }, [abortPreviousRequest]);

  const fetchBodyParts = useCallback(async (): Promise<void> => {
    // Handle disclaimer rejection
    if (isDisclaimerRejected(disclaimerAccepted)) {
      dispatch({ type: "RESET" });
      return;
    }

    // Validate disclaimer acceptance
    if (!isValidDisclaimerAccepted(disclaimerAccepted)) {
      return;
    }

    const controller = createNewAbortController();
    dispatch({ type: "FETCH_START" });

    try {
      const bodyParts = await fetchAllBodyParts(baseUrl, { signal: controller.signal });

      // Check if request was aborted
      if (controller.signal.aborted) {
        dispatch({ type: "FETCH_ABORT" });
        return;
      }

      dispatch({ type: "FETCH_SUCCESS", payload: bodyParts });
    } catch (error: unknown) {
      // Ignore abort errors
      if (error instanceof DOMException && error.name === "AbortError") {
        dispatch({ type: "FETCH_ABORT" });
        return;
      }

      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch({ type: "FETCH_ERROR", error: errorMessage });
    }
  }, [baseUrl, disclaimerAccepted, createNewAbortController]);

  // Effect for initial fetch and disclaimer changes
  useEffect(() => {
    if (shouldInitiallyLoad(skipInitialFetch, disclaimerAccepted)) {
      fetchBodyParts();
    } else if (isDisclaimerRejected(disclaimerAccepted)) {
      dispatch({ type: "RESET" });
    }

    // Cleanup on unmount
    return () => {
      abortPreviousRequest();
    };
  }, [fetchBodyParts, skipInitialFetch, disclaimerAccepted, abortPreviousRequest]);

  return {
    bodyParts: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchBodyParts,
  } as const;
}
