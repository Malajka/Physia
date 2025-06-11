import { j as a } from "./jsx-runtime.D3GSbgeI.js";
import { r as l } from "./index.De2ii6Pa.js";
import { c as v, B as h } from "./SubmitButton.DlqxO_LI.js";
import "./LinkButton.DkvoeGXY.js";
import { o as w, s as p, n as y, c as S, a as C } from "./types.B_THrErz.js";
import "./index.yBjzXJbu.js";
import "./index.KqMXKjf4.js";
function T(e) {
  return e.toLowerCase().replace(/\s+/g, "-");
}
const k =
    "relative overflow-hidden w-full h-48 rounded-lg border flex items-end justify-center p-4 text-center font-medium text-lg uppercase drop-shadow-md transform transition-all ease-in-out duration-500 active:scale-[0.98] hover:scale-[1.02] cursor-pointer",
  N = "bg-primary border-primary text-white hover:bg-light-green hover:text-primary",
  R = "bg-gray-50 border-gray-200 text-black hover:bg-white";
function _({ id: e, name: t, selected: r, onSelect: s }) {
  if (!t) return null;
  const o = T(t),
    d = { backgroundImage: `url(${`/images/body-parts/${o}.png`})` };
  return a.jsxs("button", {
    type: "button",
    onClick: () => s(e),
    "aria-pressed": r,
    "aria-label": `Select ${t}`,
    style: d,
    className: `${k} ${r ? N : R} bg-cover sm:bg-contain bg-center bg-no-repeat`,
    "data-testid": `body-part-${o}`,
    children: [
      !r && a.jsx("div", { className: "absolute inset-0 bg-[var(--background)] opacity-35", "aria-hidden": "true" }),
      a.jsx("span", {
        className: `relative z-10 px-2 py-1 rounded ${r ? "bg-[var(--background)] text-primary" : "bg-[var(--primary)] text-white"}`,
        children: t,
      }),
    ],
  });
}
const B = l.memo(_);
function D({ children: e, className: t = "" }) {
  return a.jsx("div", { className: `p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded mb-4 ${t}`, children: e });
}
const $ = ({ open: e, onClose: t, title: r, children: s, footer: o }) => (
    l.useEffect(() => {
      function n(d) {
        d.key === "Escape" && t();
      }
      return e && document.addEventListener("keydown", n), () => document.removeEventListener("keydown", n);
    }, [e, t]),
    e
      ? a.jsxs("div", {
          className: "fixed inset-0 z-50 flex items-center justify-center",
          children: [
            a.jsx("div", {
              className: "absolute inset-0 bg-black/50",
              onClick: t,
              onKeyDown: (n) => {
                (n.key === "Enter" || n.key === " ") && (n.preventDefault(), t());
              },
              role: "button",
              tabIndex: 0,
              "aria-label": "Close modal",
            }),
            a.jsxs("div", {
              role: "dialog",
              "aria-modal": "true",
              className: v("relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full"),
              children: [
                r && a.jsx("h2", { className: "text-lg font-semibold mb-4", children: r }),
                a.jsx("div", { className: "mb-4", children: s }),
                o && a.jsx("div", { className: "flex justify-end gap-2", children: o }),
              ],
            }),
          ],
        })
      : null
  ),
  A = ({ open: e, onAccept: t, text: r }) =>
    a.jsx($, {
      open: e,
      onClose: () => {},
      title: "Medical Disclaimer",
      footer: a.jsx("div", {
        className: "flex justify-between items-center w-full",
        children: a.jsx(h, { onClick: t, "data-testid": "accept-disclaimer", className: "flex justify-center mx-auto", children: "I Accept" }),
      }),
      children: a.jsx("div", { className: "whitespace-pre-line text-sm mb-4", children: r }),
    });
async function P(e, t) {
  const r = await fetch(e, t);
  let s;
  try {
    s = await r.json();
  } catch {
    throw new Error(`Invalid JSON in response from ${e}`);
  }
  if (!r.ok) {
    const o = s.error ?? `Failed to fetch ${e} (status ${r.status})`;
    throw new Error(o);
  }
  return s;
}
async function L(e, t) {
  const r = await P(e, { signal: t });
  return Array.isArray(r) ? r : r.data;
}
w({ id: y(), body_part_id: y(), name: p(), description: p().nullable(), created_at: p() });
S.number({ invalid_type_error: "bodyPartId must be a number" })
  .int({ message: "bodyPartId must be an integer" })
  .positive({ message: "bodyPartId must be a positive integer" });
const H = w({ id: y().int().positive(), name: p(), created_at: p() }),
  F = C(H);
function O(e) {
  return F.parse(e);
}
async function M(e, { signal: t } = {}) {
  const r = await L(`${e}/api/body_parts`, t);
  return O(r);
}
const I = () => (typeof window < "u" ? window.location.origin : ""),
  j = (e) => typeof e == "string" && e.length > 0,
  x = (e) => e === null,
  E = (e, t) => !e && j(t);
