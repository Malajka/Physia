import { z } from "zod";

// Schema for validating the Create Session API request body
export const CreateSessionSchema = z.object({
  body_part_id: z.number().int().positive(),
  tests: z
    .array(
      z.object({
        muscle_test_id: z.number().int().positive(),
        pain_intensity: z.number().int().min(0).max(10),
      })
    )
    .nonempty()
    .max(15, "Maximum 15 tests allowed per session"),
});
