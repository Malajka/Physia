import { z } from "zod";
import type { MuscleTestDto } from "../../types";

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
  const res = await fetch(`${apiBase}/api/body_parts/${bodyPartId}/muscle_tests`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch muscle tests");
  }
  const data = await res.json();
  return MuscleTestDtoSchema.array().parse(data);
}
