import { z } from "zod";

export const CreateSessionSchema = z.object({
  body_part_id: z.number().int().positive(),
  tests: z
    .array(
      z.object({
        muscle_test_id: z.number().int().positive(),
        pain_intensity: z.number().int().min(0).max(10),
      })
    )
    .nonempty(),
});
