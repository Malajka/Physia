import { fetchArray } from "@/lib/utils/fetch";
import { validateBodyPartId, validateBodyPartsDto } from "@/lib/validators/bodyPart.validator";
import type { BodyPartDto, MuscleTestDto } from "@/types";
import { fetchMuscleTests } from "../muscle-tests";

export async function fetchAllBodyParts(origin: string, init?: RequestInit): Promise<BodyPartDto[]> {
  const bodyPartsRaw = await fetchArray<BodyPartDto>(`${origin}/api/body_parts`, init);
  return validateBodyPartsDto(bodyPartsRaw);
}

export async function fetchMuscleTestsAndBodyPartName(
  bodyPartIdString: string | undefined,
  origin: string,
  init?: RequestInit
): Promise<{ muscleTests: MuscleTestDto[]; bodyPartName: string }> {
  if (typeof bodyPartIdString === "undefined") {
    throw new Error("A body part ID is required but was not provided in the URL.");
  }
  const bodyPartId = validateBodyPartId(bodyPartIdString);

  const [muscleTests, bodyParts] = await Promise.all([fetchMuscleTests(bodyPartId, origin, init), fetchAllBodyParts(origin, init)]);

  const found = bodyParts.find((bodyPart) => bodyPart.id === bodyPartId);
  return { muscleTests, bodyPartName: found?.name ?? "" };
}
