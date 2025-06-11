import { j as e } from "./jsx-runtime.D3GSbgeI.js";
import { a as w, B as j } from "./SubmitButton.DlqxO_LI.js";
import { r as x } from "./index.De2ii6Pa.js";
import "./LinkButton.DkvoeGXY.js";
import "./index.yBjzXJbu.js";
import "./index.KqMXKjf4.js";
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const y = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  C = (s) => s.replace(/^([A-Z])|[\s-_]+(\w)/g, (t, a, l) => (l ? l.toUpperCase() : a.toLowerCase())),
  v = (s) => {
    const t = C(s);
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  N = (...s) =>
    s
      .filter((t, a, l) => !!t && t.trim() !== "" && l.indexOf(t) === a)
      .join(" ")
      .trim();
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var k = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const I = x.forwardRef(
  ({ color: s = "currentColor", size: t = 24, strokeWidth: a = 2, absoluteStrokeWidth: l, className: c = "", children: o, iconNode: d, ...r }, m) =>
    x.createElement(
      "svg",
      { ref: m, ...k, width: t, height: t, stroke: s, strokeWidth: l ? (Number(a) * 24) / Number(t) : a, className: N("lucide", c), ...r },
      [...d.map(([n, i]) => x.createElement(n, i)), ...(Array.isArray(o) ? o : [o])]
    )
);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const S = (s, t) => {
  const a = x.forwardRef(({ className: l, ...c }, o) =>
    x.createElement(I, { ref: o, iconNode: t, className: N(`lucide-${y(v(s))}`, `lucide-${s}`, l), ...c })
  );
  return (a.displayName = v(s)), a;
};
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const L = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]],
  R = S("chevron-left", L);
