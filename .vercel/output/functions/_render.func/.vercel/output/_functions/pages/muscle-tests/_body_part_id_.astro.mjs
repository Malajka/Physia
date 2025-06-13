/* empty css                                         */
import {
  c as createComponent,
  a as createAstro,
  m as maybeRenderHead,
  d as addAttribute,
  r as renderTemplate,
  b as renderComponent,
} from "../../chunks/astro/server_B181Abhk.mjs";
import "kleur/colors";
import { $ as $$PageHeader } from "../../chunks/PageHeader_C4VDrmFR.mjs";
import { jsxs, jsx } from "react/jsx-runtime";
import { b as Slider, B as Button, $ as $$Layout, E as ErrorAlert } from "../../chunks/Layout_DXvctC9J.mjs";
import { useState, useCallback } from "react";
import "clsx";
import { ChevronLeft } from "lucide-react";
import { z } from "zod";
export { renderers } from "../../renderers.mjs";

async function fetchJson(url, init) {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (response.status === 204) {
    return null;
  }
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid JSON in response for ${url}. Status: ${response.status}`);
  }
  if (!response.ok) {
    const message = body.error ?? `Failed to fetch ${url} (status ${response.status})`;
    throw new Error(message);
  }
  return body;
}
async function fetchArray(url, init) {
  const result = await fetchJson(url, init);
  if (Array.isArray(result)) {
    return result;
  }
  return result?.data ?? [];
}

function formatDescriptionText(description) {
  if (!description) {
    return { steps: [], info: [], warnings: [], notes: [] };
  }
  const steps = [];
  const info = [];
  const warnings = [];
  const notes = [];
  const sections = description.split(/###/).filter((section) => section.trim().length > 0);
  sections.forEach((section) => {
    const lines = section
      .trim()
      .split("\n")
      .filter((line) => line.trim().length > 0);
    if (lines.length === 0) return;
    const sectionType = lines[0].toLowerCase().trim();
    const content = lines.slice(1);
    if (!["steps", "info", "warning", "note", "instructions", "expect", "important", "remember"].includes(sectionType)) {
      const allLines = [lines[0], ...content];
      allLines.forEach((line) => {
        const cleanLine = line.trim();
        if (cleanLine.length > 0) {
          info.push(cleanLine);
        }
      });
      return;
    }
    content.forEach((line) => {
      const cleanLine = line.trim();
      if (cleanLine.length === 0) return;
      const processedLine = cleanLine.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "");
      switch (sectionType) {
        case "steps":
        case "instructions":
          steps.push(processedLine);
          break;
        case "info":
        case "expect":
          info.push(processedLine);
          break;
        case "warning":
        case "important":
          warnings.push(processedLine);
          break;
        case "note":
        case "remember":
          notes.push(processedLine);
          break;
      }
    });
  });
  if (steps.length === 0 && info.length === 0 && warnings.length === 0 && notes.length === 0) {
    const lines = description.split("\n").filter((line) => line.trim().length > 0);
    lines.forEach((line) => {
      const cleanLine = line
        .trim()
        .replace(/^[-*•]\s*/, "")
        .replace(/^\d+\.\s*/, "");
      if (cleanLine.length > 0) {
        info.push(cleanLine);
      }
    });
  }
  return { steps, info, warnings, notes };
}
function MuscleTestItem({ test, value, onChange, animating }) {
  const getPainColor = (v) => {
    if (v <= 3) return "#10b981";
    if (v <= 6) return "#fbbf24";
    return "#ef4444";
  };
  const { steps, info, warnings, notes } = formatDescriptionText(test.description);
  return /* @__PURE__ */ jsxs("div", {
    className: "p-6 border drop-shadow-md rounded-lg bg-white",
    children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-3", "data-testid": `muscle-test-heading-${test.id}`, children: test.name }),
      /* @__PURE__ */ jsxs("div", {
        className: "mb-6 space-y-4",
        children: [
          steps.length > 0 &&
            /* @__PURE__ */ jsxs("div", {
              children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide", children: "Instructions" }),
                /* @__PURE__ */ jsx("ol", {
                  className: "space-y-3",
                  children: steps.map((step, index) =>
                    /* @__PURE__ */ jsxs(
                      "li",
                      {
                        className: "flex items-start space-x-3",
                        children: [
                          /* @__PURE__ */ jsx("span", {
                            className:
                              "flex-shrink-0 w-7 h-7 bg-gradient-to-br from-[var(--primary)] to-[#16857f] text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5",
                            children: index + 1,
                          }),
                          /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-sm leading-relaxed pt-1", children: step }),
                        ],
                      },
                      index
                    )
                  ),
                }),
              ],
            }),
          warnings.length > 0 &&
            /* @__PURE__ */ jsx("div", {
              className: "bg-red-50 border-l-4 border-red-400 p-4 rounded-r",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex items-start",
                children: [
                  /* @__PURE__ */ jsx("div", {
                    className: "flex-shrink-0",
                    children: /* @__PURE__ */ jsx("svg", {
                      className: "h-5 w-5 text-red-400",
                      fill: "currentColor",
                      viewBox: "0 0 20 20",
                      children: /* @__PURE__ */ jsx("path", {
                        fillRule: "evenodd",
                        d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
                        clipRule: "evenodd",
                      }),
                    }),
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "ml-3",
                    children: [
                      /* @__PURE__ */ jsx("h4", {
                        className: "text-sm font-medium text-red-800 uppercase tracking-wide mb-2",
                        children: "Important",
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className: "text-sm text-red-700 space-y-1",
                        children: warnings.map((warning, index) => /* @__PURE__ */ jsx("p", { children: warning }, index)),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          info.length > 0 &&
            /* @__PURE__ */ jsx("div", {
              className: "bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex items-start",
                children: [
                  /* @__PURE__ */ jsx("div", {
                    className: "flex-shrink-0",
                    children: /* @__PURE__ */ jsx("svg", {
                      className: "h-5 w-5 text-blue-400",
                      fill: "currentColor",
                      viewBox: "0 0 20 20",
                      children: /* @__PURE__ */ jsx("path", {
                        fillRule: "evenodd",
                        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
                        clipRule: "evenodd",
                      }),
                    }),
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "ml-3",
                    children: [
                      /* @__PURE__ */ jsx("h4", {
                        className: "text-sm font-medium text-blue-800 uppercase tracking-wide mb-2",
                        children: "What to expect",
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className: "text-sm text-blue-700 space-y-1",
                        children: info.map((infoItem, index) => /* @__PURE__ */ jsx("p", { children: infoItem }, index)),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          notes.length > 0 &&
            /* @__PURE__ */ jsx("div", {
              className: "bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex items-start",
                children: [
                  /* @__PURE__ */ jsx("div", {
                    className: "flex-shrink-0",
                    children: /* @__PURE__ */ jsx("svg", {
                      className: "h-5 w-5 text-amber-400",
                      fill: "currentColor",
                      viewBox: "0 0 20 20",
                      children: /* @__PURE__ */ jsx("path", {
                        fillRule: "evenodd",
                        d: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z",
                        clipRule: "evenodd",
                      }),
                    }),
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "ml-3",
                    children: [
                      /* @__PURE__ */ jsx("h4", {
                        className: "text-sm font-medium text-amber-800 uppercase tracking-wide mb-2",
                        children: "Remember",
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className: "text-sm text-amber-700 space-y-1",
                        children: notes.map((note, index) => /* @__PURE__ */ jsx("p", { children: note }, index)),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          steps.length === 0 &&
            info.length === 0 &&
            warnings.length === 0 &&
            notes.length === 0 &&
            test.description &&
            /* @__PURE__ */ jsx("div", {
              className: "bg-gray-50 p-4 rounded-lg",
              children: /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm leading-relaxed", children: test.description }),
            }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col space-y-4",
        children: [
          /* @__PURE__ */ jsxs("label", {
            htmlFor: `pain-${test.id}`,
            className: "font-medium text-lg",
            children: [
              "Pain level:",
              " ",
              /* @__PURE__ */ jsx("span", {
                style: {
                  color: getPainColor(value),
                  fontWeight: "bold",
                  fontSize: "24px",
                  transition: "color 0.3s ease",
                },
                className: animating ? "animate-pulse scale-110" : "",
                children: value,
              }),
            ],
          }),
          /* @__PURE__ */ jsx(Slider, {
            id: `pain-${test.id}`,
            min: 0,
            max: 10,
            step: 1,
            value: [value],
            onValueChange: ([v]) => onChange(v),
            "aria-label": "Pain intensity",
            "data-testid": `slider-${test.id}`,
          }),
        ],
      }),
    ],
  });
}

function MuscleTestForm({ bodyPartId, muscleTests }) {
  const [selections, setSelections] = useState(
    muscleTests.map((test) => ({
      muscleTestId: test.id,
      painIntensity: 0,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [animatingId, setAnimatingId] = useState(null);
  const handlePainChange = useCallback(
    (index, value) => {
      setSelections((prev) => {
        const newSelections = [...prev];
        newSelections[index] = { ...newSelections[index], painIntensity: value };
        return newSelections;
      });
      setAnimatingId(muscleTests[index].id);
      setTimeout(() => setAnimatingId(null), 500);
    },
    [muscleTests]
  );
  const isFormValid = useCallback(() => {
    return selections.some((selection) => selection.painIntensity > 0);
  }, [selections]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("Please set pain intensity for at least one test");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const testsToSubmit = selections.filter((selection) => selection.painIntensity > 0);
      const redirectUrl = `/session/generate?bodyPartId=${bodyPartId}&tests=${encodeURIComponent(
        JSON.stringify(testsToSubmit.map((s) => ({ muscle_test_id: s.muscleTestId, pain_intensity: s.painIntensity })))
      )}`;
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", {
    onSubmit: handleSubmit,
    className: "space-y-8",
    children: [
      error &&
        /* @__PURE__ */ jsx("div", {
          "aria-live": "assertive",
          className: "p-4 bg-red-100 border border-red-400 text-red-700 rounded",
          children: error,
        }),
      /* @__PURE__ */ jsxs("div", {
        className: "p-4 border drop-shadow-md border-gray-200 rounded-lg bg-gray-50",
        children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold mb-2 text-base mb-4", children: "Pain Scale" }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex justify-between mb-4",
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-emerald-500 font-bold", children: "No pain" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-yellow-400 font-bold", children: "Moderate" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-red-500 font-bold", children: "Severe pain" }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "p-2 bg-white border border-dashed border-gray-300 rounded",
            children: [
              /* @__PURE__ */ jsx("p", { className: "mb-1 font-bold", children: "How to use the slider:" }),
              /* @__PURE__ */ jsxs("ol", {
                className: "pl-5 text-sm list-decimal",
                children: [
                  /* @__PURE__ */ jsx("li", { children: "Click and drag the white circle left or right" }),
                  /* @__PURE__ */ jsx("li", { children: "Select a value from 0 (no pain) to 10 (unbearable pain)" }),
                  /* @__PURE__ */ jsx("li", { children: "Rate each muscle test according to your pain level" }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsx("div", {
        className: "space-y-6",
        children: muscleTests.map((test, index) =>
          /* @__PURE__ */ jsx(
            MuscleTestItem,
            {
              test,
              value: selections[index].painIntensity,
              onChange: (v) => handlePainChange(index, v),
              animating: animatingId === test.id,
            },
            test.id
          )
        ),
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex justify-between",
        children: [
          /* @__PURE__ */ jsxs(Button, {
            type: "button",
            variant: "link",
            onClick: () => window.history.back(),
            disabled: isSubmitting,
            size: "lg",
            children: [/* @__PURE__ */ jsx(ChevronLeft, {}), "Back"],
          }),
          /* @__PURE__ */ jsx(Button, {
            type: "submit",
            disabled: isSubmitting || !isFormValid(),
            "aria-busy": isSubmitting,
            size: "lg",
            className: "",
            "data-testid": "muscle-test-next",
            children: isSubmitting ? "Redirecting..." : "Create Session",
          }),
        ],
      }),
    ],
  });
}

const $$Astro$1 = createAstro();
const $$EmptyState = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
    Astro2.self = $$EmptyState;
    const { message, href, label } = Astro2.props;
    return renderTemplate`${maybeRenderHead()}<div class="text-center py-8"> <p>${message}</p> <a${addAttribute(href, "href")} class="text-blue-600 hover:underline mt-2 inline-block"> ${label} </a> </div>`;
  },
  "/Users/monikabieniecka/Downloads/Physia/src/components/ui/EmptyState.astro",
  void 0
);

const MuscleTestDtoSchema = z.object({
  id: z.number(),
  body_part_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
});
async function fetchMuscleTests(bodyPartId, apiBase, init) {
  const list = await fetchArray(`${apiBase}/api/body_parts/${bodyPartId}/muscle_tests`, init);
  return MuscleTestDtoSchema.array().parse(list);
}

const BodyPartIdSchema = z.coerce
  .number({ invalid_type_error: "bodyPartId must be a number" })
  .int({ message: "bodyPartId must be an integer" })
  .positive({ message: "bodyPartId must be a positive integer" });
function validateBodyPartId(bodyPartIdString) {
  return BodyPartIdSchema.parse(bodyPartIdString);
}
const BodyPartDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  created_at: z.string(),
});
const BodyPartDtoArraySchema = z.array(BodyPartDtoSchema);
function validateBodyPartsDto(bodyParts) {
  return BodyPartDtoArraySchema.parse(bodyParts);
}

async function fetchAllBodyParts(origin, init) {
  const bodyPartsRaw = await fetchArray(`${origin}/api/body_parts`, init);
  return validateBodyPartsDto(bodyPartsRaw);
}
async function fetchMuscleTestsAndBodyPartName(bodyPartIdString, origin, init) {
  if (typeof bodyPartIdString === "undefined") {
    throw new Error("A body part ID is required but was not provided in the URL.");
  }
  const bodyPartId = validateBodyPartId(bodyPartIdString);
  const [muscleTests, bodyParts] = await Promise.all([
    fetchMuscleTests(bodyPartId, origin, init),
    // Pass init
    fetchAllBodyParts(origin, init),
    // Pass init
  ]);
  const found = bodyParts.find((bodyPart) => bodyPart.id === bodyPartId);
  return { muscleTests, bodyPartName: found?.name ?? "" };
}

async function getMuscleTestsPageData(astroContext) {
  const { params, request, url } = astroContext;
  const bodyPartId = params.body_part_id;
  const cookie = request.headers.get("cookie");
  const fetchOptions = {
    headers: {
      // Conditionally add the cookie header if it exists.
      ...(cookie ? { cookie } : {}),
    },
  };
  try {
    const { muscleTests, bodyPartName } = await fetchMuscleTestsAndBodyPartName(
      bodyPartId,
      url.origin,
      // Dynamically get the base URL
      fetchOptions
      // Pass the authentication headers down
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

const $$Astro = createAstro();
const prerender = false;
const $$bodyPartId = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
    Astro2.self = $$bodyPartId;
    const { muscleTests, fetchError, pageTitle, bodyPartId, backLink } = await getMuscleTestsPageData(Astro2);
    return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { title: pageTitle }, { default: async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto py-8 px-2 sm:px-4"> ${renderComponent($$result2, "PageHeader", $$PageHeader, { title: pageTitle, subtitle: "Please rate the pain intensity for each test on a scale from 0 (no pain) to 10 (severe pain that prevents work)." })} ${fetchError ? renderTemplate`${renderComponent($$result2, "ErrorAlert", ErrorAlert, { errors: fetchError })}` : muscleTests && muscleTests.length > 0 ? renderTemplate`${renderComponent($$result2, "MuscleTestForm", MuscleTestForm, { "client:load": true, bodyPartId: bodyPartId, muscleTests: muscleTests, "client:component-hydration": "load", "client:component-path": "@/components/muscle-test-selection/MuscleTestForm", "client:component-export": "default" })}` : renderTemplate`${renderComponent($$result2, "EmptyState", $$EmptyState, { message: "No muscle tests available for this body part.", ...backLink, label: backLink.text })}`} </div> ` })}`;
  },
  "/Users/monikabieniecka/Downloads/Physia/src/pages/muscle-tests/[body_part_id].astro",
  void 0
);

const $$file = "/Users/monikabieniecka/Downloads/Physia/src/pages/muscle-tests/[body_part_id].astro";
const $$url = "/muscle-tests/[body_part_id]";

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: $$bodyPartId,
      file: $$file,
      prerender,
      url: $$url,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

const page = () => _page;

export { page };
