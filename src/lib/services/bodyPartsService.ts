import { z } from "zod";
import type { BodyPartDto, MuscleTestDto } from "../../types";

// Schema to validate and coerce the bodyPartId parameter
const idSchema = z.coerce.number().min(1);

/**
 * Fetches muscle tests for a given body part ID, with validation.
 */
export async function loadMuscleTests(bodyPartIdParam: string, origin: string): Promise<MuscleTestDto[]> {
  const bodyPartId = idSchema.parse(bodyPartIdParam);
  const res = await fetch(`${origin}/api/body_parts/${bodyPartId}/muscle_tests`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch muscle tests");
  }
  return res.json();
}

/**
 * Fetches all body parts and returns an array, with optional signal for aborting.
 */
export async function loadBodyParts(origin: string, options?: { signal?: AbortSignal }): Promise<BodyPartDto[]> {
  const res = await fetch(`${origin}/api/body_parts`, {
    signal: options?.signal,
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

/**
 * Fetches muscle tests and the name of the body part in parallel.
 */
export async function loadTestsAndName(bodyPartIdParam: string, origin: string): Promise<{ muscleTests: MuscleTestDto[]; bodyPartName: string }> {
  const bodyPartId = idSchema.parse(bodyPartIdParam);
  const [tests, parts] = await Promise.all([loadMuscleTests(bodyPartIdParam, origin), loadBodyParts(origin)]);

  const found = parts.find((bp) => bp.id === bodyPartId);
  return { muscleTests: tests, bodyPartName: found?.name || "" };
}
