// src/lib/services/body-parts.ts

import { fetchMuscleTests } from "../muscle-tests";
import { fetchArray } from "@/lib/utils/fetch";
import { validateBodyPartId, validateBodyPartsDto } from "@/lib/validators/bodyPart.validator";
import type { BodyPartDto, MuscleTestDto } from "@/types";

/**
 * Fetch all available body parts.
 * Now accepts RequestInit to pass headers.
 */
export async function fetchAllBodyParts(origin: string, init?: RequestInit): Promise<BodyPartDto[]> {
  const bodyPartsRaw = await fetchArray<BodyPartDto>(`${origin}/api/body_parts`, init);
  return validateBodyPartsDto(bodyPartsRaw);
}

/**
 * Fetch muscle tests and the corresponding body part name in parallel.
 * Now accepts RequestInit to pass headers to its child calls.
 */
export async function fetchMuscleTestsAndBodyPartName(
  bodyPartIdString: string | undefined,
  origin: string,
  init?: RequestInit
): Promise<{ muscleTests: MuscleTestDto[]; bodyPartName: string }> {
  if (typeof bodyPartIdString === "undefined") {
    throw new Error("A body part ID is required but was not provided in the URL.");
  }
  const bodyPartId = validateBodyPartId(bodyPartIdString);

  const [muscleTests, bodyParts] = await Promise.all([
    fetchMuscleTests(bodyPartId, origin, init), // Pass init
    fetchAllBodyParts(origin, init), // Pass init
  ]);

  const found = bodyParts.find((bodyPart) => bodyPart.id === bodyPartId);
  return { muscleTests, bodyPartName: found?.name ?? "" };
}
