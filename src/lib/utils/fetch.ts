/**
 * Fetches a JSON endpoint that returns either an array or an object with a data array.
 * @param url - The endpoint URL to fetch
 * @param signal - Optional AbortSignal to cancel the request
 * @returns A promise resolving to an array of type T
 * @throws Error if the response is not ok
 */

// Define a standard error response shape
interface ErrorResponse {
  error: string;
}

import type { DataArrayResponse } from "@/types";

/**
 * Generic JSON fetcher with centralized error handling.
 * Throws if HTTP status is not ok or JSON parsing fails.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  // Parse JSON body
  let body: T & Partial<ErrorResponse>;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid JSON in response from ${url}`);
  }
  // Handle HTTP errors
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
  const result = await fetchJson<T[] | DataArrayResponse<T>>(url, { signal });
  // If the result is directly an array, return it.
  if (Array.isArray(result)) {
    return result;
  }
  // Else expect { data: T[] }
  return result.data;
}
