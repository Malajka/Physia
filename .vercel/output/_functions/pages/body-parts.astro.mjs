import {
  c as createComponent,
  a as createAstro,
  r as renderComponent,
  b as renderTemplate,
  m as maybeRenderHead,
} from "../chunks/astro/server_CfAXeihZ.mjs";
import "kleur/colors";
import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { memo, useRef, useReducer, useCallback, useEffect, useState } from "react";
import { c as cn, B as Button, $ as $$Layout } from "../chunks/Layout_BWdJMhQf.mjs";
import "clsx";
import { a as fetchAllBodyParts, $ as $$PageHeader } from "../chunks/PageHeader_RbsskymR.mjs";
export { renderers } from "../renderers.mjs";

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

const baseClass =
  "relative overflow-hidden w-full h-48 rounded-lg border flex items-end justify-center p-4 text-center font-medium text-lg uppercase drop-shadow-md transform transition-all ease-in-out duration-500 active:scale-[0.98] hover:scale-[1.02] cursor-pointer";
const selectedClass = "bg-primary border-primary text-white hover:bg-light-green hover:text-primary";
const unselectedClass = "bg-gray-50 border-gray-200 text-black hover:bg-white";
function BodyPartButtonComponent({ id, name, selected, onSelect }) {
  if (!name) return null;
  const slug = slugify(name);
  const imageSrc = `/images/body-parts/${slug}.png`;
  const style = {
    backgroundImage: `url(${imageSrc})`,
  };
  return /* @__PURE__ */ jsxs("button", {
    type: "button",
    onClick: () => onSelect(id),
    "aria-pressed": selected,
    "aria-label": `Select ${name}`,
    style,
    className: `${baseClass} ${selected ? selectedClass : unselectedClass} bg-cover sm:bg-contain bg-center bg-no-repeat`,
    "data-testid": `body-part-${slug}`,
    children: [
      !selected && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[var(--background)] opacity-35", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx("span", {
        className: `relative z-10 px-2 py-1 rounded ${selected ? "bg-[var(--background)] text-primary" : "bg-[var(--primary)] text-white"}`,
        children: name,
      }),
    ],
  });
}
const BodyPartButton = memo(BodyPartButtonComponent);

function InfoBar({ children, className = "" }) {
  return /* @__PURE__ */ jsx("div", { className: `p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded mb-4 ${className}`, children });
}

const Modal = ({ open, onClose, title, children, footer }) => {
  React.useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center",
    children: [
      /* @__PURE__ */ jsx("div", {
        className: "absolute inset-0 bg-black/50",
        onClick: onClose,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        },
        role: "button",
        tabIndex: 0,
        "aria-label": "Close modal",
      }),
      /* @__PURE__ */ jsxs("div", {
        role: "dialog",
        "aria-modal": "true",
        className: cn("relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full"),
        children: [
          title && /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: title }),
          /* @__PURE__ */ jsx("div", { className: "mb-4", children }),
          footer && /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: footer }),
        ],
      }),
    ],
  });
};

const DisclaimerModal = ({ open, onAccept, text }) =>
  /* @__PURE__ */ jsx(Modal, {
    open,
    onClose: () => {},
    title: "Medical Disclaimer",
    footer: /* @__PURE__ */ jsx("div", {
      className: "flex justify-between items-center w-full",
      children: /* @__PURE__ */ jsx(Button, {
        onClick: onAccept,
        "data-testid": "accept-disclaimer",
        className: "flex justify-center mx-auto",
        children: "I Accept",
      }),
    }),
    children: /* @__PURE__ */ jsx("div", { className: "whitespace-pre-line text-sm mb-4", children: text }),
  });

const getDefaultBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
};
const isValidDisclaimerAccepted = (disclaimerAccepted) => {
  return typeof disclaimerAccepted === "string" && disclaimerAccepted.length > 0;
};
const isDisclaimerRejected = (disclaimerAccepted) => {
  return disclaimerAccepted === null;
};
const shouldInitiallyLoad = (skipInitialFetch, disclaimerAccepted) => {
  return !skipInitialFetch && isValidDisclaimerAccepted(disclaimerAccepted);
};
function bodyPartsReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { data: [], loading: false, error: action.error };
    case "FETCH_ABORT":
      return { ...state, loading: false };
    case "RESET":
      return { data: [], loading: false, error: null };
    default:
      return state;
  }
}
const createInitialState = (skipInitialFetch, disclaimerAccepted) => ({
  data: [],
  loading: shouldInitiallyLoad(skipInitialFetch, disclaimerAccepted),
  error: null,
});
function useBodyParts({ baseUrl = getDefaultBaseUrl(), skipInitialFetch = false, disclaimerAccepted = void 0 } = {}) {
  const abortControllerRef = useRef(null);
  const [state, dispatch] = useReducer(bodyPartsReducer, createInitialState(skipInitialFetch, disclaimerAccepted));
  const abortPreviousRequest = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);
  const createNewAbortController = useCallback(() => {
    abortPreviousRequest();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  }, [abortPreviousRequest]);
  const fetchBodyParts = useCallback(async () => {
    if (isDisclaimerRejected(disclaimerAccepted)) {
      dispatch({ type: "RESET" });
      return;
    }
    if (!isValidDisclaimerAccepted(disclaimerAccepted)) {
      return;
    }
    const controller = createNewAbortController();
    dispatch({ type: "FETCH_START" });
    try {
      const bodyParts = await fetchAllBodyParts(baseUrl, { signal: controller.signal });
      if (controller.signal.aborted) {
        dispatch({ type: "FETCH_ABORT" });
        return;
      }
      dispatch({ type: "FETCH_SUCCESS", payload: bodyParts });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        dispatch({ type: "FETCH_ABORT" });
        return;
      }
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch({ type: "FETCH_ERROR", error: errorMessage });
    }
  }, [baseUrl, disclaimerAccepted, createNewAbortController]);
  useEffect(() => {
    if (shouldInitiallyLoad(skipInitialFetch, disclaimerAccepted)) {
      fetchBodyParts();
    } else if (isDisclaimerRejected(disclaimerAccepted)) {
      dispatch({ type: "RESET" });
    }
    return () => {
      abortPreviousRequest();
    };
  }, [fetchBodyParts, skipInitialFetch, disclaimerAccepted, abortPreviousRequest]);
  return {
    bodyParts: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchBodyParts,
  };
}

