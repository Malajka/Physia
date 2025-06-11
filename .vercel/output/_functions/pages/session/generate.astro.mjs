import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate } from "../../chunks/astro/server_CfAXeihZ.mjs";
import "kleur/colors";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { c as cn, B as Button, a as Spinner, $ as $$Layout } from "../../chunks/Layout_BWdJMhQf.mjs";
import { useState, useRef, useCallback, useEffect } from "react";
import "clsx";
import { J as JSON_HEADERS } from "../../chunks/api_CZk8L_u-.mjs";
export { renderers } from "../../renderers.mjs";

function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("animate-pulse rounded-md bg-muted", className), ...props });
}

async function startSessionGeneration(bodyPartId, tests) {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ body_part_id: bodyPartId, tests }),
  });
  if (response.status === 403) {
    const data2 = await response.json();
    if (data2.error === "disclaimer_required") {
      window.location.href = "/disclaimer";
      return { error: "disclaimer_required" };
    }
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = `Server error: ${response.statusText}`;
    if (errorData.error) {
      const errObj = errorData.error;
      if (typeof errObj.details?.reason === "string") {
        message = errObj.details.reason;
      } else {
        const parts = [];
        if (errObj.code) parts.push(errObj.code);
        if (errObj.message) parts.push(errObj.message);
        if (parts.length > 0) {
          message = parts.join(": ");
        } else {
          message = JSON.stringify(errObj);
        }
      }
    }
    throw new Error(message);
  }
  const data = await response.json();
  return { data, id: data.id };
}

function useSessionGeneration(paramsOrBodyPartId, tests) {
  const { bodyPartId, tests: testsArray } =
    typeof paramsOrBodyPartId === "object" ? paramsOrBodyPartId : { bodyPartId: paramsOrBodyPartId, tests: tests || [] };
  const [statusMessage, setStatusMessage] = useState("Preparing session data...");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionDetail, setSessionDetail] = useState(null);
  const generationInitiatedRef = useRef(false);
  const startGeneration = useCallback(async () => {
    if (!bodyPartId || !testsArray?.length) {
      setError("Invalid request parameters");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setStatusMessage("Initializing session...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatusMessage("Sending data to the AI engine...");
      const result = await startSessionGeneration(bodyPartId, testsArray);
      setStatusMessage("Finalizing your personalized training plan...");
      if (!result.data) {
        throw new Error("No session data received");
      }
      if (!result.id) {
        throw new Error("Invalid session data received (missing ID)");
      }
      setSessionDetail(result.data);
      window.location.href = `/sessions/${result.id}`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [bodyPartId, testsArray]);
  const retry = useCallback(async () => {
    generationInitiatedRef.current = false;
    await startGeneration();
  }, [startGeneration]);
  useEffect(() => {
    if (generationInitiatedRef.current) {
      return;
    }
    if (!bodyPartId || !testsArray?.length) {
      return;
    }
    generationInitiatedRef.current = true;
    startGeneration();
  }, [bodyPartId, testsArray, startGeneration]);
  return {
    statusMessage,
    error,
    retry,
    isLoading,
    sessionDetail,
    startGeneration,
  };
}

function ErrorDisplay({ error, retry }) {
  return /* @__PURE__ */ jsxs("div", {
    className: "text-center",
    children: [
      /* @__PURE__ */ jsx("div", {
        className: "text-red-600 mb-4",
        children: /* @__PURE__ */ jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-12 w-12 mx-auto",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
          }),
        }),
      }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Generation Failed" }),
      /* @__PURE__ */ jsx("p", { className: "mb-6", children: error }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col md:flex-row gap-4 justify-center",
        children: [
          /* @__PURE__ */ jsx(Button, { onClick: retry, children: "Try Again" }),
          /* @__PURE__ */ jsx(Button, {
            variant: "outline",
            asChild: true,
            children: /* @__PURE__ */ jsx("a", { href: "/body-parts", children: "Go Back" }),
          }),
        ],
      }),
    ],
  });
}
function LoadingSkeleton() {
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx(Spinner, { className: "w-12 h-12" }) }),
      /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-full",
            children: [
              /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-3/4 mb-2" }),
              /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-full" }),
              /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-2/3 mt-1" }),
            ],
          }),
          [1, 2, 3].map((i) =>
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "border rounded-lg p-4",
                children: [
                  /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-3/4 mb-2" }),
                  /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-full mb-3" }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex justify-between",
                    children: [/* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-1/4" }), /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-1/4" })],
                  }),
                ],
              },
              i
            )
          ),
        ],
      }),
    ],
  });
}
function InvalidRequestDisplay() {
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col items-center justify-center p-6 text-center",
    children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-red-600 mb-4", children: "Invalid Request" }),
      /* @__PURE__ */ jsx("p", { className: "mb-6", children: "Missing required parameters to generate your training plan." }),
      /* @__PURE__ */ jsx(Button, {
        asChild: true,
        children: /* @__PURE__ */ jsx("a", { href: "/body-parts", children: "← Go back to body parts selection" }),
      }),
    ],
  });
}
function SessionGenerationLoading({ bodyPartId, tests }) {
  const { statusMessage, error, retry, isLoading, startGeneration } = useSessionGeneration(bodyPartId, tests);
  useEffect(() => {}, [startGeneration, bodyPartId, tests]);
  if (!bodyPartId || !tests || tests.length === 0) {
    return /* @__PURE__ */ jsx(InvalidRequestDisplay, {});
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col items-center justify-center p-6",
    children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-6", children: "Generating Your Training Plan" }),
      isLoading
        ? /* @__PURE__ */ jsxs(Fragment, {
            children: [
              /* @__PURE__ */ jsx("p", {
                role: "status",
                "aria-live": "polite",
                className: "text-lg text-center mb-8 max-w-md",
                children: statusMessage,
              }),
              /* @__PURE__ */ jsx(LoadingSkeleton, {}),
            ],
          })
        : error
          ? /* @__PURE__ */ jsx(ErrorDisplay, { error, retry })
          : null,
    ],
  });
}