function z(s) {
  if (!s) return { steps: [], info: [], warnings: [], notes: [] };
  const t = [],
    a = [],
    l = [],
    c = [];
  return (
    s
      .split(/###/)
      .filter((d) => d.trim().length > 0)
      .forEach((d) => {
        const r = d
          .trim()
          .split(
            `
`
          )
          .filter((i) => i.trim().length > 0);
        if (r.length === 0) return;
        const m = r[0].toLowerCase().trim(),
          n = r.slice(1);
        if (!["steps", "info", "warning", "note", "instructions", "expect", "important", "remember"].includes(m)) {
          [r[0], ...n].forEach((b) => {
            const p = b.trim();
            p.length > 0 && a.push(p);
          });
          return;
        }
        n.forEach((i) => {
          const b = i.trim();
          if (b.length === 0) return;
          const p = b.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "");
          switch (m) {
            case "steps":
            case "instructions":
              t.push(p);
              break;
            case "info":
            case "expect":
              a.push(p);
              break;
            case "warning":
            case "important":
              l.push(p);
              break;
            case "note":
            case "remember":
              c.push(p);
              break;
          }
        });
      }),
    t.length === 0 &&
      a.length === 0 &&
      l.length === 0 &&
      c.length === 0 &&
      s
        .split(
          `
`
        )
        .filter((r) => r.trim().length > 0)
        .forEach((r) => {
          const m = r
            .trim()
            .replace(/^[-*•]\s*/, "")
            .replace(/^\d+\.\s*/, "");
          m.length > 0 && a.push(m);
        }),
    { steps: t, info: a, warnings: l, notes: c }
  );
}
function E({ test: s, value: t, onChange: a, animating: l }) {
  const c = (n) => (n <= 3 ? "#10b981" : n <= 6 ? "#fbbf24" : "#ef4444"),
    { steps: o, info: d, warnings: r, notes: m } = z(s.description);
  return e.jsxs("div", {
    className: "p-6 border drop-shadow-md rounded-lg bg-white",
    children: [
      e.jsx("h2", { className: "text-lg font-semibold mb-3", "data-testid": `muscle-test-heading-${s.id}`, children: s.name }),
      e.jsxs("div", {
        className: "mb-6 space-y-4",
        children: [
          o.length > 0 &&
            e.jsxs("div", {
              children: [
                e.jsx("h3", { className: "text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide", children: "Instructions" }),
                e.jsx("ol", {
                  className: "space-y-3",
                  children: o.map((n, i) =>
                    e.jsxs(
                      "li",
                      {
                        className: "flex items-start space-x-3",
                        children: [
                          e.jsx("span", {
                            className:
                              "flex-shrink-0 w-7 h-7 bg-gradient-to-br from-[var(--primary)] to-[#16857f] text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5",
                            children: i + 1,
                          }),
                          e.jsx("span", { className: "text-gray-700 text-sm leading-relaxed pt-1", children: n }),
                        ],
                      },
                      i
                    )
                  ),
                }),
              ],
            }),
          r.length > 0 &&
            e.jsx("div", {
              className: "bg-red-50 border-l-4 border-red-400 p-4 rounded-r",
              children: e.jsxs("div", {
                className: "flex items-start",
                children: [
                  e.jsx("div", {
                    className: "flex-shrink-0",
                    children: e.jsx("svg", {
                      className: "h-5 w-5 text-red-400",
                      fill: "currentColor",
                      viewBox: "0 0 20 20",
                      children: e.jsx("path", {
                        fillRule: "evenodd",
                        d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
                        clipRule: "evenodd",
                      }),
                    }),
                  }),
                  e.jsxs("div", {
                    className: "ml-3",
                    children: [
                      e.jsx("h4", { className: "text-sm font-medium text-red-800 uppercase tracking-wide mb-2", children: "Important" }),
                      e.jsx("div", { className: "text-sm text-red-700 space-y-1", children: r.map((n, i) => e.jsx("p", { children: n }, i)) }),
                    ],
                  }),
                ],
              }),
            }),
          d.length > 0 &&
            e.jsx("div", {
              className: "bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r",
              children: e.jsxs("div", {
                className: "flex items-start",
                children: [
                  e.jsx("div", {
                    className: "flex-shrink-0",
                    children: e.jsx("svg", {
                      className: "h-5 w-5 text-blue-400",
                      fill: "currentColor",
                      viewBox: "0 0 20 20",
                      children: e.jsx("path", {
                        fillRule: "evenodd",
                        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
                        clipRule: "evenodd",
                      }),
                    }),
                  }),
                  e.jsxs("div", {
                    className: "ml-3",
                    children: [
                      e.jsx("h4", { className: "text-sm font-medium text-blue-800 uppercase tracking-wide mb-2", children: "What to expect" }),
                      e.jsx("div", { className: "text-sm text-blue-700 space-y-1", children: d.map((n, i) => e.jsx("p", { children: n }, i)) }),
                    ],
                  }),
                ],
              }),
            }),
          m.length > 0 &&
            e.jsx("div", {
              className: "bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r",
              children: e.jsxs("div", {
                className: "flex items-start",
                children: [
                  e.jsx("div", {
                    className: "flex-shrink-0",
                    children: e.jsx("svg", {
                      className: "h-5 w-5 text-amber-400",
                      fill: "currentColor",
                      viewBox: "0 0 20 20",
                      children: e.jsx("path", {
                        fillRule: "evenodd",
                        d: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z",
                        clipRule: "evenodd",
                      }),
                    }),
                  }),
                  e.jsxs("div", {
                    className: "ml-3",
                    children: [
                      e.jsx("h4", { className: "text-sm font-medium text-amber-800 uppercase tracking-wide mb-2", children: "Remember" }),
                      e.jsx("div", { className: "text-sm text-amber-700 space-y-1", children: m.map((n, i) => e.jsx("p", { children: n }, i)) }),
                    ],
                  }),
                ],
              }),
            }),
          o.length === 0 &&
            d.length === 0 &&
            r.length === 0 &&
            m.length === 0 &&
            s.description &&
            e.jsx("div", {
              className: "bg-gray-50 p-4 rounded-lg",
              children: e.jsx("p", { className: "text-gray-700 text-sm leading-relaxed", children: s.description }),
            }),
        ],
      }),
      e.jsxs("div", {
        className: "flex flex-col space-y-4",
        children: [
          e.jsxs("label", {
            htmlFor: `pain-${s.id}`,
            className: "font-medium text-lg",
            children: [
              "Pain level:",
              " ",
              e.jsx("span", {
                style: { color: c(t), fontWeight: "bold", fontSize: "24px", transition: "color 0.3s ease" },
                className: l ? "animate-pulse scale-110" : "",
                children: t,
              }),
            ],
          }),
          e.jsx(w, {
            id: `pain-${s.id}`,
            min: 0,
            max: 10,
            step: 1,
            value: [t],
            onValueChange: ([n]) => a(n),
            "aria-label": "Pain intensity",
            "data-testid": `slider-${s.id}`,
          }),
        ],
      }),
    ],
  });
}
function _({ bodyPartId: s, muscleTests: t }) {
  const [a, l] = x.useState(t.map((h) => ({ muscleTestId: h.id, painIntensity: 0 }))),
    [c, o] = x.useState(!1),
    [d, r] = x.useState(null),
    [m, n] = x.useState(null),
    i = x.useCallback(
      (h, u) => {
        l((g) => {
          const f = [...g];
          return (f[h] = { ...f[h], painIntensity: u }), f;
        }),
          n(t[h].id),
          setTimeout(() => n(null), 500);
      },
      [t]
    ),
    b = x.useCallback(() => a.some((h) => h.painIntensity > 0), [a]),
    p = async (h) => {
      if ((h.preventDefault(), !b())) {
        r("Please set pain intensity for at least one test");
        return;
      }
      r(null), o(!0);
      try {
        const u = a.filter((f) => f.painIntensity > 0),
          g = `/session/generate?bodyPartId=${s}&tests=${encodeURIComponent(JSON.stringify(u.map((f) => ({ muscle_test_id: f.muscleTestId, pain_intensity: f.painIntensity }))))}`;
        window.location.href = g;
      } catch (u) {
        r(u instanceof Error ? u.message : "An error occurred");
      } finally {
        o(!1);
      }
    };
  return e.jsxs("form", {
    onSubmit: p,
    className: "space-y-8",
    children: [
      d && e.jsx("div", { "aria-live": "assertive", className: "p-4 bg-red-100 border border-red-400 text-red-700 rounded", children: d }),
      e.jsxs("div", {
        className: "p-4 border drop-shadow-md border-gray-200 rounded-lg bg-gray-50",
        children: [
          e.jsx("h3", { className: "font-bold mb-2 text-base mb-4", children: "Pain Scale" }),
          e.jsxs("div", {
            className: "flex justify-between mb-4",
            children: [
              e.jsx("span", { className: "text-sm text-emerald-500 font-bold", children: "No pain" }),
              e.jsx("span", { className: "text-sm text-yellow-400 font-bold", children: "Moderate" }),
              e.jsx("span", { className: "text-sm text-red-500 font-bold", children: "Severe pain" }),
            ],
          }),
          e.jsxs("div", {
            className: "p-2 bg-white border border-dashed border-gray-300 rounded",
            children: [
              e.jsx("p", { className: "mb-1 font-bold", children: "How to use the slider:" }),
              e.jsxs("ol", {
                className: "pl-5 text-sm list-decimal",
                children: [
                  e.jsx("li", { children: "Click and drag the white circle left or right" }),
                  e.jsx("li", { children: "Select a value from 0 (no pain) to 10 (unbearable pain)" }),
                  e.jsx("li", { children: "Rate each muscle test according to your pain level" }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "space-y-6",
        children: t.map((h, u) => e.jsx(E, { test: h, value: a[u].painIntensity, onChange: (g) => i(u, g), animating: m === h.id }, h.id)),
      }),
      e.jsxs("div", {
        className: "flex justify-between",
        children: [
          e.jsxs(j, {
            type: "button",
            variant: "link",
            onClick: () => window.history.back(),
            disabled: c,
            size: "lg",
            children: [e.jsx(R, {}), "Back"],
          }),
          e.jsx(j, {
            type: "submit",
            disabled: c || !b(),
            "aria-busy": c,
            size: "lg",
            className: "",
            "data-testid": "muscle-test-next",
            children: c ? "Redirecting..." : "Create Session",
          }),
        ],
      }),
    ],
  });
}
export { _ as default };
