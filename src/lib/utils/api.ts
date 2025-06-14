import type { ErrorCode } from "@/types";

export const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function jsonResponse<T>(body: T, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

export function errorResponse(code: ErrorCode, message: string, status: number) {
  return jsonResponse({ error: { code, message } }, status);
}

export function successResponse<T>(data: T, status = 200) {
  return jsonResponse(data, status);
}
