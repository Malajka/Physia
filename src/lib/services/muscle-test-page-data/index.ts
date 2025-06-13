// src/lib/services/muscle-test-page-data.ts

import type { APIContext } from "astro";
import { fetchMuscleTestsAndBodyPartName } from "../body-parts";

/**
 * Fetches all necessary data for the muscle tests page, handling authentication
 * context for server-side rendering.
 * @param astroContext The global Astro object from the page.
 */
export async function getMuscleTestsPageData(astroContext: APIContext) {
  const { params, request, url } = astroContext;
  const bodyPartId = params.body_part_id;

  // THE FIX: Extract the 'cookie' header from the incoming browser request.
  const cookie = request.headers.get("cookie");

  // Create the `init` object for server-side fetch calls.
  const fetchOptions: RequestInit = {
    headers: {
      // Conditionally add the cookie header if it exists.
      ...(cookie ? { cookie } : {}),
    },
  };

  try {
    const { muscleTests, bodyPartName } = await fetchMuscleTestsAndBodyPartName(
      bodyPartId,
      url.origin, // Dynamically get the base URL
      fetchOptions // Pass the authentication headers down
    );

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
