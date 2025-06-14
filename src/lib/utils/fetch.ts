import type { DataArrayResponse, DataResponse, ErrorResponse } from "@/types";

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

export async function fetchArray<T>(url: string, init?: RequestInit): Promise<T[]> {
  const result = await fetchJson<T[] | DataArrayResponse<T>>(url, init);
  if (Array.isArray(result)) {
    return result;
  }
  return result?.data ?? [];
}

export async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const result = await fetchJson<DataResponse<T>>(url, init);
  return result.data;
}

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
