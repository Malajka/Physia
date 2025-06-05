import { fetchArray } from "@/lib/utils/fetch";
import type { MuscleTestDto } from "@/types";
import { z } from "zod";

const MuscleTestDtoSchema = z.object({
  id: z.number(),
  body_part_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
});

/**
 * Fetches and validates muscle tests for a specific body part
 */
export async function fetchMuscleTests(bodyPartId: number, apiBase: string): Promise<MuscleTestDto[]> {
  // Use fetchArray to handle both raw arrays and { data: T[] } shapes
  const list = await fetchArray<MuscleTestDto>(`${apiBase}/api/body_parts/${bodyPartId}/muscle_tests`);
  // Validate each item against the Zod schema
  return MuscleTestDtoSchema.array().parse(list);
}
