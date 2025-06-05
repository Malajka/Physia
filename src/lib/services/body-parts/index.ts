import { fetchMuscleTests } from "@/lib/services/muscle-tests";
import { fetchArray } from "@/lib/utils/fetch";
import { validateBodyPartId, validateBodyPartsDto } from "@/lib/validators/bodyPart.validator";
import type { BodyPartDto, MuscleTestDto } from "@/types";

/**
 * Fetch all available body parts.
 */
export async function fetchAllBodyParts(origin: string, { signal }: { signal?: AbortSignal } = {}): Promise<BodyPartDto[]> {
  // Fetch raw body parts data and validate shape
  const bodyPartsRaw = await fetchArray<BodyPartDto>(`${origin}/api/body_parts`, signal);
  return validateBodyPartsDto(bodyPartsRaw);
}

/**
 * Fetch muscle tests and the corresponding body part name in parallel.
 */
export async function fetchMuscleTestsAndBodyPartName(
  bodyPartIdString: string,
  origin: string
): Promise<{ muscleTests: MuscleTestDto[]; bodyPartName: string }> {
  const bodyPartId = validateBodyPartId(bodyPartIdString);
  const [muscleTests, bodyParts] = await Promise.all([fetchMuscleTests(bodyPartId, origin), fetchAllBodyParts(origin)]);
  const found = bodyParts.find((bodyPart) => bodyPart.id === bodyPartId);
  return { muscleTests, bodyPartName: found?.name ?? "" };
}
