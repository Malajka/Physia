import type { ErrorCode } from "@/types";

// Common headers for JSON responses
export const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/**
 * Build a JSON HTTP response with given body and status.
 */
function jsonResponse<T>(body: T, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

/**
 * Generate a JSON error response with given code, message and HTTP status.
 */
export function errorResponse(code: ErrorCode, message: string, status: number) {
  return jsonResponse({ error: { code, message } }, status);
}

/**
 * Generate a JSON success response with data and optional status (default 200).
 */
export function successResponse<T>(data: T, status = 200) {
  return jsonResponse(data, status);
}
