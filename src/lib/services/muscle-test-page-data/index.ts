import { fetchMuscleTestsAndBodyPartName } from "@/lib/services/body-parts";
import { getPageTitle } from "@/lib/utils/getPageTitle";
import { validateBodyPartId } from "@/lib/validators/bodyPart.validator";
import type { MuscleTestDto } from "@/types";
import type { AstroGlobal } from "astro";

// Move interface here for better visibility
export interface MuscleTestsPageData {
  muscleTests: MuscleTestDto[];
  fetchError: string | null;
  pageTitle: string;
  bodyPartId: number;
  backLink: { href: string; label: string };
}

/**
 * Gathers and returns all data needed for the muscle tests page
 */
export async function getMuscleTestsPageData({ params, request }: AstroGlobal): Promise<MuscleTestsPageData> {
  // Parse and validate bodyPartId from route params
  const rawId = params.body_part_id ?? "";
  const bodyPartId = validateBodyPartId(rawId);
  const origin = new URL(request.url).origin;
  const backLink = { href: "/body-parts", label: "← Go back to body parts selection" };

  try {
    const { muscleTests, bodyPartName } = await fetchMuscleTestsAndBodyPartName(rawId, origin);
    const pageTitle = getPageTitle(bodyPartName, bodyPartId);

    return { muscleTests, fetchError: null, pageTitle, bodyPartId, backLink };
  } catch (error) {
    const fetchError = error instanceof Error ? error.message : String(error);
    const pageTitle = getPageTitle("", bodyPartId);

    return { muscleTests: [], fetchError, pageTitle, bodyPartId, backLink };
  }
}