function z(e, t) {
  switch (t.type) {
    case "FETCH_START":
      return { ...e, loading: !0, error: null };
    case "FETCH_SUCCESS":
      return { data: t.payload, loading: !1, error: null };
    case "FETCH_ERROR":
      return { data: [], loading: !1, error: t.error };
    case "FETCH_ABORT":
      return { ...e, loading: !1 };
    case "RESET":
      return { data: [], loading: !1, error: null };
    default:
      return e;
  }
}
const J = (e, t) => ({ data: [], loading: E(e, t), error: null });
function K({ baseUrl: e = I(), skipInitialFetch: t = !1, disclaimerAccepted: r = void 0 } = {}) {
  const s = l.useRef(null),
    [o, n] = l.useReducer(z, J(t, r)),
    d = l.useCallback(() => {
      s.current?.abort();
    }, []),
    u = l.useCallback(() => {
      d();
      const c = new AbortController();
      return (s.current = c), c;
    }, [d]),
    f = l.useCallback(async () => {
      if (x(r)) {
        n({ type: "RESET" });
        return;
      }
      if (!j(r)) return;
      const c = u();
      n({ type: "FETCH_START" });
      try {
        const i = await M(e, { signal: c.signal });
        if (c.signal.aborted) {
          n({ type: "FETCH_ABORT" });
          return;
        }
        n({ type: "FETCH_SUCCESS", payload: i });
      } catch (i) {
        if (i instanceof DOMException && i.name === "AbortError") {
          n({ type: "FETCH_ABORT" });
          return;
        }
        const m = i instanceof Error ? i.message : "An unexpected error occurred";
        n({ type: "FETCH_ERROR", error: m });
      }
    }, [e, r, u]);
  return (
    l.useEffect(
      () => (
        E(t, r) ? f() : x(r) && n({ type: "RESET" }),
        () => {
          d();
        }
      ),
      [f, t, r, d]
    ),
    { bodyParts: o.data, loading: o.loading, error: o.error, refetch: f }
  );
}
function U() {
  const [e, t] = l.useState(""),
    [r, s] = l.useState(null),
    [o, n] = l.useState(!0),
    [d, u] = l.useState(null);
  l.useEffect(() => {
    async function c() {
      try {
        const i = await fetch("/api/disclaimers", { credentials: "same-origin" });
        if (!i.ok) throw new Error(i.statusText);
        const m = await i.json();
        t(m.text), s(m.accepted_at ?? null);
      } catch (i) {
        u(i instanceof Error ? i.message : String(i));
      } finally {
        n(!1);
      }
    }
    c();
  }, []);
  const f = l.useCallback(async () => {
    try {
      const c = await fetch("/api/disclaimers", { method: "POST", credentials: "same-origin" });
      if (!c.ok) throw new Error(c.statusText);
      const i = await c.json();
      s(i.accepted_at);
    } catch (c) {
      u(c instanceof Error ? c.message : String(c));
    }
  }, []);
  return { disclaimerText: e, acceptedAt: r, loading: o, error: d, accept: f };
}
function q() {
  const [e, t] = l.useState(null),
    r = l.useCallback((s) => {
      t((o) => (o === s ? null : s));
    }, []);
  return { selected: e, toggle: r };
}
function G({ selectedBodyPartId: e, className: t = "", onNavigate: r }) {
  const s = e == null,
    o = l.useCallback(() => {
      e != null && (r ? r(e) : (window.location.pathname = `/muscle-tests/${e}`));
    }, [e, r]);
  return a.jsx(h, {
    type: "button",
    onClick: o,
    disabled: s,
    "aria-disabled": s,
    size: "lg",
    className: t,
    title: s ? "Select a body part to continue" : "Go to muscle tests",
    "data-testid": "body-part-next",
    children: "Next",
  });
}
function g({ text: e, error: t = !1, children: r }) {
  return a.jsxs("div", { className: `text-center py-8 ${t ? "text-red-600" : ""}`, children: [a.jsx("p", { children: e }), r] });
}
function te() {
  const { disclaimerText: e, acceptedAt: t, loading: r, error: s, accept: o } = U(),
    { bodyParts: n, loading: d, error: u, refetch: f } = K({ disclaimerAccepted: t }),
    { selected: c, toggle: i } = q(),
    m = l.useCallback((b) => i(b), [i]);
  return r
    ? a.jsx(g, { text: "Loading disclaimer..." })
    : s
      ? a.jsx(g, { text: `Disclaimer Error: ${s}`, error: !0 })
      : t
        ? d
          ? a.jsx(g, { text: "Loading body areas..." })
          : u
            ? a.jsx(g, {
                text: `Error loading body parts: ${u}`,
                error: !0,
                children: a.jsx("button", { onClick: f, className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Retry" }),
              })
            : !n || n.length === 0
              ? a.jsx(g, { text: "No body areas available." })
              : a.jsxs("div", {
                  className: "space-y-8",
                  children: [
                    a.jsx(D, { children: "Select max 1 area. Click a selected area again to deselect." }),
                    a.jsx("div", {
                      className: "grid grid-cols-2 gap-[15px] justify-items-center",
                      children: n.map((b) => a.jsx(B, { id: b.id, name: b.name, selected: c === b.id, onSelect: m }, b.id)),
                    }),
                    a.jsx("div", { className: "mt-8 flex justify-end", children: a.jsx(G, { selectedBodyPartId: c }) }),
                  ],
                })
        : a.jsx(A, { open: !0, onAccept: o, text: e || "Loading disclaimer text..." });
}
export { te as default };
