import type { BodyPartDto } from "@/types";
import { z } from "zod";

export const BodyPartIdSchema = z.coerce
  .number({ invalid_type_error: "bodyPartId must be a number" })
  .int({ message: "bodyPartId must be an integer" })
  .positive({ message: "bodyPartId must be a positive integer" });

export function validateBodyPartId(bodyPartIdString: string): number {
  return BodyPartIdSchema.parse(bodyPartIdString);
}

export const BodyPartDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  created_at: z.string(),
});

export const BodyPartDtoArraySchema = z.array(BodyPartDtoSchema);

export function validateBodyPartsDto(bodyParts: BodyPartDto[]): BodyPartDto[] {
  return BodyPartDtoArraySchema.parse(bodyParts);
}
