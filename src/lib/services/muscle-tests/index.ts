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

export async function fetchMuscleTests(bodyPartId: number, apiBase: string, init?: RequestInit): Promise<MuscleTestDto[]> {
  const list = await fetchArray<MuscleTestDto>(`${apiBase}/api/body_parts/${bodyPartId}/muscle_tests`, init);
  return MuscleTestDtoSchema.array().parse(list);
}
