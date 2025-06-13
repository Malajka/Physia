import { j as n } from "./jsx-runtime.BMmiHB9I.js";
import { R as i } from "./index.Cj_FO6QK.js";
const d = "inline-block rounded px-4 py-2 text-center transition-colors",
  v = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:opacity-80",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:opacity-80",
    text: "text-[var(--color-gray-800)] hover:underline",
    "nav-link": "text-[var(--gray-text)] hover:text-[var(--primary)] hover:underline text-lg font-bold",
    "nav-primary":
      "px-6 py-3 bg-[var(--primary)] border border-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg rounded-xl shadow-md text-center hover:opacity-80",
    "nav-secondary":
      "px-6 py-3 bg-[var(--card)] border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--light-green)] font-bold text-lg rounded-xl shadow-md text-center hover:opacity-80",
    "nav-muted": "px-6 py-3 text-[var(--gray-text)] hover:text-[var(--primary)] hover:underline text-lg font-bold",
  },
  x = i.memo(function ({ href: r, children: t, variant: e = "primary", className: a = "", "data-testid": o }) {
    return n.jsx("a", { href: r, className: `${d} ${v[e]} ${a}`, "data-testid": o, children: t });
  });
x.displayName = "LinkButton";
export { x as LinkButton };
