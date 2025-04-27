import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { loadBodyParts } from "../../lib/services/bodyPartsService";
import type { BodyPartDto } from "../../types";

interface UseBodyPartsOptions {
  baseUrl?: string;
  skipInitialFetch?: boolean;
}

// State and action types for data fetching
interface State {
  data: BodyPartDto[];
  loading: boolean;
  error: string | null;
}
type Action = { type: "FETCH_INIT" } | { type: "FETCH_SUCCESS"; payload: BodyPartDto[] } | { type: "FETCH_FAILURE"; error: string };

function dataFetchReducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "FETCH_FAILURE":
      return { data: [], loading: false, error: action.error };
    default:
      return state;
  }
}

export function useBodyParts({
  baseUrl = typeof window !== "undefined" ? window.location.origin : import.meta.env.PUBLIC_API_BASE,
  skipInitialFetch = false,
}: UseBodyPartsOptions = {}) {
  // AbortController ref for cancelling in-flight requests
  const controllerRef = useRef<AbortController | null>(null);
  // Combine data, loading, and error into one reducer-based state
  const [state, dispatch] = useReducer(dataFetchReducer, {
    data: [],
    loading: !skipInitialFetch,
    error: null,
  });

  const fetchBodyParts = useCallback(async () => {
    // Cancel any previous request
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    dispatch({ type: "FETCH_INIT" });

    try {
      const data = await loadBodyParts(baseUrl, { signal: controller.signal });
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // Silently ignore cancellations
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      dispatch({ type: "FETCH_FAILURE", error: message });
      console.error("useBodyParts error:", error);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (!skipInitialFetch) {
      fetchBodyParts();
    }
    return () => {
      controllerRef.current?.abort();
    };
  }, [fetchBodyParts, skipInitialFetch]);

  // Memoize return values to avoid unnecessary re-renders
  return useMemo(
    () => ({
      bodyParts: state.data,
      loading: state.loading,
      error: state.error,
      refetch: fetchBodyParts,
    }),
    [state.data, state.loading, state.error, fetchBodyParts]
  );
}
