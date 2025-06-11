import type { DataArrayResponse, DataResponse, ErrorResponse } from "@/types";

/**
 * Generic JSON fetcher with centralized error handling.
 * Throws if HTTP status is not ok or JSON parsing fails.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
  });
  let body: T & Partial<ErrorResponse>;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid JSON in response from ${url}`);
  }
  if (!response.ok) {
    const message = body.error ?? `Failed to fetch ${url} (status ${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

/**
 * Fetches an endpoint that returns either T[] or { data: T[] } and returns T[].
 */
export async function fetchArray<T>(url: string, signal?: AbortSignal): Promise<T[]> {
  const result = await fetchJson<T[] | DataArrayResponse<T>>(url, {
    signal,
    credentials: "include",
  });
  if (Array.isArray(result)) {
    return result;
  }
  return result.data;
}

/**
 * Fetches an endpoint that returns { data: T } and returns the unwrapped T.
 */
export async function fetchData<T>(url: string, signal?: AbortSignal): Promise<T> {
  const result = await fetchJson<DataResponse<T>>(url, {
    signal,
    credentials: "include",
  });
  return result.data;
}

// Performs a fetch request with a timeout, aborting if it exceeds the limit
export async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      credentials: "include",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
