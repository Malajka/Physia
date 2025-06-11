import { j as t } from "./jsx-runtime.D3GSbgeI.js";
import { B as b } from "./SubmitButton.DlqxO_LI.js";
import { r as n } from "./index.De2ii6Pa.js";
import "./LinkButton.DkvoeGXY.js";
import { J as p } from "./api.C6upV_NU.js";
import "./index.yBjzXJbu.js";
import "./index.KqMXKjf4.js";
async function g(a) {
  const e = await fetch(`/api/sessions/${a}/feedback`),
    s = await e.json();
  if (!e.ok) throw new Error(s.error || "Failed to load feedback");
  return s;
}
async function h(a, e) {
  const s = await fetch(`/api/sessions/${a}/feedback`, { method: "POST", headers: p, body: JSON.stringify({ rating: e }) }),
    c = await s.json();
  if (!s.ok) throw new Error(c.error || "Failed to submit feedback");
  return c;
}
const N = ({ sessionId: a }) => {
  const [e, s] = n.useState(null),
    [c, k] = n.useState(!0),
    [d, u] = n.useState(!1),
    [l, f] = n.useState(null);
  n.useEffect(() => {
    let i = !0;
    async function r() {
      try {
        const o = await g(a);
        i && s(o.data);
      } catch (o) {
        i && f(o instanceof Error ? o.message : String(o));
      } finally {
        i && k(!1);
      }
    }
    return (
      r(),
      () => {
        i = !1;
      }
    );
  }, [a]);
  const m = n.useCallback(
    async (i) => {
      u(!0), f(null);
      try {
        const r = await h(a, i);
        s(r.data);
      } catch (r) {
        f(r instanceof Error ? r.message : String(r));
      } finally {
        u(!1);
      }
    },
    [a]
  );
  return c
    ? t.jsx("p", { children: "Loading feedback..." })
    : l && !e
      ? t.jsx("p", { className: "text-red-600 mb-2", "data-testid": "feedback-error", children: l })
      : t.jsxs("div", {
          className: "mt-6 text-center",
          "data-testid": "feedback-rating",
          children: [
            t.jsx("p", { className: "mb-2 font-medium", children: "Rate this session:" }),
            l && t.jsx("p", { className: "text-red-600 mb-2", "data-testid": "feedback-error", children: l }),
            t.jsxs("div", {
              className: "flex justify-center space-x-4",
              children: [
                t.jsx(b, {
                  "aria-label": "Rate session as positive",
                  disabled: d,
                  variant: e?.rating === 1 ? "default" : "outline",
                  onClick: () => m(1),
                  "data-testid": "feedback-positive",
                  children: d && e?.rating !== 0 ? "..." : "👍",
                }),
                t.jsx(b, {
                  "aria-label": "Rate session as negative",
                  disabled: d,
                  variant: e?.rating === 0 ? "destructive" : "outline",
                  onClick: () => m(0),
                  "data-testid": "feedback-negative",
                  children: d && e?.rating !== 1 ? "..." : "👎",
                }),
              ],
            }),
            e?.rated_at &&
              t.jsxs("p", {
                className: "mt-2 text-sm text-gray-500",
                "data-testid": "feedback-rated-at",
                children: ["Rated at: ", new Date(e.rated_at).toLocaleString()],
              }),
          ],
        });
};
export { N as FeedbackRating };
