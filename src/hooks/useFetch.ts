import { useCallback, useEffect, useReducer, useRef } from "react";

// Generic state and actions for fetching
export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
export type FetchAction<T> = { type: "INIT" } | { type: "SUCCESS"; payload: T } | { type: "FAILURE"; error: string };

function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
  switch (action.type) {
    case "INIT":
      return { ...state, loading: true, error: null };
    case "SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "FAILURE":
      return { data: null, loading: false, error: action.error };
    default:
      return state;
  }
}

/**
 * useFetch provides generic data fetching with AbortController support.
 * @param fetcher - function that performs async work using the AbortSignal
 * @param skipInitialFetch - if true, the fetch will not run on mount
 */
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, skipInitialFetch = false) {
  const controllerRef = useRef<AbortController | null>(null);
  const initialState: FetchState<T> = { data: null, loading: !skipInitialFetch, error: null };
  // Let TypeScript infer the reducer types: state and action
  const [state, dispatch] = useReducer(fetchReducer, initialState);

  const execute = useCallback(async () => {
    // abort any ongoing request
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    dispatch({ type: "INIT" });
    try {
      const result = await fetcher(controller.signal);
      dispatch({ type: "SUCCESS", payload: result });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // request was cancelled
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      dispatch({ type: "FAILURE", error: message });
    }
  }, [fetcher]);

  useEffect(() => {
    if (!skipInitialFetch) {
      execute();
    }
    return () => {
      controllerRef.current?.abort();
    };
  }, [execute, skipInitialFetch]);

  return { data: state.data, loading: state.loading, error: state.error, refetch: execute };
}
