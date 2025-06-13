import { j as r } from "./jsx-runtime.BMmiHB9I.js";
import { r as p, A as x, P as u } from "./PasswordField.DJKX4pBH.js";
import { r as o } from "./index.Cj_FO6QK.js";
import { I as h } from "./SubmitButton.D_2OGRIf.js";
import { LinkButton as d } from "./LinkButton.BhR02P1x.js";
import { r as b } from "./auth.validator.Cf-Y9Meb.js";
import "./api.C6upV_NU.js";
import "./index.DqldKjai.js";
const w = async (a) => {
    const i = {
        email: a.get("email")?.toString() ?? "",
        password: a.get("password")?.toString() ?? "",
        passwordConfirm: a.get("passwordConfirm")?.toString() ?? "",
      },
      t = b.safeParse(i);
    if (!t.success) return { success: !1, error: t.error.errors.map((e) => e.message).join(", ") };
    try {
      const e = await p({ email: t.data.email, password: t.data.password });
      return e.success
        ? { success: !0, registrationSuccess: !0 }
        : typeof e.error == "string" && e.error.includes("|EMAIL_ALREADY_EXISTS")
          ? {
              success: !1,
              error: 'This email is already registered. Would you like to <a href="/login" class="text-blue-600 hover:underline">log in</a> instead?',
            }
          : { success: !1, error: typeof e.error == "string" ? e.error.split("|")[0] : "Registration failed" };
    } catch (e) {
      return { success: !1, error: e instanceof Error ? e.message : "An unexpected error occurred" };
    }
  },
  y = () => {
    const [a, i] = o.useState(!1),
      [t, e] = o.useState(null),
      [n, c] = o.useState(!1),
      m = o.useCallback(async (f) => {
        c(!0), e(null);
        try {
          const s = await w(f);
          return s.success && s.registrationSuccess ? i(!0) : !s.success && s.error && e(s.error), s;
        } catch (s) {
          const l = s instanceof Error ? s.message : "Unexpected error during registration";
          return e(l), { success: !1, error: l };
        } finally {
          c(!1);
        }
      }, []),
      g = o.useCallback(() => {
        i(!1), e(null), c(!1);
      }, []);
    return { registrationSuccess: a, error: t, isLoading: n, submitRegistration: m, resetForm: g };
  },
  F = function ({ initialError: i = null }) {
    const { registrationSuccess: t, error: e, submitRegistration: n } = y();
    return t
      ? r.jsxs("div", {
          className: "text-center py-8",
          children: [
            r.jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Registration Successful!" }),
            r.jsxs("div", {
              className: "bg-green-50 border border-green-200 rounded-lg p-6 mb-6",
              children: [
                r.jsx("p", { className: "text-green-800 mb-4 text-xl", children: r.jsx("strong", { children: "Thank you for registering!" }) }),
                r.jsx("p", { className: "text-green-700 mb-4 text-lg", children: "Now you can start creating your own sessions and muscle tests!" }),
                r.jsx(d, {
                  href: "/body-parts",
                  variant: "nav-primary",
                  className: "text-lg block w-full",
                  "data-testid": "create-new-session-link",
                  children: "Create First Session",
                }),
              ],
            }),
          ],
        })
      : r.jsxs(r.Fragment, {
          children: [
            r.jsxs(x, {
              title: "Create Account",
              onSubmit: n,
              submitText: "Register",
              errors: e || i,
              submitTestId: "register-submit",
              children: [
                r.jsx(h, {
                  id: "email",
                  name: "email",
                  label: "Email",
                  type: "email",
                  placeholder: "your@email.com",
                  required: !0,
                  "data-testid": "register-email",
                }),
                r.jsx(u, {
                  id: "password",
                  name: "password",
                  label: "Password",
                  placeholder: "Min. 8 characters",
                  required: !0,
                  "data-testid": "register-password",
                }),
                r.jsx(u, {
                  id: "passwordConfirm",
                  name: "passwordConfirm",
                  label: "Confirm Password",
                  placeholder: "Confirm your password",
                  required: !0,
                  "data-testid": "register-passwordConfirm",
                }),
                r.jsx("p", { className: "text-sm text-gray-600 mt-2", children: "Password must be at least 8 characters long." }),
              ],
            }),
            r.jsx("div", {
              className: "text-center mt-4",
              children: r.jsxs("p", {
                className: "text-sm text-gray-600",
                children: [
                  "Already have an account?",
                  " ",
                  r.jsx(d, { href: "/login", variant: "text", className: "text-gray-600 underline", children: "Log in here" }),
                ],
              }),
            }),
          ],
        });
  };
export { F as RegisterForm };
