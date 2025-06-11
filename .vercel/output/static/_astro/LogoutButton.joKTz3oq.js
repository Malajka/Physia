import { j as u } from "./jsx-runtime.D3GSbgeI.js";
import { B as c, c as g } from "./SubmitButton.DlqxO_LI.js";
import { r as n } from "./index.De2ii6Pa.js";
import "./LinkButton.DkvoeGXY.js";
import { S as l } from "./Spinner.DSa3dCc_.js";
import "./auth.validator.Db2b3f6L.js";
import { J as m } from "./api.C6upV_NU.js";
import "./index.yBjzXJbu.js";
import "./index.KqMXKjf4.js";
import "./types.B_THrErz.js";
const f = async () => {
    try {
      const o = await fetch("/api/auth/logout", { method: "POST", headers: m });
      if (!o.ok) {
        const r = await o.json();
        return { success: !1, error: r.error || r.message || `Logout failed (status: ${o.status})` };
      }
      return (window.location.href = "/login"), { success: !0 };
    } catch (o) {
      return { success: !1, error: `Logout error: ${o instanceof Error ? o.message : "Unknown error"}` };
    }
  },
  p = () => {
    const [o, r] = n.useState(!1),
      [s, e] = n.useState(null),
      i = n.useCallback(async () => {
        r(!0), e(null);
        try {
          const t = await f();
          !t.success && t.error && (e(t.error), window.alert(t.error));
        } catch (t) {
          const a = t instanceof Error ? t.message : "Unexpected error during logout";
          e(a), window.alert(a);
        } finally {
          r(!1);
        }
      }, []);
    return { isLoggingOut: o, error: s, logout: i };
  },
  b = function ({ className: r = "" }) {
    const { isLoggingOut: s, logout: e } = p();
    return u.jsxs(c, {
      variant: "ghost",
      size: "default",
      onClick: e,
      disabled: s,
      "aria-busy": s,
      className: g(r),
      "data-testid": "logout-button",
      children: [s ? u.jsx(l, { className: "h-4 w-4" }) : null, s ? "Logging out..." : "Log out"],
    });
  };
export { b as LogoutButton };
