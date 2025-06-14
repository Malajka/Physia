import { errorResponse } from "@/lib/utils/api";
import { ErrorCode } from "@/types";
import type { ZodSchema } from "zod";

export async function parseAndValidate<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let body: T;
  try {
    body = (await request.json()) as T;
  } catch {
    throw errorResponse(ErrorCode.VALIDATION_FAILED, "Invalid JSON in request body", 400);
  }
  try {
    return schema.parse(body);
  } catch {
    throw errorResponse(ErrorCode.VALIDATION_FAILED, "Request validation failed", 400);
  }
}
