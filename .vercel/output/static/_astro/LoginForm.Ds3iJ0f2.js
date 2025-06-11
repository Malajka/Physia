import { j as o } from "./jsx-runtime.D3GSbgeI.js";
import "./index.De2ii6Pa.js";
import { I as a } from "./SubmitButton.DlqxO_LI.js";
import "./LinkButton.DkvoeGXY.js";
import { l as m } from "./auth.validator.Db2b3f6L.js";
import { l as n, A as l, P as d } from "./PasswordField.CF_by7gb.js";
import "./index.yBjzXJbu.js";
import "./index.KqMXKjf4.js";
import "./types.B_THrErz.js";
import "./api.C6upV_NU.js";
const p = async (s) => {
    const r = { email: s.get("email")?.toString() ?? "", password: s.get("password")?.toString() ?? "" },
      e = m.safeParse(r);
    if (!e.success) return { success: !1, error: e.error.errors.map((i) => i.message).join(", ") };
    const t = await n(e.data);
    return t.success && (window.location.href = "/sessions"), t;
  },
  I = function ({ initialError: r = null }) {
    return o.jsxs(l, {
      title: "Log In",
      onSubmit: p,
      submitText: "Log In",
      submitTestId: "login-submit",
      errors: r,
      children: [
        o.jsx(a, { id: "email", name: "email", label: "Email", type: "email", placeholder: "your@email.com", required: !0, "data-testid": "email" }),
        o.jsx(d, { id: "password", name: "password", label: "Password", placeholder: "Your password", required: !0, "data-testid": "password" }),
      ],
    });
  };
export { I as LoginForm };
