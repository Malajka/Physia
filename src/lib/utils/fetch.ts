// src/lib/utils/fetch.ts

import type { DataArrayResponse, DataResponse, ErrorResponse } from "@/types";

/**
 * Generic JSON fetcher with centralized error handling.
 * This is the core function for all API calls.
 * @param url The endpoint URL.
 * @param init Optional RequestInit object, used to pass headers from SSR.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return null as T;
  }

  let body: T & Partial<ErrorResponse>;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid JSON in response for ${url}. Status: ${response.status}`);
  }

  if (!response.ok) {
    const message = body.error ?? `Failed to fetch ${url} (status ${response.status})`;
    throw new Error(message);
  }

  return body;
}

/**
 * A wrapper for fetchJson that expects an array response.
 */
export async function fetchArray<T>(url: string, init?: RequestInit): Promise<T[]> {
  const result = await fetchJson<T[] | DataArrayResponse<T>>(url, init);
  if (Array.isArray(result)) {
    return result;
  }
  return result?.data ?? [];
}

/**
 * A wrapper for fetchJson that expects a single data item response.
 */
export async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const result = await fetchJson<DataResponse<T>>(url, init);
  return result.data;
}

/**
 * Performs a fetch request with a timeout, aborting if it exceeds the limit.
 * This is the function that was missing.
 * @param url The endpoint URL.
 * @param options The RequestInit options.
 * @param timeoutMs The timeout in milliseconds.
 */
export async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
