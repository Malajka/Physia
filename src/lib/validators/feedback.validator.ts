import { validateBody } from "@/lib/validators/session.validator";
import { z, type ZodSchema } from "zod";

// Schema for validating session_id route parameter
export const FeedbackParamsSchema = z.object({
  session_id: z.coerce.number().int().positive({ message: "session_id must be a positive integer" }),
});

// Schema for parsing and validating feedback payload
export const FeedbackBodySchema = z.object({
  rating: z.number().int().min(0).max(1),
});

/**
 * Validates unknown data against the given Zod schema.
 * Throws a ZodError if validation fails.
 */
export function validateParams<T>(schema: ZodSchema<T>, data: unknown): T {
  return validateBody(schema, data);
}
