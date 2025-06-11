import { j as e } from "./jsx-runtime.D3GSbgeI.js";
import "./index.yBjzXJbu.js";
function x(a) {
  if (!a) return { warmup: [], workout: [], cooldown: [], general: [] };
  const c = [],
    o = [],
    i = [],
    l = [];
  return (
    a
      .split(/###/)
      .filter((m) => m.trim().length > 0)
      .forEach((m) => {
        const t = m
          .trim()
          .split(
            `
`
          )
          .filter((g) => g.trim().length > 0);
        if (t.length === 0) return;
        const s = t[0].toLowerCase().trim(),
          h = t.slice(1);
        if (!["warmup", "workout", "cooldown", "warm-up", "cool-down"].includes(s)) {
          [t[0], ...h].forEach((d) => {
            const n = d.trim();
            n.length > 0 && l.push(n);
          });
          return;
        }
        h.forEach((g) => {
          const d = g.trim();
          if (d.length === 0) return;
          const n = d.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "");
          switch (s) {
            case "warmup":
            case "warm-up":
              c.push(n);
              break;
            case "workout":
              o.push(n);
              break;
            case "cooldown":
            case "cool-down":
              i.push(n);
              break;
          }
        });
      }),
    c.length === 0 &&
      o.length === 0 &&
      i.length === 0 &&
      a
        .split(
          `
`
        )
        .filter((t) => t.trim().length > 0)
        .forEach((t) => {
          const s = t
            .trim()
            .replace(/^[-*•]\s*/, "")
            .replace(/^\d+\.\s*/, "");
          s.length > 0 && l.push(s);
        }),
    { warmup: c, workout: o, cooldown: i, general: l }
  );
}
function b({ trainingPlan: a, exerciseImagesMap: c }) {
  const o = { warmup: [], workout: [], cooldown: [] };
  a.exercises.forEach((l) => {
    const r = x(l.description);
    r.warmup.length > 0 && o.warmup.push({ exercise: l, content: r.warmup }),
      (r.workout.length > 0 || r.general.length > 0) && o.workout.push({ exercise: l, content: r.workout.length > 0 ? r.workout : r.general }),
      r.cooldown.length > 0 && o.cooldown.push({ exercise: l, content: r.cooldown });
  });
  const i = ({ title: l, sectionData: r, bgColor: m = "bg-white", accentColor: t = "blue" }) =>
    e.jsxs("div", {
      className: `${m} rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] min-h-[400px]`,
      children: [
        e.jsx("h3", { className: "text-2xl font-bold text-gray-800 mb-6 text-center pb-3 border-b border-gray-200", children: l }),
        r.length > 0
          ? e.jsx("div", {
              className: "space-y-4",
              children: r.map(({ exercise: s, content: h }, g) =>
                e.jsxs(
                  "div",
                  {
                    "data-testid": `session-exercise-${s.id}`,
                    className: "border border-gray-200 rounded-lg p-4 bg-gray-50",
                    children: [
                      e.jsx("h4", { className: "font-semibold text-lg text-gray-800 mb-2", children: s.name }),
                      e.jsxs("div", {
                        className: "flex flex-wrap gap-4 mb-3 text-sm",
                        children: [
                          e.jsxs("span", { className: "bg-[var(--primary)] text-white px-2 py-1 rounded-md", children: [s.sets, " sets"] }),
                          e.jsxs("span", { className: "bg-[var(--primary)] text-white px-2 py-1 rounded-md", children: [s.reps, " reps"] }),
                          e.jsxs("span", { className: "bg-gray-600 text-white px-2 py-1 rounded-md", children: [s.rest_time_seconds, "s rest"] }),
                        ],
                      }),
                      e.jsx("div", {
                        className: `${t === "orange" ? "bg-orange-50 border-l-4 border-orange-400" : t === "blue" ? "bg-blue-50 border-l-4 border-blue-400" : "bg-green-50 border-l-4 border-green-400"} p-3 rounded-r`,
                        children: e.jsx("ul", {
                          className: `text-sm ${t === "orange" ? "text-orange-700" : t === "blue" ? "text-blue-700" : "text-green-700"} space-y-1`,
                          children: h.map((d, n) =>
                            e.jsxs(
                              "li",
                              {
                                className: "flex items-start",
                                children: [
                                  e.jsx("span", {
                                    className: `w-2 h-2 ${t === "orange" ? "bg-orange-400" : t === "blue" ? "bg-blue-400" : "bg-green-400"} rounded-full mt-2 mr-2 flex-shrink-0`,
                                  }),
                                  d,
                                ],
                              },
                              n
                            )
                          ),
                        }),
                      }),
                      s.notes &&
                        e.jsx("div", {
                          className: "mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r",
                          children: e.jsx("p", { className: "text-sm text-amber-800 italic", children: s.notes }),
                        }),
                      c[s.id]?.length > 0 &&
                        e.jsx("div", {
                          className: "mt-3",
                          children: e.jsx("div", {
                            className: "flex flex-wrap gap-2",
                            children: c[s.id].map((d, n) =>
                              e.jsx(
                                "img",
                                { src: d.file_path, alt: s.name, className: "w-20 h-20 object-cover rounded-lg border border-gray-200" },
                                n
                              )
                            ),
                          }),
                        }),
                    ],
                  },
                  `${s.id}-${g}`
                )
              ),
            })
          : e.jsx("div", {
              className: "flex items-center justify-center h-32 text-gray-500",
              children: e.jsx("p", { children: "No exercises for this section" }),
            }),
      ],
    });
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        className: "text-center mb-8",
        children: [
          e.jsx("h2", { "data-testid": "session-title", className: "text-3xl font-bold text-gray-800 mb-4", children: a.title }),
          e.jsx("p", {
            "data-testid": "session-description",
            className: "text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed",
            children: a.description,
          }),
        ],
      }),
      a.warnings &&
        a.warnings.length > 0 &&
        e.jsx("div", {
          className: "bg-red-50 border-l-4 border-red-400 p-4 rounded-r mb-6",
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
                  e.jsx("h4", {
                    className: "text-sm font-medium text-red-800 uppercase tracking-wide mb-2",
                    children: "Important Safety Information",
                  }),
                  e.jsx("ul", {
                    className: "text-sm text-red-700 space-y-1",
                    children: a.warnings.map((l, r) =>
                      e.jsxs(
                        "li",
                        {
                          className: "flex items-start",
                          children: [e.jsx("span", { className: "w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0" }), l],
                        },
                        r
                      )
                    ),
                  }),
                ],
              }),
            ],
          }),
        }),
      e.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
        children: [
          e.jsx(i, { title: "Warm-Up", sectionData: o.warmup, bgColor: "bg-gradient-to-br from-orange-50 to-orange-100", accentColor: "orange" }),
          e.jsx(i, { title: "Workout", sectionData: o.workout, bgColor: "bg-gradient-to-br from-blue-50 to-blue-100", accentColor: "blue" }),
          e.jsx(i, { title: "Cool-Down", sectionData: o.cooldown, bgColor: "bg-gradient-to-br from-green-50 to-green-100", accentColor: "green" }),
        ],
      }),
    ],
  });
}
export { b as TrainingPlanDisplay };
