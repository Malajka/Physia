/* empty css                                         */
import { c as createComponent, a as createAstro, b as renderComponent, r as renderTemplate } from '../../chunks/astro/server_DDqvxhIU.mjs';
import 'kleur/colors';
import { j as jsxRuntimeExports, c as cn, B as Button, a as Spinner, $ as $$Layout } from '../../chunks/Layout_Cw_PJNMd.mjs';
import { a as reactExports } from '../../chunks/_@astro-renderers_DziWr-Mn.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DziWr-Mn.mjs';
import 'clsx';
import { J as JSON_HEADERS } from '../../chunks/api_CZk8L_u-.mjs';

function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse rounded-md bg-muted", className), ...props });
}

async function startSessionGeneration(bodyPartId, tests) {
  const response = await fetch("/api/sessions", {
    method: "POST",
    credentials: "include",
    headers: JSON_HEADERS,
    body: JSON.stringify({ body_part_id: bodyPartId, tests })
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
    let message = `Server error: ${response.statusText} ${bodyPartId} ${tests}`;
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

function useSessionGeneration(bodyPartId, tests) {
  const [statusMessage, setStatusMessage] = reactExports.useState("Preparing session data...");
  const [error, setError] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [sessionDetail, setSessionDetail] = reactExports.useState(null);
  const generationInitiatedRef = reactExports.useRef(false);
  const startGeneration = reactExports.useCallback(async () => {
    if (!bodyPartId || !tests?.length) {
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
      const result = await startSessionGeneration(bodyPartId, tests);
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
  }, [bodyPartId, tests]);
  const retry = reactExports.useCallback(async () => {
    generationInitiatedRef.current = false;
    await startGeneration();
  }, [startGeneration]);
  reactExports.useEffect(() => {
    if (generationInitiatedRef.current) {
      return;
    }
    if (!bodyPartId || !tests?.length) {
      return;
    }
    generationInitiatedRef.current = true;
    startGeneration();
  }, [bodyPartId, tests, startGeneration]);
  return {
    statusMessage,
    error,
    retry,
    isLoading,
    sessionDetail,
    startGeneration
  };
}

function ErrorDisplay({ error, retry }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-600 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 mx-auto", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-4", children: "Generation Failed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-4 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: retry, children: "Try Again" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/body-parts", children: "Go Back" }) })
    ] })
  ] });
}
function LoadingSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "w-12 h-12" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-3/4 mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-2/3 mt-1" })
      ] }),
      [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-3/4 mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/4" })
        ] })
      ] }, i))
    ] })
  ] });
}
function InvalidRequestDisplay() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center p-6 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-red-600 mb-4", children: "Invalid Request" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6", children: "Missing required parameters to generate your training plan." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/body-parts", children: "← Go back to body parts selection" }) })
  ] });
}
function SessionGenerationLoading({ bodyPartId, tests }) {
  const { statusMessage, error, retry, isLoading } = useSessionGeneration(bodyPartId, tests);
  if (!bodyPartId || !tests || tests.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(InvalidRequestDisplay, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-6", children: "Generating Your Training Plan" }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", "aria-live": "polite", className: "text-lg text-center mb-8 max-w-md", children: statusMessage }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {})
    ] }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorDisplay, { error, retry }) : null
  ] });
}

const $$Astro = createAstro();
const prerender = false;
const $$Generate = createComponent(($$result, $$props, $$slots) => {
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
      if (Array.isArray(parsedTests) && parsedTests.every(
        (test) => typeof test.muscle_test_id === "number" && typeof test.pain_intensity === "number" && test.pain_intensity >= 0 && test.pain_intensity <= 10
      )) {
        tests = parsedTests;
      }
    }
  } catch {
  }
  const pageTitle = "Generating Training Plan";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "SessionGenerationLoading", SessionGenerationLoading, { "bodyPartId": bodyPartId || 0, "tests": tests, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/session/SessionGenerationLoading", "client:component-export": "SessionGenerationLoading" })} ` })}`;
}, "/Users/monikabieniecka/Physia/src/pages/session/generate.astro", void 0);

const $$file = "/Users/monikabieniecka/Physia/src/pages/session/generate.astro";
const $$url = "/session/generate";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Generate,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
