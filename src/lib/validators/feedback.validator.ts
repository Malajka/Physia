import { z } from "zod";

// Schema for validating session_id route parameter
export const FeedbackParamsSchema = z.object({
  session_id: z.coerce
    .number({ invalid_type_error: "session_id must be a number" })
    .int({ message: "session_id must be an integer" })
    .positive({ message: "session_id must be a positive integer" }),
});

// Schema for parsing and validating feedback payload
export const FeedbackBodySchema = z.object({
  rating: z.number().int().min(0).max(1),
});
