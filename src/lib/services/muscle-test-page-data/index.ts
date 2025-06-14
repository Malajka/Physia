import type { APIContext } from "astro";
import { fetchMuscleTestsAndBodyPartName } from "../body-parts/index";

export async function getMuscleTestsPageData(astroContext: APIContext) {
  const { params, request, url } = astroContext;
  const bodyPartId = params.body_part_id;

  const cookie = request.headers.get("cookie");

  const fetchOptions: RequestInit = {
    headers: {
      ...(cookie ? { cookie } : {}),
    },
  };

  try {
    const { muscleTests, bodyPartName } = await fetchMuscleTestsAndBodyPartName(bodyPartId, url.origin, fetchOptions);

    return {
      muscleTests,
      pageTitle: `Muscle Tests for ${bodyPartName}`,
      bodyPartId: Number(bodyPartId),
      fetchError: null,
      backLink: { href: "/body-parts", text: "← Go back to Body Part Selection" },
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      muscleTests: [],
      pageTitle: "Error",
      bodyPartId: Number(bodyPartId),
      fetchError: [errorMessage],
      backLink: { href: "/body-parts", text: "← Go back to Body Part Selection" },
    };
  }
}