const $$Astro = createAstro();
const prerender = false;
const $$Generate = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
    Astro2.self = $$Generate;
    const { searchParams } = new URL(Astro2.request.url);
    const bodyPartIdParam = searchParams.get("bodyPartId");
    const testsParam = searchParams.get("tests");
    let bodyPartId;
    let tests = [];
    try {
      if (bodyPartIdParam) {
        bodyPartId = parseInt(bodyPartIdParam, 10);
        if (isNaN(bodyPartId)) {
          bodyPartId = void 0;
        }
      }
      if (testsParam) {
        const decodedTests = decodeURIComponent(testsParam);
        const parsedTests = JSON.parse(decodedTests);
        if (
          Array.isArray(parsedTests) &&
          parsedTests.every(
            (test) =>
              typeof test.muscle_test_id === "number" &&
              typeof test.pain_intensity === "number" &&
              test.pain_intensity >= 0 &&
              test.pain_intensity <= 10
          )
        ) {
          tests = parsedTests;
        }
      }
    } catch {}
    const pageTitle = "Generating Training Plan";
    return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { title: pageTitle }, { default: async ($$result2) => renderTemplate` ${renderComponent($$result2, "SessionGenerationLoading", SessionGenerationLoading, { bodyPartId: bodyPartId || 0, tests: tests, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/session/SessionGenerationLoading", "client:component-export": "SessionGenerationLoading" })} ` })}`;
  },
  "/Users/monikabieniecka/Downloads/Physia/src/pages/session/generate.astro",
  void 0
);

const $$file = "/Users/monikabieniecka/Downloads/Physia/src/pages/session/generate.astro";
const $$url = "/session/generate";

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: $$Generate,
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