function useDisclaimer() {
  const [disclaimerText, setDisclaimerText] = useState("");
  const [acceptedAt, setAcceptedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function loadDisclaimer() {
      try {
        const res = await fetch("/api/disclaimers", { credentials: "same-origin" });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setDisclaimerText(data.text);
        setAcceptedAt(data.accepted_at ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    loadDisclaimer();
  }, []);
  const accept = useCallback(async () => {
    try {
      const res = await fetch("/api/disclaimers", { method: "POST", credentials: "same-origin" });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setAcceptedAt(data.accepted_at);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);
  return { disclaimerText, acceptedAt, loading, error, accept };
}

function useSingleSelection() {
  const [selected, setSelected] = useState(null);
  const toggle = useCallback((value) => {
    setSelected((prev) => (prev === value ? null : value));
  }, []);
  return { selected, toggle };
}

function NavigationNextButton({ selectedBodyPartId, className = "", onNavigate }) {
  const isDisabled = selectedBodyPartId == null;
  const handleNext = useCallback(() => {
    if (selectedBodyPartId != null) {
      if (onNavigate) {
        onNavigate(selectedBodyPartId);
      } else {
        window.location.pathname = `/muscle-tests/${selectedBodyPartId}`;
      }
    }
  }, [selectedBodyPartId, onNavigate]);
  return /* @__PURE__ */ jsx(Button, {
    type: "button",
    onClick: handleNext,
    disabled: isDisabled,
    "aria-disabled": isDisabled,
    size: "lg",
    className,
    title: isDisabled ? "Select a body part to continue" : "Go to muscle tests",
    "data-testid": "body-part-next",
    children: "Next",
  });
}

function StatusMessage({ text, error = false, children }) {
  return /* @__PURE__ */ jsxs("div", {
    className: `text-center py-8 ${error ? "text-red-600" : ""}`,
    children: [/* @__PURE__ */ jsx("p", { children: text }), children],
  });
}
function BodyPartSelector() {
  const { disclaimerText, acceptedAt, loading: discLoading, error: discError, accept } = useDisclaimer();
  const { bodyParts, loading: bpLoading, error: bpError, refetch } = useBodyParts({ disclaimerAccepted: acceptedAt });
  const { selected: selectedBodyPartId, toggle } = useSingleSelection();
  const handleSelect = useCallback((id) => toggle(id), [toggle]);
  if (discLoading) return /* @__PURE__ */ jsx(StatusMessage, { text: "Loading disclaimer..." });
  if (discError) return /* @__PURE__ */ jsx(StatusMessage, { text: `Disclaimer Error: ${discError}`, error: true });
  if (!acceptedAt) {
    return /* @__PURE__ */ jsx(DisclaimerModal, { open: true, onAccept: accept, text: disclaimerText || "Loading disclaimer text..." });
  }
  if (bpLoading) return /* @__PURE__ */ jsx(StatusMessage, { text: "Loading body areas..." });
  if (bpError)
    return /* @__PURE__ */ jsx(StatusMessage, {
      text: `Error loading body parts: ${bpError}`,
      error: true,
      children: /* @__PURE__ */ jsx("button", {
        onClick: refetch,
        className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
        children: "Retry",
      }),
    });
  if (!bodyParts || bodyParts.length === 0) {
    return /* @__PURE__ */ jsx(StatusMessage, { text: "No body areas available." });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-8",
    children: [
      /* @__PURE__ */ jsx(InfoBar, { children: "Select max 1 area. Click a selected area again to deselect." }),
      /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-2 gap-[15px] justify-items-center",
        children: bodyParts.map((bodyPart) =>
          /* @__PURE__ */ jsx(
            BodyPartButton,
            {
              id: bodyPart.id,
              name: bodyPart.name,
              selected: selectedBodyPartId === bodyPart.id,
              onSelect: handleSelect,
            },
            bodyPart.id
          )
        ),
      }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-end", children: /* @__PURE__ */ jsx(NavigationNextButton, { selectedBodyPartId }) }),
    ],
  });
}

const $$Astro = createAstro();
const prerender = false;
const $$BodyParts = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
    Astro2.self = $$BodyParts;
    const {
      data: { session },
    } = await Astro2.locals.supabase.auth.getSession();
    if (!session) {
      return Astro2.redirect("/login");
    }
    return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { title: "Select Body Area - Physia" }, { default: async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto py-8 px-2 sm:px-4"> ${renderComponent($$result2, "PageHeader", $$PageHeader, { title: "Select Body Area", subtitle: "Please select the body area where you experience overload-related muscle pain:" })} ${renderComponent($$result2, "BodyPartSelector", BodyPartSelector, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/body-part-selection/BodyPartSelector", "client:component-export": "default" })} </div> ` })}`;
  },
  "/Users/monikabieniecka/Downloads/Physia/src/pages/body-parts.astro",
  void 0
);

const $$file = "/Users/monikabieniecka/Downloads/Physia/src/pages/body-parts.astro";
const $$url = "/body-parts";

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: $$BodyParts,
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
