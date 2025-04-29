import type { AstroGlobal } from "astro";
import type { MuscleTestDto } from "../../types";
import { loadTestsAndName } from "./bodyPartsService";

/**
 * Gathers and returns all data needed for the muscle tests page
 */
export async function getMuscleTestsPageData(Astro: AstroGlobal) {
  const { params, request } = Astro;
  const origin = new URL(request.url).origin;

  let muscleTests: MuscleTestDto[] = [];
  let bodyPartName = "";
  let fetchError: string | null = null;

  try {
    const { muscleTests: tests, bodyPartName: name } = await loadTestsAndName(params.body_part_id ?? "", origin);
    muscleTests = tests;
    bodyPartName = name;
  } catch (e) {
    fetchError = e instanceof Error ? e.message : String(e);
  }

  const bodyPartId = parseInt(params.body_part_id ?? "", 10);
  const pageTitle = bodyPartName ? `Muscle Tests for ${bodyPartName}` : `Muscle Tests for Body Part ${bodyPartId}`;

  const backLink = { href: "/body-parts", label: "← Go back to body parts selection" };

  return { muscleTests, fetchError, pageTitle, bodyPartId, backLink };
}
