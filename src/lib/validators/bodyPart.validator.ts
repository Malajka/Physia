import type { BodyPartDto } from "@/types";
import { z } from "zod";

// Shared schema for validating a positive integer bodyPartId
export const BodyPartIdSchema = z.coerce
  .number({ invalid_type_error: "bodyPartId must be a number" })
  .int({ message: "bodyPartId must be an integer" })
  .positive({ message: "bodyPartId must be a positive integer" });

// Function to validate and parse a raw string into a valid bodyPartId
export function validateBodyPartId(bodyPartIdString: string): number {
  return BodyPartIdSchema.parse(bodyPartIdString);
}

// Zod schema for validating a single BodyPartDto object
export const BodyPartDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  created_at: z.string(),
});

// Zod schema for validating an array of BodyPartDto objects
export const BodyPartDtoArraySchema = z.array(BodyPartDtoSchema);

/**
 * Validates and parses a raw response into an array of BodyPartDto objects.
 */
export function validateBodyPartsDto(bodyParts: unknown): BodyPartDto[] {
  return BodyPartDtoArraySchema.parse(bodyParts);
} 