import { z } from "zod";
import type { SessionRatingConstraint } from "../db/database.types";

/**
 * Schema for creating a new session
 */
export const createSessionSchema = z.object({
  body_part_id: z.number(),
  pain_intensity: z.number().min(1).max(10),
});

/**
 * Schema for rating a session
 * Enforces the constraint that if rating is not null, rated_at must be provided
 */
export const sessionRatingSchema = z.discriminatedUnion("rating", [
  // When providing a rating, rated_at is required
  z.object({
    rating: z.boolean(),
    rated_at: z.string().datetime(),
  }),
  // When rating is null, rated_at is optional
  z.object({
    rating: z.null(),
    rated_at: z.string().datetime().nullable().optional(),
  }),
]) satisfies z.ZodType<SessionRatingConstraint>;

/**
 * Validation helper to ensure rating constraint is enforced
 */
export function validateSessionRating(data: unknown): SessionRatingConstraint {
  return sessionRatingSchema.parse(data);
}
