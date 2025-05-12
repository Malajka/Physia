import { fetchAllBodyParts } from "@/lib/services/body-parts";
import type { BodyPartDto } from "@/types";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

interface UseBodyPartsOptions {
  baseUrl?: string;
  skipInitialFetch?: boolean;
  disclaimerAccepted?: string | null | undefined;
}

interface State {
  data: BodyPartDto[];
  loading: boolean;
  error: string | null;
}
type Action =
  | { type: "FETCH_INIT" }
  | { type: "FETCH_SUCCESS"; payload: BodyPartDto[] }
  | { type: "FETCH_FAILURE"; error: string }
  | { type: "RESET_DATA" };

function dataFetchReducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "FETCH_FAILURE":
      return { data: [], loading: false, error: action.error };
    case "RESET_DATA":
      return { data: [], loading: false, error: null };
    default:
      return state;
  }
}

export function useBodyParts({
  baseUrl = typeof window !== "undefined" ? window.location.origin : import.meta.env.PUBLIC_API_BASE,
  skipInitialFetch = false,
  disclaimerAccepted = undefined,
}: UseBodyPartsOptions = {}) {
  const controllerRef = useRef<AbortController | null>(null);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    data: [],
    loading: !skipInitialFetch && disclaimerAccepted !== null && disclaimerAccepted !== undefined,
    error: null,
  });

  const fetchBodyParts = useCallback(async () => {
    if (disclaimerAccepted === null) {
      dispatch({ type: "RESET_DATA" });
      return;
    }
    if (typeof disclaimerAccepted !== 'string') {
        return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    dispatch({ type: "FETCH_INIT" });

    try {
      const result = await fetchAllBodyParts(baseUrl, { signal: controller.signal });
      dispatch({ type: "FETCH_SUCCESS", payload: result });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      dispatch({ type: "FETCH_FAILURE", error: message });
    }
  }, [baseUrl, disclaimerAccepted]);

  useEffect(() => {
    if (!skipInitialFetch && typeof disclaimerAccepted === 'string') {
      fetchBodyParts();
    } else if (disclaimerAccepted === null) {
      dispatch({ type: "RESET_DATA" });
    }
  
    return () => {
      controllerRef.current?.abort();
    };
  }, [fetchBodyParts, skipInitialFetch, disclaimerAccepted]);

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