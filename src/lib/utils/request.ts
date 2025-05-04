import { errorResponse } from "@/lib/utils/api";
import { validateBody } from "@/lib/validators/session.validator";
import { ErrorCode } from "@/types";
import type { ZodSchema } from "zod";

/**
 * Parse the JSON body of the request and validate against a Zod schema.
 */
export async function parseAndValidate<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw errorResponse(ErrorCode.VALIDATION_FAILED, "Invalid JSON in request body", 400);
  }
  try {
    return validateBody(schema, body);
  } catch {
    throw errorResponse(ErrorCode.VALIDATION_FAILED, "Request validation failed", 400);
  }
}
